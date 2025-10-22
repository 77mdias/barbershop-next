#!/bin/bash

# ===============================================
# 🛠️ GERENCIADOR DEVCONTAINER BARBERSHOP
# ===============================================
# Utilitário para gerenciar operações do devcontainer

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
DATABASE="🗄️"
GEAR="⚙️"
CHECK="✅"
WARNING="⚠️"
ERROR="❌"
INFO="💡"

# Função para mostrar ajuda
show_help() {
    echo ""
    echo -e "${CYAN}🐳 GERENCIADOR DEVCONTAINER BARBERSHOP${NC}"
    echo -e "${CYAN}=================================${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC} $0 [comando] [opções]"
    echo ""
    echo -e "${YELLOW}Comandos disponíveis:${NC}"
    echo ""
    echo -e "${GREEN}  setup${NC}        - Configurar ambiente inicial"
    echo -e "${GREEN}  start${NC}        - Iniciar aplicação em modo desenvolvimento"
    echo -e "${GREEN}  studio${NC}       - Abrir Prisma Studio"
    echo -e "${GREEN}  migrate${NC}      - Executar migrações do banco"
    echo -e "${GREEN}  seed${NC}         - Popular banco com dados de exemplo"
    echo -e "${GREEN}  reset${NC}        - Resetar banco de dados"
    echo -e "${GREEN}  logs${NC}         - Mostrar logs do container"
    echo -e "${GREEN}  test${NC}         - Executar testes"
    echo -e "${GREEN}  lint${NC}         - Executar linting e formatação"
    echo -e "${GREEN}  build${NC}        - Build da aplicação"
    echo -e "${GREEN}  shell${NC}        - Abrir shell no container"
    echo -e "${GREEN}  status${NC}       - Mostrar status dos serviços"
    echo -e "${GREEN}  clean${NC}        - Limpar cache e arquivos temporários"
    echo -e "${GREEN}  help${NC}         - Mostrar esta ajuda"
    echo ""
    echo -e "${YELLOW}Exemplos:${NC}"
    echo -e "${BLUE}  $0 setup${NC}      # Configurar ambiente pela primeira vez"
    echo -e "${BLUE}  $0 start${NC}      # Iniciar desenvolvimento"
    echo -e "${BLUE}  $0 studio${NC}     # Abrir interface do banco"
    echo ""
}

# Função para verificar se estamos no devcontainer
check_devcontainer() {
    if [ -z "$DEVCONTAINER" ] && [ -z "$REMOTE_CONTAINERS" ]; then
        echo -e "${WARNING} Este script deve ser executado dentro do devcontainer"
        echo -e "${INFO} Abra o projeto no VS Code e use 'Reopen in Container'"
        exit 1
    fi
}

# Função para verificar dependências
check_dependencies() {
    echo -e "${GEAR} Verificando dependências..."
    
    if ! command -v node &> /dev/null; then
        echo -e "${ERROR} Node.js não encontrado"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${ERROR} npm não encontrado"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        echo -e "${ERROR} npx não encontrado"
        exit 1
    fi
    
    echo -e "${CHECK} Dependências OK"
}

# Função para setup inicial
setup() {
    echo -e "${ROCKET} Configurando ambiente de desenvolvimento..."
    
    check_dependencies
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        echo -e "${GEAR} Instalando dependências..."
        npm install
    fi
    
    # Gerar cliente Prisma
    echo -e "${DATABASE} Gerando cliente Prisma..."
    npx prisma generate
    
    # Aguardar banco
    echo -e "${DATABASE} Aguardando PostgreSQL..."
    until pg_isready -h db -p 5432 -U postgres; do
        sleep 2
    done
    
    # Executar migrações
    echo -e "${DATABASE} Executando migrações..."
    npx prisma migrate deploy || npx prisma migrate dev --name init
    
    # Seed se necessário
    echo -e "${DATABASE} Verificando dados..."
    USER_COUNT=$(psql postgresql://postgres:postgres@db:5432/barbershop_dev -tAc "SELECT COUNT(*) FROM \"User\" LIMIT 1;" 2>/dev/null || echo "0")
    
    if [ "$USER_COUNT" -eq 0 ]; then
        echo -e "${DATABASE} Populando banco com dados..."
        npm run db:seed
    fi
    
    echo -e "${CHECK} Setup concluído!"
    echo -e "${INFO} Execute: $0 start"
}

# Função para iniciar aplicação
start() {
    echo -e "${ROCKET} Iniciando aplicação..."
    npm run dev
}

# Função para abrir Prisma Studio
studio() {
    echo -e "${DATABASE} Abrindo Prisma Studio..."
    npx prisma studio
}

# Função para executar migrações
migrate() {
    echo -e "${DATABASE} Executando migrações..."
    npx prisma migrate dev
}

# Função para seed
seed() {
    echo -e "${DATABASE} Populando banco com dados..."
    npm run db:seed
}

# Função para reset do banco
reset() {
    echo -e "${WARNING} Resetando banco de dados..."
    read -p "Tem certeza? Todos os dados serão perdidos (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${DATABASE} Resetando..."
        npx prisma migrate reset --force
        echo -e "${CHECK} Banco resetado!"
    else
        echo -e "${INFO} Operação cancelada"
    fi
}

# Função para mostrar logs
logs() {
    echo -e "${INFO} Mostrando logs..."
    docker compose logs -f app
}

# Função para executar testes
test() {
    echo -e "${GEAR} Executando testes..."
    npm test
}

# Função para lint
lint() {
    echo -e "${GEAR} Executando linting..."
    npm run lint:fix
}

# Função para build
build() {
    echo -e "${GEAR} Fazendo build da aplicação..."
    npm run build
}

# Função para abrir shell
shell() {
    echo -e "${INFO} Abrindo shell no container..."
    /bin/bash
}

# Função para mostrar status
status() {
    echo -e "${INFO} Status dos serviços:"
    echo ""
    echo -e "${CYAN}📊 Docker Compose:${NC}"
    docker compose ps
    echo ""
    echo -e "${CYAN}🗄️ PostgreSQL:${NC}"
    pg_isready -h db -p 5432 -U postgres && echo -e "${CHECK} Online" || echo -e "${ERROR} Offline"
    echo ""
    echo -e "${CYAN}🚀 Aplicação:${NC}"
    curl -s http://localhost:3000 > /dev/null && echo -e "${CHECK} Online" || echo -e "${WARNING} Offline"
}

# Função para limpar cache
clean() {
    echo -e "${GEAR} Limpando cache e arquivos temporários..."
    
    # Limpar cache do Next.js
    rm -rf .next
    
    # Limpar cache do npm
    npm cache clean --force
    
    # Limpar logs
    rm -f *.log
    
    echo -e "${CHECK} Limpeza concluída!"
}

# Processar argumentos
case "$1" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    studio)
        studio
        ;;
    migrate)
        migrate
        ;;
    seed)
        seed
        ;;
    reset)
        reset
        ;;
    logs)
        logs
        ;;
    test)
        test
        ;;
    lint)
        lint
        ;;
    build)
        build
        ;;
    shell)
        shell
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        echo -e "${WARNING} Nenhum comando especificado"
        show_help
        exit 1
        ;;
    *)
        echo -e "${ERROR} Comando desconhecido: $1"
        show_help
        exit 1
        ;;
esac