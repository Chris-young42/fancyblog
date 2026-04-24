@echo off
setlocal enabledelayedexpansion

:: ============================================
:: 博客项目部署脚本 (Windows)
:: ============================================

set "ENV_FILE=.env.prod"
set "REGISTRY="
set "REBUILD="

:: 解析参数
:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="-r" (
    set "REGISTRY=%~2"
    shift & shift
    goto :parse_args
)
if /i "%~1"=="-e" (
    set "ENV_FILE=%~2"
    shift & shift
    goto :parse_args
)
if /i "%~1"=="--rebuild" (
    set "REBUILD=1"
    shift
    goto :parse_args
)
if /i "%~1"=="--force-rebuild" (
    set "REBUILD=1"
    set "FORCE_REBUILD=--no-cache"
    shift
    goto :parse_args
)
if /i "%~1"=="-h" goto :usage
if /i "%~1"=="--help" goto :usage
shift
goto :parse_args

:usage
echo 用法: deploy.bat [选项]
echo.
echo 选项:
echo   -r, --registry    Docker 镜像仓库地址
echo   -e, --env-file    环境变量文件 (默认: .env.prod)
echo   --rebuild         重新构建镜像
echo   --force-rebuild   不使用缓存，强制重新构建
echo   -h, --help        显示帮助
exit /b 1

:args_done

if not exist "%ENV_FILE%" (
    echo 错误: 环境变量文件 %ENV_FILE% 不存在
    exit /b 1
)

echo.
echo ========================================
echo      博客项目部署脚本
echo ========================================
echo.

:: 检查环境变量
echo [检查环境变量...]
findstr /C:"MYSQL_USER" "%ENV_FILE%" >nul
if errorlevel 1 (
    echo 错误: 缺少 MYSQL_USER
    exit /b 1
)
echo [环境变量检查通过]

:: 停止现有服务
echo.
echo [停止现有服务...]
docker-compose --env-file "%ENV_FILE%" down --remove-orphans >nul 2>&1

:: 构建镜像
if defined REBUILD (
    echo.
    echo [构建 Docker 镜像...]
    if defined FORCE_REBUILD (
        echo [强制重新构建...]
        docker-compose --env-file "%ENV_FILE%" build --no-cache
    ) else (
        docker-compose --env-file "%ENV_FILE%" build
    )
) else (
    echo.
    echo [跳过构建，使用现有镜像]
)

:: 推送镜像
if not "%REGISTRY%"=="" (
    echo.
    echo [推送镜像到 %REGISTRY%...]
    docker tag hell-backend "%REGISTRY%/blog-backend:latest"
    docker tag hell-frontend "%REGISTRY%/blog-frontend:latest"
    docker tag hell-frontend_admin "%REGISTRY%/blog-frontend_admin:latest"
    docker push "%REGISTRY%/blog-backend:latest"
    docker push "%REGISTRY%/blog-frontend:latest"
    docker push "%REGISTRY%/blog-frontend_admin:latest"
)

:: 启动服务
echo.
echo [启动服务...]
docker-compose --env-file "%ENV_FILE%" up -d

echo [等待服务启动...]
timeout /t 5 /nobreak >nul

:: 检查状态
echo.
echo [服务状态:]
docker-compose --env-file "%ENV_FILE%" ps

echo.
echo ========================================
echo      部署完成!
echo ========================================
echo.
echo 访问地址:
echo   前台:  http://localhost:3001
echo   管理:  http://localhost:3002
echo   API:   http://localhost:3000/api
echo.
echo 初始账号:
echo   管理员: admin@blog.com / Admin123!
echo   测试:   testuser@blog.com / Test123456
echo.
