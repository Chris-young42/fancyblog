import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post(':userId')
  follow(
    @Param('userId', ParseIntPipe) followingId: number,
    @Request() req: any,
  ) {
    return this.followService.follow(req.user.userId, followingId);
  }

  @Delete(':userId')
  unfollow(
    @Param('userId', ParseIntPipe) followingId: number,
    @Request() req: any,
  ) {
    return this.followService.unfollow(req.user.userId, followingId);
  }

  @Get(':userId/status')
  isFollowing(
    @Param('userId', ParseIntPipe) followingId: number,
    @Request() req: any,
  ) {
    return this.followService.isFollowing(req.user.userId, followingId);
  }

  @Get('following')
  getFollowing(@Request() req: any) {
    return this.followService.getFollowing(req.user.userId);
  }

  @Get('followers')
  getFollowers(@Request() req: any) {
    return this.followService.getFollowers(req.user.userId);
  }

  @Get('posts')
  getFollowingPosts(@Request() req: any) {
    return this.followService.getFollowingPosts(req.user.userId);
  }
}
