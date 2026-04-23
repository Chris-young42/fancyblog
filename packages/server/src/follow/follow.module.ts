import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PrismaService, FollowService],
  controllers: [FollowController],
  exports: [FollowService],
})
export class FollowModule {}
