import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class JwtTokenService {
  constructor(
    private jwtService: NestJwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(userId: number, email: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
  }

  decodeAccessToken(token: string) {
    const decoded = this.jwtService.decode(token);
    return decoded as { sub: number; email: string; role: string; exp: number };
  }
}
