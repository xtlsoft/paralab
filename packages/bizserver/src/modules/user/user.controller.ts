import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { IsEmail, Length, IsNotEmpty, MinLength } from 'class-validator';

import { UserService } from './user.service';
import { User } from 'src/proto/user';

export class RegisterDTO {
  @Length(3, 20)
  name: string;

  @IsEmail()  
  email: string;

  @MinLength(6)
  password: string;
}

export class LoginDTO {
  @Length(3, 20)
  name: string;
  
  @IsNotEmpty()
  password: string;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserInfo(@Param('id') id: number): Promise<User> {
    return await this.userService.getUserInfo(id);
  }

  @Post('register')
  async register(@Body() user: RegisterDTO): Promise<{message: string}> {
    return await this.userService.register(user);
  }

  @Post('login')
  async login(@Body() user: LoginDTO): Promise<{message: string, refresh_token: string}> {
    return await this.userService.login(user);
  }
}
