#!/bin/bash
# ============================================
# 博客项目全局部署脚本
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 默认配置
REGISTRY=""
ENV_FILE=".env.prod"
REBUILD=false
FORCE_REBUILD=false

# 用法说明
usage() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -r, --registry <地址>    Docker 镜像仓库地址 (如: registry.example.com)"
    echo "  -e, --env-file <文件>   环境变量文件 (默认: .env.prod)"
    echo "  --rebuild               重新构建镜像"
    echo "  --force-rebuild         不使用缓存，强制重新构建"
    echo "  -h, --help              显示帮助"
    echo ""
    echo "示例:"
    echo "  $0                              # 使用缓存镜像启动"
    echo "  $0 --rebuild                    # 重新构建后启动"
    echo "  $0 -r registry.example.com     # 推送到仓库并启动"
    exit 1
}

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -e|--env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        --rebuild)
            REBUILD=true
            shift
            ;;
        --force-rebuild)
            REBUILD=true
            FORCE_REBUILD=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            usage
            ;;
    esac
done

# 检查环境变量文件
if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}错误: 环境变量文件 $ENV_FILE 不存在${NC}"
    exit 1
fi

# 日志函数
log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] 警告:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] 错误:${NC} $1"
}

# 确认环境变量
check_env() {
    log "检查环境变量..."
    source "$ENV_FILE"

    local missing=()
    [[ -z "$MYSQL_USER" ]] && missing+=("MYSQL_USER")
    [[ -z "$MYSQL_PASSWORD" ]] && missing+=("MYSQL_PASSWORD")
    [[ -z "$MYSQL_DATABASE" ]] && missing+=("MYSQL_DATABASE")
    [[ -z "$JWT_ACCESS_SECRET" ]] && missing+=("JWT_ACCESS_SECRET")
    [[ -z "$JWT_REFRESH_SECRET" ]] && missing+=("JWT_REFRESH_SECRET")

    if [[ ${#missing[@]} -gt 0 ]]; then
        error "缺少必填环境变量: ${missing[*]}"
        exit 1
    fi
    log "环境变量检查通过"
}

# 停止现有服务
stop_services() {
    log "停止现有服务..."
    docker-compose --env-file "$ENV_FILE" down --remove-orphans 2>/dev/null || true
}

# 构建镜像
build_images() {
    log "构建 Docker 镜像..."

    if [[ "$FORCE_REBUILD" == true ]]; then
        log "强制重新构建 (不使用缓存)..."
        docker-compose --env-file "$ENV_FILE" build --no-cache
    elif [[ "$REBUILD" == true ]]; then
        docker-compose --env-file "$ENV_FILE" build
    else
        log "跳过构建，使用现有镜像"
        return
    fi
}

# 推送镜像到仓库
push_images() {
    if [[ -z "$REGISTRY" ]]; then
        return
    fi

    log "推送镜像到 $REGISTRY..."

    # 镜像标签
    BACKEND_IMAGE="$REGISTRY/blog-backend:latest"
    FRONTEND_FANCY_IMAGE="$REGISTRY/blog-frontend:latest"
    FRONTEND_ADMIN_IMAGE="$REGISTRY/blog-frontend_admin:latest"

    # Tag
    docker tag hell-backend "$BACKEND_IMAGE"
    docker tag hell-frontend "$FRONTEND_FANCY_IMAGE"
    docker tag hell-frontend_admin "$FRONTEND_ADMIN_IMAGE"

    # Push
    docker push "$BACKEND_IMAGE"
    docker push "$FRONTEND_FANCY_IMAGE"
    docker push "$FRONTEND_ADMIN_IMAGE"

    log "镜像推送完成"
}

# 启动服务
start_services() {
    log "启动服务..."
    docker-compose --env-file "$ENV_FILE" up -d

    log "等待服务启动..."
    sleep 5

    # 检查服务状态
    local retries=30
    local count=0
    while [[ $count -lt $retries ]]; do
        local status=$(docker-compose --env-file "$ENV_FILE" ps --format json 2>/dev/null | grep -c "healthy\|Up" || echo 0)
        if [[ $status -ge 3 ]]; then
            break
        fi
        sleep 2
        ((count++))
    done
}

# 检查健康状态
check_health() {
    log "检查服务健康状态..."
    docker-compose --env-file "$ENV_FILE" ps

    echo ""
    log "验证端点..."

    # 检查 backend
    local backend_ok=false
    for i in {1..10}; do
        if curl -sf http://localhost:3000/api > /dev/null 2>&1; then
            backend_ok=true
            break
        fi
        sleep 2
    done

    if [[ "$backend_ok" == true ]]; then
        log "Backend API: ${GREEN}正常${NC}"
    else
        error "Backend API: ${RED}异常${NC}"
    fi
}

# 显示访问信息
show_info() {
    echo ""
    echo "========================================"
    echo -e "${GREEN}部署完成!${NC}"
    echo "========================================"
    echo ""
    echo "访问地址:"
    echo "  前台:  http://localhost:3001"
    echo "  管理:  http://localhost:3002"
    echo "  API:   http://localhost:3000/api"
    echo ""
    echo "初始账号:"
    source "$ENV_FILE"
    echo "  管理员: admin@blog.com / Admin123!"
    echo "  测试:   testuser@blog.com / Test123456"
    echo ""
    echo "常用命令:"
    echo "  查看日志:  docker-compose --env-file $ENV_FILE logs -f"
    echo "  重启服务:  docker-compose --env-file $ENV_FILE restart"
    echo "  停止服务:  docker-compose --env-file $ENV_FILE down"
    echo ""
}

# 主流程
main() {
    echo ""
    echo "========================================"
    echo "     博客项目部署脚本"
    echo "========================================"
    echo ""

    check_env
    stop_services
    build_images
    push_images
    start_services
    check_health
    show_info
}

main "$@"
