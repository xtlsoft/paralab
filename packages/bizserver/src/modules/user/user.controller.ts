import { Controller, Get, Post, Put, Param, Body, Res, Req, ParseIntPipe } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { IsEmail, Length, IsNotEmpty, MinLength, IsNumber } from 'class-validator';
import { Request, Response } from 'express';
import { ApiProperty } from '@nestjs/swagger';

import { UserService, AccessToken } from './user.service';
import { Roles } from './authorization.service';
import { User, ROLE_USER, RoleMask, ROLE_SYS_ADMIN } from '@paralab/proto';
import env from "src/envs";

class RegisterDTO {
  @Length(3, 20)
  @ApiProperty()
  userName: string;

  @IsEmail()  
  @ApiProperty()
  email: string;

  @MinLength(6)
  @ApiProperty()
  password: string;
}

class LoginDTO {
  @Length(3, 20)
  @ApiProperty()
  userName: string;
  
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

class UpdateUserBasicInfoDTO {
  @IsEmail()
  @ApiProperty()
  email: string;

  @Length(0, 1000)
  @ApiProperty()
  motto: string;
}

class UpdateUserPasswordDTO {
  @MinLength(6)
  @ApiProperty()
  old_password: string;

  @MinLength(6)
  @ApiProperty()
  new_password: string;
}

class UpdateUserRolesDTO {
  @IsNumber()
  @ApiProperty()
  new_roles: RoleMask;
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
  ): Promise<{message: string, access_token: string, user_info: User}> {
    const login_result = await this.userService.login(user);
    const refresh_token = login_result.refresh_token;
    const access_token = await this.userService.getAccessToken(refresh_token);
    response.cookie('s:refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: env.JWT_REFRESH_TOKEN_TIMEOUT_SECEONDS * 1000,
      signed: true,
      sameSite: "strict",
      // secure: true
    });
    const user_info = await this.userService.getUserInfo(login_result.userId);
    return {
      'message': 'login successfully',
      'access_token': access_token,
      'user_info': user_info,
    };
  }

  // GET /user/access_token: Get a new access token by the refresh token in the cookie
  @Get('access_token')
  async getAccessToken(@Req() request: Request): Promise<{access_token: string}> {
    const refresh_token = request.signedCookies['s:refresh_token'];
    const access_token = await this.userService.getAccessToken(refresh_token);
    return {
      'access_token': access_token,
    };
  }

  // GET /user/logout: Logout
  @Get('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }
  ) response: Response): Promise<{message: string}> {
    this.userService.invalidateRefreshToken(request.signedCookies['s:refresh_token']);
    response.clearCookie('s:refresh_token');
    return {
      'message': 'logout successfully',
    };
  }

  // GET /user/:id: Get user info by id
  @Get(':id')
  async getUserInfo(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
    return await this.userService.getUserInfo(id);
  }

  // PUT /user/:id/basic_info: Change user's basic info
  @Put(':id/basic_info')
  @Roles([ROLE_USER])
  async updateUserInfo(
    @Param('id', new ParseIntPipe()) userId: number,
    @Body() user: UpdateUserBasicInfoDTO,
    @Req() request: Request
  ): Promise<{}> {
    let access_token_info = request['user_info'] as AccessToken;
    // Permission check: Only when: 1) The user is SYS_ADMIN 2) The user is
    // updating his/her own info, we allow the update
    if (!(access_token_info.userRoles & ROLE_SYS_ADMIN) && access_token_info.userId !== userId) {
      throw new UnauthorizedException();
    }
    await this.userService.updateUserInfo(userId, user);
    return {};
  }

  // PUT /user/:id/password: Update user's password
  @Put(':id/password')
  @Roles([ROLE_USER])
  async updateUserPassword(
    @Param('id', new ParseIntPipe()) userId: number,
    @Body() dto: UpdateUserPasswordDTO,
    @Req() request: Request
  ): Promise<{}> {
    let access_token_info = request['user_info'] as AccessToken;
    // Permission check: Only when: 1) The user is SYS_ADMIN 2) The user is
    // updating his/her own info, we allow the update
    if (!(access_token_info.userRoles & ROLE_SYS_ADMIN) && access_token_info.userId !== userId) {
      throw new UnauthorizedException();
    }
    await this.userService.updateUserPassword(userId, dto);
    return {};
  }

  // PUT /user/:id/role_mask: Update user's role_mask
  @Put(':id/role_mask')
  @Roles([ROLE_SYS_ADMIN])
  async updateUserRoles(
    @Param('id', new ParseIntPipe()) userId: number,
    @Body() dto: UpdateUserRolesDTO,
    @Req() request: Request
  ): Promise<{}> {
    if (!request.signedCookies['s:refresh_token']) {
      throw new UnauthorizedException();
    }
    // We've forced the user to have `ROLE_SYS_ADMIN` role.
    await this.userService.updateUserRoles(userId ,request.signedCookies['s:refresh_token'],  dto.new_roles);
    return {};
  }
}
