#!/bin/bash

# ===============================================
# 🐳 SCRIPT DE GERENCIAMENTO DOCKER
# ===============================================
# Script para facilitar comandos Docker em desenvolvimento e produção
# Uso: ./scripts/docker-manager.sh [comando] [ambiente]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir ajuda
show_help() {
    echo -e "${BLUE}🐳 Docker Manager - Barbershop Next.js${NC}"
    echo ""
    echo "Uso: ./scripts/docker-manager.sh [comando] [ambiente]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  ${GREEN}up [dev|prod]${NC}      - Subir containers"
    echo "  ${GREEN}down [dev|prod]${NC}    - Parar containers"
    echo "  ${GREEN}build [dev|prod]${NC}   - Fazer build das imagens"
    echo "  ${GREEN}rebuild [dev|prod]${NC} - Rebuild completo (sem cache)"
    echo "  ${GREEN}logs [dev|prod]${NC}    - Ver logs dos containers"
    echo "  ${GREEN}shell [dev|prod]${NC}   - Acessar shell do container app"
    echo "  ${GREEN}db [dev|prod]${NC}      - Acessar PostgreSQL"
    echo "  ${GREEN}studio [dev]${NC}       - Abrir Prisma Studio"
    echo "  ${GREEN}migrate [dev|prod]${NC} - Executar migrações"
    echo "  ${GREEN}seed [dev|prod]${NC}    - Executar seed do banco"
    echo "  ${GREEN}clean${NC}              - Limpar containers, imagens e volumes"
    echo "  ${GREEN}status${NC}             - Ver status dos containers"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/docker-manager.sh up dev"
    echo "  ./scripts/docker-manager.sh logs prod"
    echo "  ./scripts/docker-manager.sh migrate dev"
}

# Função para validar ambiente
validate_env() {
    if [ "$1" != "dev" ] && [ "$1" != "prod" ]; then
        echo -e "${RED}❌ Ambiente deve ser 'dev' ou 'prod'${NC}"
        exit 1
    fi
}

# Função para obter arquivo docker-compose
get_compose_file() {
    if [ "$1" = "dev" ]; then
        echo "docker-compose.yml"
    else
        echo "docker-compose.prod.yml"
    fi
}

# Função para subir containers
docker_up() {
    validate_env $1
    local compose_file=$(get_compose_file $1)
    
    echo -e "${GREEN}🚀 Subindo containers para ambiente: $1${NC}"
    
    if [ "$1" = "dev" ]; then
        docker compose -f $compose_file up -d
        echo -e "${BLUE}📊 Aguardando banco de dados...${NC}"
        sleep 5
        echo -e "${BLUE}🔧 Executando migrações...${NC}"
        docker compose -f $compose_file exec app npm run db:migrate
    else
        docker compose -f $compose_file up -d
    fi
    
    echo -e "${GREEN}✅ Containers iniciados com sucesso!${NC}"
}

# Função para parar containers
docker_down() {
    validate_env $1
    local compose_file=$(get_compose_file $1)
    
    echo -e "${YELLOW}⏹️  Parando containers para ambiente: $1${NC}"
    docker compose -f $compose_file down
    echo -e "${GREEN}✅ Containers parados com sucesso!${NC}"
}

# Função para build
docker_build() {
    validate_env $1
    local compose_file=$(get_compose_file $1)
    
    echo -e "${BLUE}🔨 Fazendo build para ambiente: $1${NC}"
    docker compose -f $compose_file build
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
}

# Função para rebuild
docker_rebuild() {
    validate_env $1
    local compose_file=$(get_compose_file $1)
    
    echo -e "${BLUE}🔨 Fazendo rebuild (sem cache) para ambiente: $1${NC}"
    docker compose -f $compose_file build --no-cache
    echo -e "${GREEN}✅ Rebuild concluído com sucesso!${NC}"
}

