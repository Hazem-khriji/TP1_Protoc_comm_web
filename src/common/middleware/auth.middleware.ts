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
    const authorizationHeaderRaw: string | string[] | undefined =
      req.headers.authorization;
    const legacyHeaderRaw: string | string[] | undefined =
      req.headers['auth-user'];
    const authHeader =
      this.extractHeaderValue(authorizationHeaderRaw) ??
      this.extractHeaderValue(legacyHeaderRaw);

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
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
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractHeaderValue(
    header: string | string[] | undefined,
  ): string | undefined {
    if (Array.isArray(header)) {
      return header[0];
    }

    return header;
  }
}
