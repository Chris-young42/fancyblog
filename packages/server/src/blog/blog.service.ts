import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async getPosts() {
    const posts = await this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        category: true,
        tags: true,
        createdAt: true,
        views: true,
        likes: true,
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });
    return posts.map((post) => ({
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
    }));
  }

  async getHotPosts() {
    const posts = await this.prisma.blogPost.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        category: true,
        tags: true,
        createdAt: true,
        views: true,
        likes: true,
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });
    const sorted = posts
      .map((post) => ({
        ...post,
        tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
        hotScore: post.views + post.likes * 2,
      }))
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, 10);
    return sorted.map(({ hotScore: _, ...post }) => post);
  }

  async getPostsByCategory(category: string) {
    const posts = await this.prisma.blogPost.findMany({
      where: { published: true, category },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        category: true,
        tags: true,
        createdAt: true,
        views: true,
        likes: true,
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });
    return posts.map((post) => ({
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
    }));
  }

  async getPost(id: number) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });
    if (!post) return null;
    return {
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
    };
  }

  async incrementViews(id: number): Promise<number> {
    const post = await this.prisma.blogPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return post.views;
  }

  async likePost(
    postId: number,
    userId: number,
  ): Promise<{ likes: number; liked: boolean }> {
    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) {
      const post = await this.prisma.blogPost.findUnique({
        where: { id: postId },
      });
      return { likes: post?.likes || 0, liked: true };
    }
    await this.prisma.postLike.create({ data: { userId, postId } });
    const post = await this.prisma.blogPost.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    });
    return { likes: post.likes, liked: true };
  }

  async unlikePost(
    postId: number,
    userId: number,
  ): Promise<{ likes: number; liked: boolean }> {
    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!existing) {
      const post = await this.prisma.blogPost.findUnique({
        where: { id: postId },
      });
      return { likes: post?.likes || 0, liked: false };
    }
    await this.prisma.postLike.delete({
      where: { userId_postId: { userId, postId } },
    });
    const post = await this.prisma.blogPost.update({
      where: { id: postId },
      data: { likes: { decrement: 1 } },
    });
    return { likes: post.likes, liked: false };
  }

  async hasLiked(postId: number, userId: number): Promise<boolean> {
    const like = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return !!like;
  }

  async createComment(postId: number, userId: number, content: string) {
    return this.prisma.comment.create({
      data: { postId, userId, content },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  async getComments(postId: number) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  async deleteComment(id: number, userId: number): Promise<boolean> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment || comment.userId !== userId) return false;
    await this.prisma.comment.delete({ where: { id } });
    return true;
  }

  async getCategories() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ['category'],
    });
  }

  async getTags() {
    const posts = await this.prisma.blogPost.findMany({
      where: { published: true },
      select: { tags: true },
    });
    const allTags = posts.flatMap((p) => {
      const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags;
      return Array.isArray(tags) ? tags : [];
    });
    return [...new Set(allTags)];
  }

  async searchPosts(query: string) {
    const posts = await this.prisma.blogPost.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { summary: { contains: query } },
          { content: { contains: query } },
          { category: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        category: true,
        tags: true,
        createdAt: true,
        views: true,
        likes: true,
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });
    return posts.map((post) => ({
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
    }));
  }

  async getHotAuthors() {
    const posts = await this.prisma.blogPost.findMany({
      where: { published: true },
      select: {
        authorId: true,
        views: true,
        likes: true,
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    // Group by author and calculate total hot score
    const authorMap = new Map<
      number,
      { author: any; hotScore: number; postCount: number }
    >();

    posts.forEach((post) => {
      const existing = authorMap.get(post.authorId);
      const hotScore = post.views + post.likes * 2;
      if (existing) {
        existing.hotScore += hotScore;
        existing.postCount += 1;
      } else {
        authorMap.set(post.authorId, {
          author: post.author,
          hotScore,
          postCount: 1,
        });
      }
    });

    // Sort by hot score and take top 5
    return Array.from(authorMap.values())
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, 5)
      .map((item) => ({
        ...item.author,
        hotScore: item.hotScore,
        postCount: item.postCount,
      }));
  }
}
