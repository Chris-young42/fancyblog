import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiConsumes } from '@nestjs/swagger';

const coverStorage = diskStorage({
  destination: './uploads/covers',
  filename: (req, file, callback) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueName);
  },
});

@ApiTags('管理')
@Controller('admin')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取统计数据' })
  getStats() {
    return this.adminService.getStats();
  }

  @Post('upload/cover')
  @ApiOperation({ summary: '上传封面图片' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: coverStorage }))
  uploadCover(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/covers/${file.filename}` };
  }

  // User management
  @Get('users')
  @ApiOperation({ summary: '获取所有用户' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({ summary: '获取单个用户' })
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUser(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: '更新用户' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nickname?: string; role?: string; isActive?: boolean },
  ) {
    return this.adminService.updateUser(id, body);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: '删除用户' })
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  // Post management
  @Get('posts')
  @ApiOperation({ summary: '获取所有文章' })
  getAllPosts() {
    return this.adminService.getAllPosts();
  }

  @Get('posts/:id')
  @ApiOperation({ summary: '获取单篇文章' })
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getPost(id);
  }

  @Put('posts/:id')
  @ApiOperation({ summary: '更新文章' })
  updatePost(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updatePost(id, body);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: '删除文章' })
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePost(id);
  }

  @Post('posts')
  @ApiOperation({ summary: '创建文章' })
  createPost(
    @Body()
    body: {
      title: string;
      content: string;
      summary?: string;
      coverImage?: string;
      category: string;
      tags: string[];
      published: boolean;
      authorId: number;
    },
  ) {
    return this.adminService.createPost(body);
  }

  // Comment management
  @Get('comments')
  @ApiOperation({ summary: '获取所有评论' })
  getAllComments() {
    return this.adminService.getAllComments();
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: '删除评论' })
  deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteComment(id);
  }
}
