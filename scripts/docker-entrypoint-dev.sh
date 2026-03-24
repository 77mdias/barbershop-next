#!/bin/sh

set -eu

LOCKFILE_PATH="/app/package-lock.json"
HASH_FILE_PATH="/app/node_modules/.package-lock.hash"
NEXT_BINARY_PATH="/app/node_modules/.bin/next"

calculate_lock_hash() {
  sha256sum "$LOCKFILE_PATH" | awk '{print $1}'
}

sync_dependencies_if_needed() {
  needs_install="false"

  if [ ! -d "/app/node_modules" ] || [ ! -f "$NEXT_BINARY_PATH" ]; then
    echo "[deps] node_modules ausente ou incompleto."
    needs_install="true"
  fi

  current_hash="$(calculate_lock_hash)"
  previous_hash=""

  if [ -f "$HASH_FILE_PATH" ]; then
    previous_hash="$(cat "$HASH_FILE_PATH")"
  fi

  if [ "$current_hash" != "$previous_hash" ]; then
    echo "[deps] package-lock.json alterado."
    needs_install="true"
  fi

  if [ "$needs_install" = "true" ]; then
    echo "[deps] Sincronizando dependencias..."
    npm ci
    mkdir -p /app/node_modules
    echo "$current_hash" > "$HASH_FILE_PATH"
    return
  fi

  echo "[deps] Dependencias ja sincronizadas com package-lock.json"
}

sync_dependencies_if_needed

echo "[prisma] Gerando Prisma Client..."
npx prisma generate

echo "[next] Iniciando Next.js em modo desenvolvimento..."
exec npm run dev
