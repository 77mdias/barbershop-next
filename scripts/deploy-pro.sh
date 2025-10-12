#!/bin/bash

# ===============================================
# 🚀 DEPLOY PROFISSIONAL - SEPARAÇÃO DE RESPONSABILIDADES
# ===============================================

set -e

echo "🏗️  Deploy Profissional - Barbershop"
echo "===================================="

show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  migrate     - Executar apenas migrações"
    echo "  deploy      - Deploy completo (migração + aplicação)"
    echo "  app-only    - Deploy apenas da aplicação"
    echo "  rollback    - Rollback para versão anterior"
    echo "  logs        - Ver logs da aplicação"
    echo "  status      - Status dos serviços"
    echo "  help        - Mostrar ajuda"
}

run_migrations() {
    echo "🔄 Executando migrações..."
    docker compose -f docker-compose.pro.yml --profile migration up migrator
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrações aplicadas com sucesso!"
    else
        echo "❌ Falha nas migrações!"
        exit 1
    fi
}

deploy_app() {
    echo "🚀 Fazendo deploy da aplicação..."
    docker compose -f docker-compose.pro.yml up -d app
    
    if [ $? -eq 0 ]; then
        echo "✅ Aplicação deployada com sucesso!"
    else
        echo "❌ Falha no deploy da aplicação!"
        exit 1
    fi
}

case "$1" in
    "migrate")
        run_migrations
        ;;
    "deploy")
        echo "🏗️  Build das imagens..."
        docker compose -f docker-compose.pro.yml build
        
        run_migrations
        deploy_app
        
        echo "🎉 Deploy completo realizado!"
        ;;
    "app-only")
        deploy_app
        ;;
    "rollback")
        echo "🔄 Implementar rollback..."
        # TODO: Implementar estratégia de rollback
        ;;
    "logs")
        docker compose -f docker-compose.pro.yml logs -f app
        ;;
    "status")
        docker compose -f docker-compose.pro.yml ps
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Comando inválido: $1"
        show_help
        exit 1
        ;;
esac