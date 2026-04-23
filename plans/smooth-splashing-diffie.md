# 实现点赞和评论功能

## 背景
BlogPost 表已有 `views` 和 `likes` 字段但从未被使用，Comment 模型不存在。前端 ArticlePage 的点赞是纯客户端状态无 API 调用，评论 UI 完全不存在。

## 实现计划

### 第一步：数据库迁移
- 新增 `Comment` 模型（id, content, userId, postId, createdAt, updatedAt）
- 关联 User 和 BlogPost

### 第二步：后端接口

**BlogService** 新增方法：
- `incrementViews(id)` → `views + 1`
- `likePost(id)` → `likes + 1`，返回新计数
- `unlikePost(id)` → `likes - 1`，返回新计数
- `createComment(postId, userId, content)` → 创建并返回含用户信息的评论
- `getComments(postId)` → 返回该文章所有评论（按时间倒序）
- `deleteComment(id, userId)` → 验证所有权后删除

**BlogController** 新增端点：
| 方法 | 路径 | 说明 |
|------|------|------|
| PATCH | /blog/posts/:id/view | 增加浏览量 |
| POST | /blog/posts/:id/like | 点赞 |
| DELETE | /blog/posts/:id/like | 取消点赞 |
| GET | /blog/posts/:id/comments | 获取评论列表 |
| POST | /blog/posts/:id/comments | 发表评论 |
| DELETE | /blog/comments/:id | 删除评论（需验证所有权）|

### 第三步：前端 API
blog-api.ts 新增：
- `incrementView(postId)` - PATCH
- `likePost(postId)` - POST
- `unlikePost(postId)` - DELETE
- `createComment(postId, content)` - POST
- `getComments(postId)` - GET
- `deleteComment(commentId)` - DELETE

### 第四步：ArticlePage 改造
1. 移除本地 liked/likeCount 状态
2. 页面加载时调用 `incrementView`
3. 点赞按钮改用 React Query mutation，成功后 refetch
4. 新增评论区域：发表表单 + 评论列表
5. 评论列表显示用户头像、昵称、时间和内容
6. 当前用户发表的评论显示删除按钮

## 关键文件
- `packages/server/prisma/schema.prisma` - 新增 Comment 模型
- `packages/server/src/blog/blog.service.ts` - 新增 6 个方法
- `packages/server/src/blog/blog.controller.ts` - 新增 6 个路由
- `packages/blog-fancy/src/lib/blog-api.ts` - 新增 API 方法
- `packages/blog-fancy/src/pages/ArticlePage.tsx` - 重构点赞和评论 UI

## 验证
1. `npx prisma migrate dev` 执行迁移
2. `npm run start:dev` 启动后端
3. 登录后点击文章，浏览量 +1
4. 测试点赞/取消点赞，计数正确更新
5. 发表、查看、删除评论流程正常
6. 前端所有数据与后端同步