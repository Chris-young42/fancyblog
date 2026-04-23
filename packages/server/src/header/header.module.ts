import { Module } from '@nestjs/common';
import { HeaderController } from './header.controller';
import { HeaderService } from './header.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [HeaderController],
  providers: [HeaderService, PrismaService],
})
export class HeaderModule {}
