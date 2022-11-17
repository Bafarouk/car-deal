import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async singup(email: string, password: string) {
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
}
