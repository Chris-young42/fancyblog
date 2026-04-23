import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // User management
  async getAllUsers() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true,
          },
        },
      },
    });
  }

  async getUser(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
            views: true,
            likes: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true,
          },
        },
      },
    });
  }

  async updateUser(
    id: number,
    data: { nickname?: string; role?: string; isActive?: boolean },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async deleteUser(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.prisma.user.delete({ where: { id } });
    return { message: '用户已删除' };
  }

  // Blog post management
  async getAllPosts() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
        _count: {
          select: {
            comments: true,
            postLikes: true,
          },
        },
      },
    });
  }

  async getPost(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
        comments: {
          include: {
            user: { select: { id: true, nickname: true, avatar: true } },
          },
        },
        _count: {
          select: {
            comments: true,
            postLikes: true,
          },
        },
      },
    });
  }

  async createPost(data: {
    title: string;
    content: string;
    summary?: string;
    coverImage?: string;
    category: string;
    tags: string[];
    published: boolean;
    authorId: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.prisma.blogPost.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags),
      },
    });
  }

  async updatePost(
    id: number,
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
    const updateData: any = { ...data };
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }
    return this.prisma.blogPost.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePost(id: number) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: '文章已删除' };
  }

  // Comment management
  async getAllComments() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        post: { select: { id: true, title: true } },
      },
    });
  }

  async deleteComment(id: number) {
    await this.prisma.comment.delete({ where: { id } });
    return { message: '评论已删除' };
  }

  // Dashboard stats
  async getStats() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [userCount, postCount, commentCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.blogPost.count(),
      this.prisma.comment.count(),
    ]);
    return { userCount, postCount, commentCount };
  }
}
