import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  Delete,
  NotFoundException,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UsersService } from '../services/users.service';
import { Serialize } from '../../interceptors/serialize.interceptors';
import { UserDto } from '../dtos/user.dto';
import { AuthService } from '../services/auth.service';
import { currentUser } from '../decorators/current-user.decorator';
import { User } from '../entity/user.entity';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  // @Get('/currentuser')
  // currentUser(@Session() session: any) {
  //   return this.userService.findOne(session.userId);
  // }

  @Get('/currentuser')
  @UseGuards(AuthGuard)
  currentUser(@currentUser() user: User) {
    return user;
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;

    return user;
  }

  @Post('/signin')
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;

    return user;
  }

  @Post('/signout')
  @UseGuards(AuthGuard)
  signOut(@Session() session: any) {
    session.userId = null;
  }

  //@UseInterceptors(new SerializeInterceptor(UserDto))
  //@Serialize(UserDto)
  @Get('/:id')
  async findUserById(@Param('id') id: number) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  @Get()
  findByEmail(@Query('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: number, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
