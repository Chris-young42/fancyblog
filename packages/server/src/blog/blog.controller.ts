import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  Body,
  Request,
  Query,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get('posts')
  getPosts() {
    return this.blogService.getPosts();
  }

  @Get('posts/hot')
  getHotPosts() {
    return this.blogService.getHotPosts();
  }

  @Get('posts/category/:category')
  getPostsByCategory(@Param('category') category: string) {
    return this.blogService.getPostsByCategory(category);
  }

  @Get('posts/:id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.getPost(id);
  }

  @Patch('posts/:id/view')
  incrementView(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.incrementViews(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/like')
  likePost(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.blogService.likePost(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id/like')
  unlikePost(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.blogService.unlikePost(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts/:id/liked')
  hasLiked(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.blogService.hasLiked(id, req.user.userId);
  }

  @Get('posts/:id/comments')
  getComments(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  createComment(
    @Param('id', ParseIntPipe) postId: number,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    return this.blogService.createComment(postId, req.user.userId, content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  deleteComment(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.blogService.deleteComment(id, req.user.userId);
  }

  @Get('categories')
  getCategories() {
    return this.blogService.getCategories();
  }

  @Get('tags')
  getTags() {
    return this.blogService.getTags();
  }

  @Get('search')
  searchPosts(@Query('q') query: string) {
    return this.blogService.searchPosts(query);
  }

  @Get('authors/hot')
  getHotAuthors() {
    return this.blogService.getHotAuthors();
  }
}
