import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as jwt_simple from "jwt-simple";
const bcrypt = require("bcrypt")

import env from "src/envs";

import { User } from 'src/proto/user';
import { Session } from 'src/proto/session';

const BCRYPT_ROUNDS = env.BCRYPT_ROUNDS;
const JWT_SECRET = env.JWT_SECRET;

function encodeSession(secretKey: string, data: Omit<Session, "iat" | "exp">): string {
  const algorithm: jwt_simple.TAlgorithm = 'HS512';
  const iat = Date.now() / 1000;
  const exp = iat + env.JWT_REFRESH_TOKEN_TIMEOUT_SECEONDS;
  const payload: Session = {
    ...data,
    iat,
    exp,
  };
  return jwt_simple.encode(payload, secretKey, algorithm);
}

@Injectable()
export class UserService {
  async getUserInfo(id: number): Promise<User> {
    const result = await User.findOneBy({ id: id });
    if (!result) {
      throw new BadRequestException('user not found');
    }
    result.password = ''; // Do not return password
    return result;
  }

  async register(input: { name: string; email: string; password: string }): Promise<{message: string}> {
    if (await User.findOneBy({ name: input.name })) {
      throw new BadRequestException('user already exists');
    }

    // TODO Verify email
    const password_hash: string = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = new User();
    user.name = input.name;
    user.metadata = {
      email: input.email,
      motto: '',
    };
    user.password = password_hash;
    user.register_time = new Date();
    await user.save();
    
    return {
      'message': 'register successfully',  
    };
  }

  async login(user: { name: string; password: string }): Promise<{message: string, refresh_token: string}> {
    const user_in_db = await User.findOneBy({ name: user.name });
    if (!user_in_db) {
      throw new BadRequestException('user not found');
    }
    const is_password_correct = bcrypt.compareSync(user.password, user_in_db.password);
    if (!is_password_correct) {
      throw new BadRequestException('password incorrect');
    }
    const refresh_token = encodeSession(JWT_SECRET, {
      userId: user_in_db.id,
      userName: user_in_db.name,
    });
    return {
      'message': 'login successfully',
      'refresh_token': refresh_token,
    };
  }

}
