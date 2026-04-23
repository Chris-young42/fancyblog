#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.prod.yml"
ENV_FILE="${SCRIPT_DIR}/.env.prod"

if ! command -v docker >/dev/null 2>&1; then
  echo "[deploy] Docker is not installed or not in PATH."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[deploy] Docker Compose v2 is required (docker compose)."
  exit 1
fi

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "[deploy] Missing ${COMPOSE_FILE}."
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "[deploy] Missing ${ENV_FILE}. Copy .env.prod.example to .env.prod and fill values first."
  exit 1
fi

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "[deploy] Building and starting production stack..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --build

echo "[deploy] Running prisma migrations..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --no-deps backend pnpm exec prisma migrate deploy

echo "[deploy] Seeding database..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --no-deps backend pnpm exec prisma db seed

echo "[deploy] Services status:"
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps

FANCY_PORT=$(grep -E '^FRONTEND_FANCY_PORT=' "${ENV_FILE}" | cut -d'=' -f2- || true)
ADMIN_PORT=$(grep -E '^FRONTEND_ADMIN_PORT=' "${ENV_FILE}" | cut -d'=' -f2- || true)
FANCY_PORT=${FANCY_PORT:-8080}
ADMIN_PORT=${ADMIN_PORT:-8081}

echo "[deploy] Done."
echo "[deploy] Fancy frontend: http://localhost:${FANCY_PORT}"
echo "[deploy] Admin frontend: http://localhost:${ADMIN_PORT}"
