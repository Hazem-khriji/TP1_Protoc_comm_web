import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRole = String(request.userRole ?? '').toUpperCase();
    const configuredRoles = this.configService
      .get<string>('ADMIN_ROLES')
      ?.split(',')
      .map((role) => role.trim().toUpperCase())
      .filter(Boolean);
    const adminRoles = configuredRoles?.length
      ? configuredRoles
      : [UserRole.ADMIN];

    if (!adminRoles.includes(userRole)) {
      throw new ForbiddenException('Only admins can access this resource');
    }

    return true;
  }
}
