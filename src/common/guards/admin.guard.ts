import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRole = request.userRole;

    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can access this resource');
    }

    return true;
  }
}
