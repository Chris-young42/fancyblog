import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMyPosts(userId: number) {
    return this.prisma.blogPost.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        category: true,
        tags: true,
        published: true,
        views: true,
        likes: true,
        createdAt: true,
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
        _count: {
          select: { comments: true, postLikes: true },
        },
      },
    });
  }

  async getMyPost(userId: number, postId: number) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, nickname: true, avatar: true } },
        _count: { select: { comments: true, postLikes: true } },
      },
    });
    if (!post || post.authorId !== userId) return null;
    return post;
  }

  async createPost(
    userId: number,
    data: {
      title: string;
      content: string;
      summary?: string;
      coverImage?: string;
      category: string;
      tags: string[];
      published: boolean;
    },
  ) {
    return this.prisma.blogPost.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags),
        authorId: userId,
      },
    });
  }

  async updateMyPost(
    userId: number,
    postId: number,
    data: {
      title?: string;
      content?: string;
      summary?: string;
      coverImage?: string;
      category?: string;
      tags?: string[];
      published?: boolean;
    },
  ) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id: postId },
    });
    if (!post || post.authorId !== userId) return null;

    const updateData: any = { ...data };
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }
    return this.prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
    });
  }

  async deleteMyPost(userId: number, postId: number) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id: postId },
    });
    if (!post || post.authorId !== userId) return false;
    await this.prisma.blogPost.delete({ where: { id: postId } });
    return true;
  }

  async getMyComments(userId: number) {
    return this.prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        post: { select: { id: true, title: true } },
      },
    });
  }

  async deleteMyComment(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.userId !== userId) return false;
    await this.prisma.comment.delete({ where: { id: commentId } });
    return true;
  }
}
