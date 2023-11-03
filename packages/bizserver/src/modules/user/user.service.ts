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

// AccessToken is the info we store in the access token JWT
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

  async login(user: { userName: string; password: string }): Promise<{userId: number, refresh_token: string}> {
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
      'userId': user_in_db.id,
      'refresh_token': refresh_token
    };
  }

  async getAccessToken(refresh_token: string | null): Promise<string> {
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
    return access_token_str;
  }

  async invalidateRefreshToken(refresh_token: string) {
    // First we validate the refresh token
    if (!refresh_token) {
      throw new BadRequestException('refresh token not found');
    }
    const refresh_token_info_str: string = await redisClient.hGet('refresh_tokens', refresh_token);
    if (!refresh_token_info_str) {
      throw new BadRequestException('refresh token invalid');
    }
    const refresh_token_info: RefreshTokenInfo = JSON.parse(refresh_token_info_str);
    // Then we delete the refresh token from redis
    redisClient.hDel('refresh_tokens', refresh_token);
  }

  async updateUserInfo(userId: number, new_data: {email: string, motto: string}) {
    const user_in_db = await UserEntity.findOneBy({ id: userId });
    if (!user_in_db) {
      throw new BadRequestException('user not found');
    }
    user_in_db.metadata.email = new_data.email;
    user_in_db.metadata.motto = new_data.motto;
    await user_in_db.save();
  }

  async updateUserPassword(userId: number, dto: {old_password: string, new_password: string}) {
    const user_in_db = await UserEntity.findOneBy({ id: userId });
    if (!user_in_db) {
      throw new BadRequestException('user not found');
    }
    // Check whether the old password is correct
    const is_password_correct = bcrypt.compareSync(dto.old_password, user_in_db.password);
    if (!is_password_correct) {
      throw new BadRequestException('password incorrect');
    }
    // Update the password
    const password_hash: string = await bcrypt.hash(dto.new_password, BCRYPT_ROUNDS);
    user_in_db.password = password_hash;
    await user_in_db.save();
  }

  async updateUserRoles(userId: number, refresh_token: string, new_roles: RoleMask) {
    const user_in_db = await UserEntity.findOneBy({ id: userId });
    if (!user_in_db) {
      throw new BadRequestException('user not found');
    }
    user_in_db.roleMask = new_roles;
    // WARNING Since we've cached the user's role mask in Redis, the user whose
    // roles are modified needs to re-login to make the new roles take effect.
    // TODO Find a way to force the user to re-login
    await user_in_db.save();
  }   
}


