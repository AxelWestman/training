import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtUser } from '../../database/database.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = (request.cookies as { session?: string } | undefined)
      ?.session;

    if (!token) {
      throw new UnauthorizedException('No session token');
    }

    try {
      const payload = this.jwtService.verify<JwtUser>(token);
      (request as Request & { user: JwtUser }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
