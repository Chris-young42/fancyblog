// Compiled seed - run with: node prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create or get admin user
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const testUserPassword = await bcrypt.hash('Test123456', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@blog.com' },
    update: {
      username: 'admin',
      passwordHash,
      nickname: '管理员',
      role: 'admin',
      isActive: true,
    },
    create: {
      email: 'admin@blog.com',
      username: 'admin',
      passwordHash,
      nickname: '管理员',
      role: 'admin',
      isActive: true,
    },
  });

  // Create test user
  await prisma.user.upsert({
    where: { email: 'testuser@blog.com' },
    update: {},
    create: {
      email: 'testuser@blog.com',
      username: 'testuser2',
      passwordHash: testUserPassword,
      nickname: '测试用户',
    },
  });

  // Create blog posts
  const posts = [
    {
      title: 'React Server Components 实战指南',
      summary: '深入探索 RSC 的工作原理和最佳实践',
      content: `## 引言\n\nReact Server Components (RSC) 是 React 18.3 引入的重大特性。\n\n## 什么是 Server Components？\n\nServer Components 是一种在服务端渲染 React 组件的技术。\n\n## 核心优势\n\n1. **减少客户端 bundle 大小**\n2. **更快的数据获取**\n3. **更好的 SEO**\n\n## 总结\n\nRSC 代表了 React 开发的未来方向。`,
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      category: '前端',
      tags: JSON.stringify(['React', 'Next.js', 'Server Components']),
      published: true,
      authorId: user.id,
    },
    {
      title: '微服务架构设计模式',
      summary: '全面解析微服务架构中的常用设计模式',
      content: `## 引言\n\n微服务架构已成为现代后端开发的主流选择。\n\n## 核心模式\n\n### 1. 服务拆分模式\n### 2. API Gateway 模式\n### 3. 服务发现模式\n\n## 总结\n\n微服务架构需要综合考虑团队规模、业务复杂度等因素。`,
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      category: '架构',
      tags: JSON.stringify(['微服务', '架构', 'Docker']),
      published: true,
      authorId: user.id,
    },
    {
      title: 'LangChain 中文文档实战',
      summary: '基于 LangChain 构建你的第一个 AI 应用',
      content: `## 引言\n\nLangChain 是一个强大的 AI 应用开发框架。\n\n## 核心概念\n\n### Chain / Agent / Memory\n\n## 总结\n\nLangChain 让 AI 应用开发变得简单高效。`,
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      category: 'AI',
      tags: JSON.stringify(['AI', 'LangChain', 'Python']),
      published: true,
      authorId: user.id,
    },
    {
      title: 'TypeScript 5.0 新特性解析',
      summary: 'TypeScript 5.0带来了哪些激动人心的新特性',
      content: `## 引言\n\nTypeScript 5.0 带来了众多新特性。\n\n## 新特性一览\n\n### 1. 装饰器标准化\n### 2. 性能优化\n### 3. 新的配置选项\n\n## 总结\n\nTypeScript 5.0 是迄今为止最强大的 TypeScript 版本。`,
      coverImage: 'https://images.unsplash.com/photo-1516116216624-53e69f9b5f22?w=800&q=80',
      category: '前端',
      tags: JSON.stringify(['TypeScript', 'JavaScript']),
      published: true,
      authorId: user.id,
    },
    {
      title: 'Rust 异步编程实战',
      summary: '深入理解 Rust 的 async/await 机制',
      content: `## 引言\n\nRust 的异步编程模型既安全又高效。\n\n## 核心概念\n\n### async/await / Future / Tokio\n\n## 总结\n\nRust 让系统编程变得现代化。`,
      coverImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80',
      category: '系统',
      tags: JSON.stringify(['Rust', '异步', '系统编程']),
      published: true,
      authorId: user.id,
    },
    {
      title: 'Next.js 14 App Router 完全指南',
      summary: '掌握 Next.js 14 全新特性的必读教程',
      content: `## 引言\n\nNext.js 14 的 App Router 代表了 React 全栈开发的未来。\n\n## 核心特性\n\n### 1. App Router / 2. Server Components / 3. Streaming\n\n## 总结\n\nNext.js 14 是构建现代 Web 应用的最佳选择。`,
      coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80',
      category: '前端',
      tags: JSON.stringify(['Next.js', 'React', 'SSR']),
      published: true,
      authorId: user.id,
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { id: posts.indexOf(post) + 1 },
      update: post,
      create: post,
    });
  }

  console.log('Seed completed!');
  console.log('Admin: admin@blog.com / Admin123!');
  console.log('Test: testuser@blog.com / Test123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
