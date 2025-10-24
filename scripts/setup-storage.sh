#!/bin/bash

# ===== 🚀 STORAGE SETUP SCRIPT =====
# Script para configurar storage em produção
#
# Uso:
#   ./scripts/setup-storage.sh [provider]
#
# Providers suportados: s3, cloudinary, gcs, azure
#
# @author GitHub Copilot
# @since 2024-10-24

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===== FUNÇÕES =====

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ===== HELP =====
show_help() {
    echo "🚀 Barbershop Storage Setup Script"
    echo ""
    echo "Uso: $0 [provider]"
    echo ""
    echo "Providers disponíveis:"
    echo "  s3         - Amazon S3 + CloudFront"
    echo "  cloudinary - Cloudinary (recomendado para imagens)"
    echo "  gcs        - Google Cloud Storage"
    echo "  azure      - Azure Blob Storage"
    echo "  local      - Storage local (apenas desenvolvimento)"
    echo ""
    echo "Exemplos:"
    echo "  $0 cloudinary  # Setup Cloudinary"
    echo "  $0 s3         # Setup AWS S3"
    echo ""
}

# ===== VALIDAÇÕES =====
check_dependencies() {
    log_info "Verificando dependências..."
    
    # Verificar se Docker está rodando
    if ! docker compose ps >/dev/null 2>&1; then
        log_error "Docker não está rodando. Execute 'docker compose up -d' primeiro."
        exit 1
    fi
    
    # Verificar se app container existe
    if ! docker compose exec app echo "test" >/dev/null 2>&1; then
        log_error "Container 'app' não está rodando."
        exit 1
    fi
    
    log_success "Dependências OK"
}

# ===== SETUP PROVIDERS =====

setup_s3() {
    log_info "Configurando AWS S3..."
    
    echo "📝 Configuração necessária para AWS S3:"
    echo ""
    echo "1. Crie um bucket S3:"
    echo "   aws s3 mb s3://barbershop-uploads"
    echo ""
    echo "2. Configure permissões públicas para leitura"
    echo "3. (Opcional) Configure CloudFront CDN"
    echo ""
    echo "4. Adicione ao .env.production:"
    echo "   STORAGE_PROVIDER=s3"
    echo "   AWS_REGION=us-east-1"
    echo "   AWS_S3_BUCKET=barbershop-uploads"
    echo "   AWS_ACCESS_KEY_ID=your_key"
    echo "   AWS_SECRET_ACCESS_KEY=your_secret"
    echo "   AWS_CLOUDFRONT_URL=https://d123.cloudfront.net"
    echo ""
    
    # Instalar dependência se necessário
    log_info "Instalando AWS SDK..."
    docker compose exec app npm install @aws-sdk/client-s3
    
    log_success "AWS S3 configurado! Configure as variáveis de ambiente."
}

setup_cloudinary() {
    log_info "Configurando Cloudinary..."
    
    echo "📝 Configuração necessária para Cloudinary:"
    echo ""
    echo "1. Crie uma conta em cloudinary.com"
    echo "2. Obtenha suas credenciais no dashboard"
    echo "3. Crie um upload preset: barbershop-uploads"
    echo ""
    echo "4. Adicione ao .env.production:"
    echo "   STORAGE_PROVIDER=cloudinary"
    echo "   CLOUDINARY_CLOUD_NAME=your_cloud_name"
    echo "   CLOUDINARY_API_KEY=your_api_key"
    echo "   CLOUDINARY_API_SECRET=your_api_secret"
    echo "   CLOUDINARY_UPLOAD_PRESET=barbershop-uploads"
    echo ""
    
    # Instalar dependência
    log_info "Instalando Cloudinary SDK..."
    docker compose exec app npm install cloudinary
    
    log_success "Cloudinary configurado! Configure as variáveis de ambiente."
}

setup_gcs() {
    log_info "Configurando Google Cloud Storage..."
    
    echo "📝 Configuração necessária para GCS:"
    echo ""
    echo "1. Crie um projeto no Google Cloud"
    echo "2. Ative a API Cloud Storage"
    echo "3. Crie uma service account e baixe o JSON"
    echo "4. Crie um bucket:"
    echo "   gsutil mb gs://barbershop-uploads"
    echo ""
    echo "5. Adicione ao .env.production:"
    echo "   STORAGE_PROVIDER=gcs"
    echo "   GCP_PROJECT_ID=your_project_id"
    echo "   GCP_KEY_FILE=/app/gcp-service-account.json"
    echo "   GCS_BUCKET=barbershop-uploads"
    echo ""
    
    # Instalar dependência
    log_info "Instalando Google Cloud SDK..."
    docker compose exec app npm install @google-cloud/storage
    
    log_success "Google Cloud Storage configurado! Configure as variáveis de ambiente."
}

setup_azure() {
    log_info "Configurando Azure Blob Storage..."
    
    echo "📝 Configuração necessária para Azure:"
    echo ""
    echo "1. Crie uma Storage Account no Azure"
    echo "2. Crie um container 'uploads'"
    echo "3. Configure acesso público para blobs"
    echo ""
    echo "4. Adicione ao .env.production:"
    echo "   STORAGE_PROVIDER=azure"
    echo "   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;..."
    echo "   AZURE_CONTAINER_NAME=uploads"
    echo ""
    
    # Instalar dependência
    log_info "Instalando Azure SDK..."
    docker compose exec app npm install @azure/storage-blob
    
    log_success "Azure Blob Storage configurado! Configure as variáveis de ambiente."
}

setup_local() {
    log_info "Mantendo storage local..."
    
    echo "📝 Storage local está configurado para desenvolvimento."
    echo ""
    echo "⚠️  ATENÇÃO: Storage local NÃO é recomendado para produção!"
    echo ""
    echo "Para produção, use:"
    echo "  - Cloudinary (melhor para imagens)"
    echo "  - AWS S3 (mais barato e escalável)"
    echo "  - Google Cloud Storage"
    echo "  - Azure Blob Storage"
    echo ""
    
    log_success "Storage local mantido."
}

# ===== TESTE DE CONFIGURAÇÃO =====

test_storage() {
    log_info "Testando configuração de storage..."
    
    # Executar teste via Docker
    docker compose exec app npx tsx -e "
        import { checkProductionConfig } from './src/lib/upload/production-storage';
        
        console.log('🧪 Testando configuração...');
        
        const config = checkProductionConfig();
        
        console.log('Provider:', config.provider);
        console.log('Válido:', config.isValid);
        
        if (config.issues.length > 0) {
            console.log('⚠️  Problemas encontrados:');
            config.issues.forEach(issue => console.log('  -', issue));
        }
        
        if (config.recommendations.length > 0) {
            console.log('💡 Recomendações:');
            config.recommendations.forEach(rec => console.log('  -', rec));
        }
        
        if (config.isValid) {
            console.log('✅ Configuração válida!');
        } else {
            console.log('❌ Configuração inválida!');
            process.exit(1);
        }
    "
    
    if [ $? -eq 0 ]; then
        log_success "Teste de configuração passou!"
    else
        log_error "Teste de configuração falhou!"
        exit 1
    fi
}

# ===== MAIN =====

main() {
    echo "🚀 Barbershop Storage Setup"
    echo "=========================="
    echo ""
    
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_help
        exit 0
    fi
    
    if [ -z "$1" ]; then
        log_error "Provider não especificado!"
        echo ""
        show_help
        exit 1
    fi
    
    check_dependencies
    
    case "$1" in
        "s3")
            setup_s3
            ;;
        "cloudinary")
            setup_cloudinary
            ;;
        "gcs")
            setup_gcs
            ;;
        "azure")
            setup_azure
            ;;
        "local")
            setup_local
            ;;
        "test")
            test_storage
            exit 0
            ;;
        *)
            log_error "Provider '$1' não suportado!"
            echo ""
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    log_info "Próximos passos:"
    echo "1. Configure as variáveis de ambiente no .env.production"
    echo "2. Execute: $0 test"
    echo "3. Faça deploy da aplicação"
    echo ""
    log_success "Setup concluído!"
}

# Executar main com argumentos
main "$@"