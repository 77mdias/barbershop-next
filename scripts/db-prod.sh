#!/bin/bash

# Script para executar comandos Prisma em produção
# Uso: ./scripts/db-prod.sh [comando]

# Carregar variáveis de ambiente de produção
if [ -f .env.production ]; then
  source .env.production
  echo "✅ Carregado .env.production"
else
  echo "❌ Arquivo .env.production não encontrado!"
  exit 1
fi

# Executar comando baseado no parâmetro
case "$1" in
  "migrate")
    echo "🚀 Aplicando migrações em produção..."
    npx prisma migrate deploy
    ;;
  "push")
    echo "🚀 Fazendo push do schema em produção..."
    npx prisma db push
    ;;
  "studio")
    echo "🚀 Abrindo Prisma Studio para produção..."
    npx prisma studio
    ;;
  "seed")
    echo "🚀 Executando seed em produção..."
    npx tsx prisma/seed.ts
    ;;
  "reset")
    echo "⚠️  ATENÇÃO: Isso irá resetar o banco de produção!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      npx prisma migrate reset
    else
      echo "Operação cancelada."
    fi
    ;;
  "pull")
    echo "🚀 Fazendo pull do schema de produção..."
    npx prisma db pull
    ;;
  "generate")
    echo "🚀 Gerando cliente Prisma..."
    npx prisma generate
    ;;
  *)
    echo "Uso: ./scripts/db-prod.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  migrate   - Aplicar migrações"
    echo "  push      - Push do schema"
    echo "  studio    - Abrir Prisma Studio"
    echo "  seed      - Executar seed"
    echo "  reset     - Resetar banco (com confirmação)"
    echo "  pull      - Pull do schema"
    echo "  generate  - Gerar cliente Prisma"
    ;;
esac