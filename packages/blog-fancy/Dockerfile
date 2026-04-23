FROM node:20-alpine AS base

WORKDIR /app
RUN npm install -g pnpm

FROM base AS builder
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
COPY package.json pnpm-lock.yaml .npmrc ./
COPY . .
RUN pnpm install --no-frozen-lockfile && pnpm run build

FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
