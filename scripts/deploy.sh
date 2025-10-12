#!/bin/bash

# ===============================================
# 🚀 SCRIPT DE DEPLOY PRODUÇÃO
# ===============================================
# Script para facilitar deploy e migrações em produção

set -e

echo "🐳 Deploy de Produção - Barbershop Next.js"
echo "=========================================="

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  migrate     - Aplicar apenas migrações (sem rebuild)"
    echo "  deploy      - Deploy completo (rebuild + migrações)"
    echo "  rebuild     - Rebuild da imagem de produção"
    echo "  logs        - Ver logs do container de produção"
    echo "  status      - Status dos containers"
    echo "  help        - Mostrar esta ajuda"
    echo ""
}

# Verificar se docker-compose.prod.yml existe
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Erro: docker-compose.prod.yml não encontrado!"
    exit 1
fi

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    echo "❌ Erro: .env.production não encontrado!"
    exit 1
fi

case "$1" in
    "migrate")
        echo "🔄 Aplicando migrações em produção..."
        docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
        echo "✅ Migrações aplicadas!"
        ;;
    "deploy")
        echo "🏗️  Fazendo rebuild da imagem..."
        docker compose -f docker-compose.prod.yml build
        echo "🔄 Restart do container com migrações..."
        docker compose -f docker-compose.prod.yml up -d
        echo "✅ Deploy completo realizado!"
        ;;
    "rebuild")
        echo "🏗️  Rebuild da imagem de produção..."
        docker compose -f docker-compose.prod.yml build
        echo "✅ Rebuild concluído!"
        ;;
    "logs")
        echo "📋 Logs do container de produção:"
        docker compose -f docker-compose.prod.yml logs -f app
        ;;
    "status")
        echo "📊 Status dos containers:"
        docker compose -f docker-compose.prod.yml ps
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Comando não reconhecido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac