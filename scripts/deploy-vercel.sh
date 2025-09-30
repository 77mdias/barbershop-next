#!/bin/bash

# =====================================
# 🚀 SCRIPT DE DEPLOY PARA VERCEL
# =====================================

set -e  # Para em caso de erro

echo "🚀 Iniciando processo de deploy para Vercel..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
    log_error "Execute este script na raiz do projeto!"
    exit 1
fi

# 1. Verificar dependências
log_info "Verificando dependências..."
if ! command -v vercel &> /dev/null; then
    log_warning "Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# 2. Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Há mudanças não commitadas. Recomendamos commitar antes do deploy."
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deploy cancelado."
        exit 1
    fi
fi

# 3. Gerar Prisma Client
log_info "Gerando Prisma Client..."
npx prisma generate

# 4. Testar build localmente
log_info "Testando build local..."
npm run build

# 5. Fazer login no Vercel (se necessário)
log_info "Verificando autenticação Vercel..."
if ! vercel whoami &> /dev/null; then
    log_warning "Faça login no Vercel:"
    vercel login
fi

# 6. Deploy
log_info "Fazendo deploy..."
if [ "$1" = "--production" ]; then
    log_info "Deploy para PRODUÇÃO..."
    vercel --prod
else
    log_info "Deploy para PREVIEW..."
    vercel
fi

log_info "Deploy concluído! 🎉"
log_warning "Não esqueça de configurar as variáveis de ambiente no dashboard do Vercel!"

echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://vercel.com/dashboard"
echo "2. Configure as variáveis de ambiente"
echo "3. Teste a aplicação em produção"