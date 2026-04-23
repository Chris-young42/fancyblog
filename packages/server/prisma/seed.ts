import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
      content: `## 引言

React Server Components (RSC) 是 React 18.3 引入的重大特性，它彻底改变了我们构建 React 应用的方式。

## 什么是 Server Components？

Server Components 是一种在服务端渲染 React 组件的技术，它可以直接在服务端获取数据，并将渲染后的 HTML 发送给客户端。

\`\`\`tsx
// Server Component - 在服务端运行
async function ArticleList() {
  const articles = await db.query('SELECT * FROM articles')
  return articles.map(article => <ArticleCard key={article.id} {...article} />)
}
\`\`\`

## 核心优势

1. **减少客户端 bundle 大小** - 服务端组件不会被打包到客户端 JS 中
2. **更快的数据获取** - 可以在服务端直接访问数据库
3. **更好的 SEO** - 内容直接嵌入 HTML

## 总结

RSC 代表了 React 开发的未来方向，值得深入学习和实践。`,
      coverImage:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      category: '前端',
      tags: ['React', 'Next.js', 'Server Components'],
      published: true,
      authorId: user.id,
    },
    {
      title: '微服务架构设计模式',
      summary: '全面解析微服务架构中的常用设计模式',
      content: `## 引言

微服务架构已成为现代后端开发的主流选择，本文将深入探讨其核心设计模式。

## 核心模式

### 1. 服务拆分模式
按照业务边界进行服务拆分，每个服务负责特定的业务领域。

### 2. API Gateway 模式
统一入口，处理认证、路由、限流等功能。

### 3. 服务发现模式
支持服务的动态注册与发现。

## 总结

微服务架构需要综合考虑团队规模、业务复杂度等因素。`,
      coverImage:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      category: '架构',
      tags: ['微服务', '架构', 'Docker'],
      published: true,
      authorId: user.id,
    },
    {
      title: 'LangChain 中文文档实战',
      summary: '基于 LangChain 构建你的第一个 AI 应用',
      content: `## 引言

LangChain 是一个强大的 AI 应用开发框架，本文教你快速上手。

## 核心概念

### Chain
将多个 LLM 调用串联起来，形成完整的工作流。

### Agent
智能体，能够自主决策执行任务。

### Memory
支持上下文记忆，让对话更连贯。

## 代码示例

\`\`\`python
from langchain import OpenAI, LLMChain

llm = OpenAI(temperature=0.9)
chain = LLMChain(llm=llm, prompt=prompt)
\`\`\`

## 总结

LangChain 让 AI 应用开发变得简单高效。`,
      coverImage:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      category: 'AI',
      tags: ['AI', 'LangChain', 'Python'],
      published: true,
      authorId: user.id,
    },
    {
      title: 'TypeScript 5.0 新特性解析',
      summary: 'TypeScript 5.0带来了哪些激动人心的新特性',
      content: `## 引言

TypeScript 5.0 带来了众多新特性，让我们一起来探索。

## 新特性一览

### 1. 装饰器标准化
装饰器语法更加符合 ECMAScript 标准。

### 2. 性能优化
编译速度大幅提升，类型检查更高效。

### 3. 新的配置选项
更灵活的项目配置方式。

## 总结

TypeScript 5.0 是迄今为止最强大的 TypeScript 版本。`,
      coverImage:
        'https://images.unsplash.com/photo-1516116216624-53e69f9b5f22?w=800&q=80',
      category: '前端',
      tags: ['TypeScript', 'JavaScript'],
      published: true,
      authorId: user.id,
    },
    {
      title: 'Rust 异步编程实战',
      summary: '深入理解 Rust 的 async/await 机制',
      content: `## 引言

Rust 的异步编程模型既安全又高效。

## 核心概念

### async/await
异步代码以同步的方式编写。

### Future
 Rust 中异步操作的核心抽象。

### Tokio
最流行的异步运行时。

## 代码示例

\`\`\`rust
#[tokio::main]
async fn main() {
    let result = fetch_data().await;
    println!("{:?}", result);
}
\`\`\`

## 总结

Rust 让系统编程变得现代化。`,
      coverImage:
        'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80',
      category: '系统',
      tags: ['Rust', '异步', '系统编程'],
      published: true,
      authorId: user.id,
    },
    {
      title: 'Next.js 14 App Router 完全指南',
      summary: '掌握 Next.js 14 全新特性的必读教程',
      content: `## 引言

Next.js 14 的 App Router 代表了 React 全栈开发的未来。

## 核心特性

### 1. App Router
基于文件系统的路由，更直观。

### 2. Server Components
默认在服务端渲染，性能更好。

### 3. Streaming
支持 SSR 流式输出，首屏更快。

## 总结

Next.js 14 是构建现代 Web 应用的最佳选择。`,
      coverImage:
        'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80',
      category: '前端',
      tags: ['Next.js', 'React', 'SSR'],
      published: true,
      authorId: user.id,
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.create({
      data: {
        ...post,
        tags: JSON.stringify(post.tags),
      },
    });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
