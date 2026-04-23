import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      return { success: false, message: '不能关注自己' };
    }
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      return { success: false, message: '已经关注了' };
    }
    await this.prisma.follow.create({
      data: { followerId, followingId },
    });
    return { success: true, message: '关注成功' };
  }

  async unfollow(followerId: number, followingId: number) {
    await this.prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { success: true, message: '取消关注成功' };
  }

  async isFollowing(followerId: number, followingId: number) {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!follow;
  }

  async getFollowing(userId: number) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            createdAt: true,
            _count: {
              select: { posts: true, followers: true, following: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFollowers(userId: number) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            createdAt: true,
            _count: {
              select: { posts: true, followers: true, following: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFollowingPosts(userId: number) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    const posts = await this.prisma.blogPost.findMany({
      where: { published: true, authorId: { in: followingIds } },
      include: {
        author: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((post) => ({
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
    }));
  }
}
