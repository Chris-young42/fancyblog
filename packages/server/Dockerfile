FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

FROM base AS builder
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma/
COPY . .
WORKDIR /app
RUN pnpm install && pnpm exec prisma generate && pnpm run build

# Production image
FROM base AS runner

WORKDIR /app

# Install healthcheck dependency
RUN apk add --no-cache wget openssl

# Create uploads directory
RUN mkdir -p /app/uploads/avatars /app/uploads/covers

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/.npmrc ./.npmrc

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Reinstall production dependencies to avoid symlink issues
RUN npm install -g pnpm && pnpm install --prod && pnpm exec prisma generate

# Run as non-root user
RUN addgroup -g 1001 nodejs && adduser -D -u 1001 -G nodejs nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

CMD ["node", "dist/src/main.js"]
