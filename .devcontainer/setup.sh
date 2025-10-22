#!/bin/bash

# ===============================================
# 🚀 SCRIPT DE INICIALIZAÇÃO DO DEVCONTAINER
# ===============================================
# Este script é executado após a criação do devcontainer
# para configurar o ambiente de desenvolvimento

set -e

echo "🚀 Iniciando configuração do ambiente de desenvolvimento..."

# ==================
# 📦 VERIFICAR NODE_MODULES
# ==================
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do npm..."
    npm install
else
    echo "✅ Node modules já instalados"
fi

# ==================
# 🗄️ CONFIGURAR PRISMA
# ==================
echo "🗄️ Configurando Prisma..."

# Aguardar banco estar disponível
echo "⏳ Aguardando PostgreSQL estar disponível..."
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if pg_isready -h db -p 5432 -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL está disponível!"
        break
    fi
    
    echo "🔄 PostgreSQL ainda não está pronto (tentativa $ATTEMPT/$MAX_ATTEMPTS), aguardando..."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
    
    if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
        echo "❌ Timeout aguardando PostgreSQL. Continuando sem banco..."
        exit 1
    fi
done

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Verificar se existem migrações
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    echo "🔄 Aplicando migrações existentes..."
    npx prisma migrate deploy
else
    echo "🆕 Criando primeira migração..."
    npx prisma migrate dev --name init
fi

# Verificar se o banco tem dados
TABLES_COUNT=$(psql postgresql://postgres:postgres@db:5432/barbershop_dev -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")

if [ "$TABLES_COUNT" -gt 0 ]; then
    # Verificar se existem dados nas tabelas principais
    USER_COUNT=$(psql postgresql://postgres:postgres@db:5432/barbershop_dev -tAc "SELECT COUNT(*) FROM \"User\" LIMIT 1;" 2>/dev/null || echo "0")
    
    if [ "$USER_COUNT" -eq 0 ]; then
        echo "🌱 Executando seed do banco de dados..."
        npm run db:seed
    else
        echo "✅ Banco de dados já possui dados"
    fi
else
    echo "🌱 Executando seed do banco de dados..."
    npm run db:seed
fi

# ==================
# 🔧 CONFIGURAÇÕES FINAIS
# ==================
echo "🔧 Configurando Git (se necessário)..."

# Configurar Git se não estiver configurado
if [ -z "$(git config --global user.name)" ]; then
    echo "⚠️  Configuração do Git não encontrada"
    echo "💡 Configure seu Git com:"
    echo "   git config --global user.name 'Seu Nome'"
    echo "   git config --global user.email 'seu.email@exemplo.com'"
fi

# ==================
# 📋 INFORMAÇÕES FINAIS
# ==================
echo ""
echo "🎉 ================================================="
echo "🎉 DEVCONTAINER CONFIGURADO COM SUCESSO!"
echo "🎉 ================================================="
echo ""
echo "🌐 Aplicação: http://localhost:3000"
echo "📊 Prisma Studio: http://localhost:5555"
echo "🗄️ PostgreSQL: localhost:5432"
echo ""
echo "🚀 Comandos úteis:"
echo "   npm run dev        - Iniciar aplicação"
echo "   npm run db:studio  - Abrir Prisma Studio"
echo "   npm run db:migrate - Criar nova migração"
echo "   npm run db:seed    - Popular banco com dados"
echo ""
echo "🔧 Tarefas do VS Code disponíveis:"
echo "   Ctrl+Shift+P > Tasks: Run Task"
echo ""
echo "✨ Ambiente pronto para desenvolvimento!"