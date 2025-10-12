#!/bin/sh

# ===============================================
# 🚀 DOCKER ENTRYPOINT - PRODUÇÃO
# ===============================================
# Script de inicialização para container de produção
# Executa migrações automaticamente antes de iniciar a aplicação

set -e

echo "🐳 Iniciando container de produção..."

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não está definida!"
    exit 1
fi

echo "✅ DATABASE_URL configurada"

# Aplicar migrações automaticamente
echo "🔄 Aplicando migrações do banco de dados..."
npx prisma migrate deploy || {
    echo "❌ Erro ao aplicar migrações!"
    exit 1
}

echo "✅ Migrações aplicadas com sucesso"

# Iniciar a aplicação
echo "🚀 Iniciando aplicação Next.js..."
exec "$@"