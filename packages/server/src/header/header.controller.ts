import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { HeaderService } from './header.service';
import {
  CreateHeaderDto,
  UpdateHeaderDto,
  QueryHeaderDto,
} from './dto/header.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('导航管理')
@Controller('header')
export class HeaderController {
  constructor(private readonly headerService: HeaderService) {}

  @Get()
  @ApiOperation({ summary: '获取导航列表（前台）' })
  async getActiveHeaders() {
    return this.headerService.getActiveHeaders();
  }

  @Get('admin')
  @ApiOperation({ summary: '获取所有导航（管理端）' })
  async getAllHeaders(@Query() query: QueryHeaderDto) {
    return this.headerService.getAllHeaders(query);
  }

  @Post()
  @ApiOperation({ summary: '创建导航' })
  async create(@Body() createDto: CreateHeaderDto) {
    return this.headerService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新导航' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHeaderDto,
  ) {
    return this.headerService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除导航' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.headerService.delete(id);
  }
}
