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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const coverStorage = diskStorage({
  destination: './uploads/covers',
  filename: (req, file, callback) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueName);
  },
});

@ApiTags('用户')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Post('upload/cover')
  @ApiOperation({ summary: '上传封面图片' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: coverStorage }))
  uploadCover(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/covers/${file.filename}` };
  }

  @Get('posts')
  @ApiOperation({ summary: '获取我的文章' })
  getMyPosts(@Request() req: any) {
    return this.userService.getMyPosts(req.user.userId);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: '获取我的文章详情' })
  getMyPost(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.userService.getMyPost(req.user.userId, id);
  }

  @Post('posts')
  @ApiOperation({ summary: '创建文章' })
  createPost(
    @Request() req: any,
    @Body()
    body: {
      title: string;
      content: string;
      summary?: string;
      coverImage?: string;
      category: string;
      tags: string[];
      published: boolean;
    },
  ) {
    return this.userService.createPost(req.user.userId, body);
  }

  @Put('posts/:id')
  @ApiOperation({ summary: '更新文章' })
  updateMyPost(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.userService.updateMyPost(req.user.userId, id, body);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: '删除文章' })
  deleteMyPost(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteMyPost(req.user.userId, id);
  }

  @Get('comments')
  @ApiOperation({ summary: '获取我的评论' })
  getMyComments(@Request() req: any) {
    return this.userService.getMyComments(req.user.userId);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: '删除我的评论' })
  deleteMyComment(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteMyComment(req.user.userId, id);
  }
}
