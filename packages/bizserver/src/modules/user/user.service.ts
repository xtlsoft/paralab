import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
const bcrypt = require("bcrypt")

import env from "src/envs";

import { UserEntity } from 'src/entity/user';
import { User, RoleMask, ROLE_USER } from '@paralab/proto';
import { redisClient } from 'src/redis';

const BCRYPT_ROUNDS = env.BCRYPT_ROUNDS;

// RefreshTokenInfo is the struct we store in Redis
interface RefreshTokenInfo {
  userId: number
  userName: string
  userRoles: RoleMask
  iat: number // issued at, unix timestamp in seconds
  exp: number // expired at, unix timestamp in seconds
  // In the future we may add more fields here, like the IP address of the client
  // or the device name of the client, etc.
}

export interface AccessToken {
  userId: number,
  userName: string,
  userRoles: RoleMask
}

@Injectable()
export class UserService {
  async getUserInfo(id: number): Promise<User> {
    const result = await UserEntity.findOneBy({ id: id });
    if (!result) {
      throw new BadRequestException('user not found');
    }
    result.password = ''; // Do not return password
    return result;
  }

  async register(input: { userName: string; email: string; password: string }): Promise<{message: string}> {
    if (await UserEntity.findOneBy({ name: input.userName })) {
      throw new BadRequestException('user already exists');
    }

    // TODO Verify email
    const password_hash: string = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = new UserEntity();
    user.name = input.userName;
    user.registerTime = new Date();
    user.password = password_hash;
    user.roleMask = ROLE_USER;
    user.metadata = {
      email: input.email,
      motto: '',
    };
    await user.save();
    
    return {
      'message': 'register successfully',  
    };
  }

  async login(user: { userName: string; password: string }): Promise<{refresh_token: string}> {
    // First we verify the user name and password
    const user_in_db = await UserEntity.findOneBy({ name: user.userName });
    if (!user_in_db) {
      throw new BadRequestException('user not found');
    }
    const is_password_correct = bcrypt.compareSync(user.password, user_in_db.password);
    if (!is_password_correct) {
      throw new BadRequestException('password incorrect');
    }
    // If the credentials are correct, we generate a refresh token
    const refresh_token = await randomBytes(32).toString('base64url');
    // And then insert the refresh token into redis
    const refresh_token_info: RefreshTokenInfo = {
      userId: user_in_db.id,
      userName: user_in_db.name,
      userRoles: user_in_db.roleMask,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + env.JWT_REFRESH_TOKEN_TIMEOUT_SECEONDS
    };
    // TODO find a way to delete expired refresh tokens
    redisClient.hSet('refresh_tokens', refresh_token, JSON.stringify(refresh_token_info));
    return {
      'refresh_token': refresh_token
    };
  }

  async getAccessToken(refresh_token: string | null): Promise<{access_token: string}> {
    // First we validate the refresh token
    if (!refresh_token) {
      throw new BadRequestException('refresh token not found');
    }
    const refresh_token_info_str: string = await redisClient.hGet('refresh_tokens', refresh_token);
    if (!refresh_token_info_str) {
      throw new BadRequestException('refresh token invalid');
    }
    const refresh_token_info: RefreshTokenInfo = JSON.parse(refresh_token_info_str);
    if (refresh_token_info.exp < Math.floor(Date.now() / 1000)) {
      throw new BadRequestException('refresh token expired');
    }
    // Then we generate a new access token
    const access_token: AccessToken = {
      userId: refresh_token_info.userId,
      userName: refresh_token_info.userName,
      userRoles: refresh_token_info.userRoles,
    };
    const access_token_str = jwt.sign(access_token, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_TOKEN_TIMEOUT_SECEONDS,
    });
    return {
      'access_token': access_token_str
    };
  }

}


