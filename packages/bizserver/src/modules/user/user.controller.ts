import { Controller, Get, Post, Param, Body, Res, Req, ParseIntPipe } from '@nestjs/common';
import { IsEmail, Length, IsNotEmpty, MinLength } from 'class-validator';
import { Request, Response } from 'express';

import { UserService } from './user.service';
import { Roles } from './authorization.service';
import { User, ROLE_USER } from '@paralab/proto';
import env from "src/envs";

class RegisterDTO {
  @Length(3, 20)
  userName: string;

  @IsEmail()  
  email: string;

  @MinLength(6)
  password: string;
}

class LoginDTO {
  @Length(3, 20)
  userName: string;
  
  @IsNotEmpty()
  password: string;
}

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST /user/register: Register a new user
  @Post('register')
  async register(@Body() user: RegisterDTO): Promise<{message: string}> {
    return await this.userService.register(user);
  }

  // POST /user/login: Login with username and password
  // Return a refresh token in the cookie, as well as an access token in the response body
  @Post('login')
  async login(
    @Body() user: LoginDTO,
    @Res({ passthrough: true }) response: Response
  ): Promise<{message: string, access_token: string}> {
    const refresh_token = (await this.userService.login(user)).refresh_token;
    const access_token = await this.userService.getAccessToken(refresh_token);
    response.cookie('s:refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: env.JWT_REFRESH_TOKEN_TIMEOUT_SECEONDS * 1000,
      signed: true,
      sameSite: "strict",
      // secure: true
    });
    return {
      'message': 'login successfully',
      'access_token': access_token.access_token,
    };
  }

  // GET /user/access_token: Get a new access token by the refresh token in the cookie
  @Get('access_token')
  async getAccessToken(@Req() request: Request): Promise<{access_token: string}> {
    const refresh_token = request.signedCookies['s:refresh_token'];
    return await this.userService.getAccessToken(refresh_token);
  }

  // GET /user/:id: Get user info by id
  @Get(':id')
  async getUserInfo(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
    return await this.userService.getUserInfo(id);
  }
}
