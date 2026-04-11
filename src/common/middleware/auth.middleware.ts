import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';

type AuthTokenPayload = {
  userId?: number;
  sub?: number;
  role?: string;
};

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeaderRaw = req.headers['auth-user'];
    const authHeader = Array.isArray(authHeaderRaw)
      ? authHeaderRaw[0]
      : authHeaderRaw;

    if (!authHeader) {
      throw new UnauthorizedException('Missing auth-user header');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') ?? 'dev-secret';
      const payload = verify(token, secret) as AuthTokenPayload;
      const userId = payload.userId ?? payload.sub;

      if (!userId) {
        throw new UnauthorizedException('Invalid token: missing userId');
      }

      req.userId = userId;
      req.userRole = payload.role;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
