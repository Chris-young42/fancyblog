import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHeaderDto,
  UpdateHeaderDto,
  QueryHeaderDto,
} from './dto/header.dto';
import { HeaderNav } from '@prisma/client';

@Injectable()
export class HeaderService {
  constructor(private prisma: PrismaService) {}

  async getActiveHeaders(): Promise<HeaderNav[]> {
    return this.prisma.headerNav.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getAllHeaders(query: QueryHeaderDto) {
    const { page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.headerNav.findMany({
        orderBy: { order: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.headerNav.count(),
    ]);

    return { data, total, page, pageSize };
  }

  async create(dto: CreateHeaderDto): Promise<HeaderNav> {
    return this.prisma.headerNav.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateHeaderDto): Promise<HeaderNav> {
    return this.prisma.headerNav.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.headerNav.delete({ where: { id } });
  }
}