# Função para ver logs
docker_logs() {
    validate_env $1
    local compose_file=$(get_compose_file $1)
    
    echo -e "${BLUE}📋 Logs do ambiente: $1${NC}"
    docker compose -f $compose_file logs -f
}

# Função para acessar shell
docker_shell() {
    validate_env $1
    local compose_file=$(get_compose_file $1)
    
    echo -e "${BLUE}🖥️  Acessando shell do container (ambiente: $1)${NC}"
    docker compose -f $compose_file exec app sh
}

# Função para acessar PostgreSQL
docker_db() {
    validate_env $1
    local compose_file=$(get_compose_file $1)
    
    echo -e "${BLUE}🗄️  Acessando PostgreSQL (ambiente: $1)${NC}"
    if [ "$1" = "dev" ]; then
        docker compose -f $compose_file exec db psql -U postgres -d barbershop_dev
    else
        docker compose -f $compose_file exec db psql -U postgres -d barbershop_prod
    fi
}

# Função para Prisma Studio
docker_studio() {
    if [ "$1" != "dev" ]; then
        echo -e "${RED}❌ Prisma Studio só está disponível em desenvolvimento${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📊 Abrindo Prisma Studio...${NC}"
    local compose_file=$(get_compose_file dev)
    
    # Verificar se o container app está rodando
    if ! docker compose -f $compose_file ps app | grep -q "running"; then
        echo -e "${YELLOW}⚠️  Container app não está rodando. Iniciando...${NC}"
        docker compose -f $compose_file up -d app
        echo -e "${BLUE}📊 Aguardando container app...${NC}"
        sleep 5
    fi
    
    # Executar Prisma Studio no container app
    echo -e "${BLUE}🚀 Iniciando Prisma Studio no container app...${NC}"
    docker compose -f $compose_file exec -d app npx prisma studio --port 5555 --hostname 0.0.0.0
    echo -e "${GREEN}✅ Prisma Studio disponível em: http://localhost:5555${NC}"
}

# Função para executar migrações
docker_migrate() {
    validate_env $1
    local compose_file=$(get_compose_file $1)
    
    echo -e "${BLUE}🔧 Executando migrações (ambiente: $1)${NC}"
    docker compose -f $compose_file exec app npm run db:migrate
    echo -e "${GREEN}✅ Migrações executadas com sucesso!${NC}"
}

# Função para executar seed
docker_seed() {
    validate_env $1
    local compose_file=$(get_compose_file $1)
    
    echo -e "${BLUE}🌱 Executando seed (ambiente: $1)${NC}"
    docker compose -f $compose_file exec app npm run db:seed
    echo -e "${GREEN}✅ Seed executado com sucesso!${NC}"
}

# Função para limpeza
docker_clean() {
    echo -e "${YELLOW}🧹 Limpando containers, imagens e volumes...${NC}"
    read -p "Tem certeza? Esta ação é irreversível. (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose down -v --remove-orphans
        docker compose -f docker-compose.prod.yml down -v --remove-orphans
        docker system prune -af --volumes
        echo -e "${GREEN}✅ Limpeza concluída!${NC}"
    else
        echo -e "${BLUE}ℹ️  Operação cancelada.${NC}"
    fi
}

# Função para status
docker_status() {
    echo -e "${BLUE}📊 Status dos containers:${NC}"
    echo ""
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main
case "$1" in
    "up")
        docker_up $2
        ;;
    "down")
        docker_down $2
        ;;
    "build")
        docker_build $2
        ;;
    "rebuild")
        docker_rebuild $2
        ;;
    "logs")
        docker_logs $2
        ;;
    "shell")
        docker_shell $2
        ;;
    "db")
        docker_db $2
        ;;
    "studio")
        docker_studio $2
        ;;
    "migrate")
        docker_migrate $2
        ;;
    "seed")
        docker_seed $2
        ;;
    "clean")
        docker_clean
        ;;
    "status")
        docker_status
        ;;
    *)
        show_help
        ;;
esac