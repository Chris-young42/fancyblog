import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtTokenService } from '../../auth/jwt.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('缺少访问令牌');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtTokenService.verifyAccessToken(token);
      if (payload.role !== 'admin') {
        throw new ForbiddenException('需要管理员权限');
      }
      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('访问令牌无效或已过期');
    }
  }
}
