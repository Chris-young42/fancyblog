# 部署问题诊断与修复

## 项目结构
- Monorepo: pnpm workspaces
- Backend: `packages/server` (NestJS + Prisma + MySQL)
- Frontend Fancy: `packages/blog-fancy` (Vite + React)
- Frontend Admin: `packages/blog-mannagement` (Vite + React, 未完成)

## 一、问题清单

### 问题 1: packages/server/Dockerfile - 启动路径错误
**位置**: `packages/server/Dockerfile` 第 47 行
**现象**: 容器启动后立即退出，报 `Cannot find module dist/src/main.js`
**根因**: NestJS 构建输出为 `dist/main.js`，不是 `dist/src/main.js`
**修复**:
```dockerfile
# 原来
CMD ["node", "dist/src/main.js"]
# 改为
CMD ["node", "dist/main.js"]
```

### 问题 2: Root Dockerfile 不适 monorepo 结构
**位置**: 根目录 `Dockerfile`
**现象**: 构建成功但复制到 nginx 的 dist 目录为空
**根因**:
1. `pnpm run build` 在 workspace 根目录运行，会构建所有 packages，输出到各自 `packages/*/dist`
2. `COPY --from=builder /app/dist` 期望单一 dist 目录，实际不存在
3. `nginx.conf` 路径错误: 写的是 `nginx.conf`，实际在 `nginx/nginx.conf`

**修复方案**: 删除根目录 Dockerfile，改用独立部署

### 问题 3: docker-compose.prod.yml 架构问题
**现象**: 前端无法访问 API，502 Bad Gateway
**根因**:
- `frontend_fancy` 容器内 nginx 配置 `proxy_pass http://backend:3000/`
- 但 `backend` 容器名在 docker 网络中不一定可达
- 缺少统一的反向代理层

## 二、修复步骤

### Step 1: 修复 server Dockerfile
```dockerfile
# packages/server/Dockerfile 第 47 行
CMD ["node", "dist/main.js"]
```

### Step 2: 选择部署架构

#### 方案 A: 简化架构 (推荐开发/小规模部署)
- 一个 MySQL 容器
- 一个 Backend 容器 (NestJS)
- 一个 Frontend 容器 (Nginx 代理 frontend_fancy + 静态资源)

#### 方案 B: 生产架构
- MySQL 容器
- Backend 容器
- Nginx 反向代理容器 (统一入口，分发到各前端)

### Step 3: 统一 nginx 代理配置

创建 `deploy/nginx-compose.yml`:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: blog-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-password}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-blog_db}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - blog-network
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -u root -p\"$$MYSQL_ROOT_PASSWORD\" --silent"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s

  backend:
    build:
      context: ./packages/server
      dockerfile: Dockerfile
    container_name: blog-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://root:password@mysql:3306/blog_db
      PORT: 3000
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - blog-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 20s

  nginx-proxy:
    image: nginx:1.27-alpine
    container_name: blog-nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/vhost.d:/etc/nginx/vhost.d:ro
      - nginx-static:/usr/share/nginx/html
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - blog-network

volumes:
  mysql_data:
  nginx-static:

networks:
  blog-network:
    driver: bridge
```

## 三、部署流程

### 开发环境部署
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 生产环境部署
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 构建但不启动
```bash
docker-compose -f docker-compose.prod.yml build
```

### 查看日志
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## 四、验证清单

- [ ] MySQL 容器 health check 通过
- [ ] Backend 容器 health check 通过
- [ ] Frontend 访问 http://localhost:80 返回页面
- [ ] API 代理 http://localhost:80/api 返回 Swagger 或正确响应
- [ ] `docker logs blog-backend` 无报错
- [ ] `docker logs blog-nginx-proxy` 无报错
