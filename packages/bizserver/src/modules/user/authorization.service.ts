import { CanActivate, Injectable, ExecutionContext, SetMetadata } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from "express"
import * as jwt from 'jsonwebtoken';

import { RoleMask } from '@paralab/proto';
import { AccessToken } from './user.service';
import env from "src/envs";

// A decorator to specify the required privilege of a route handler
export const Roles = Reflector.createDecorator<RoleMask[]>();

// A guard that checks whether the user has required privilege
// Copied from https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles
    const requiredRoles = this.reflector.get(Roles, context.getHandler());
    if (!requiredRoles) {
      // If no roles required, then we allow the request
      return true;
    }
    // Otherwise we first retrieve the JWT token
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    // Now we have the token. We verify it and get the payload
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AccessToken;
      if (!payload || !payload.userName || !payload.userId || !payload.userRoles) {
        throw new UnauthorizedException();
      }
      // Check whether the user has required privilege
      for (const role of requiredRoles) {
        if (!(payload.userRoles & role)) {
          throw new UnauthorizedException();
        }
      }
      // Store the payload (user_info) to the request object so we can use
      // it inside the controller
      request['user_info'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
