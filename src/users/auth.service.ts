import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.userService.findByEmail(email);
    if (users.length) {
      throw new BadRequestException('Email in use');
    }

    //hash the password
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    const passwordHashed = hash.toString('hex') + '.' + salt;

    // save the user
    const user = await this.userService.create(email, passwordHashed);
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('email not found');
    }

    const [storedHash, salt] = user.password.split('.');
    const hash = (await scrypt(password, salt, 64)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Wrong credentials');
    }

    return user;
  }
}
