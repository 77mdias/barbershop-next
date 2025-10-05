# ⚡ Comandos Rápidos - Docker Multi-Stage

## 🚀 Start Rápido

### Desenvolvimento
```bash
# Método 1: Script Manager (Recomendado)
./scripts/docker-manager.sh up dev

# Método 2: Docker Compose direto
docker compose up -d

# Método 3: Build manual + run
docker build --target dev -t barbershop-dev .
docker run -p 3000:3000 -p 5555:5555 barbershop-dev
```

### Produção
```bash
# Método 1: Script Manager (Recomendado)  
./scripts/docker-manager.sh up prod

# Método 2: Docker Compose direto
docker compose -f docker-compose.prod.yml up -d

# Método 3: Build manual + run
docker build --target prod -t barbershop-prod .
docker run -p 3000:3000 barbershop-prod
```

## 🔧 Comandos de Build

### Build por Target Específico
```bash
# Apenas dependências (cache)
docker build --target deps -t barbershop-deps .

# Ambiente de desenvolvimento
docker build --target dev -t barbershop-dev .

# Build de produção (sem imagem final)
docker build --target builder -t barbershop-builder .

# Imagem final de produção
docker build --target prod -t barbershop-prod .
```

### Build Completo
```bash
# Build até target final (prod)
docker build -t barbershop-complete .

# Build com tag personalizada
docker build -t barbershop:v1.0.0 .

# Rebuild sem cache
docker build --no-cache -t barbershop-fresh .
```

## 🎯 Targets Disponíveis

| Target | Comando | Uso |
|--------|---------|-----|
| `deps` | `--target deps` | Base de dependências |
| `dev` | `--target dev` | Desenvolvimento |
| `builder` | `--target builder` | Build intermediário |
| `prod` | `--target prod` | Produção final |

## 🛠️ Comandos de Desenvolvimento

### Logs e Debug
```bash
# Ver logs em tempo real
./scripts/docker-manager.sh logs dev

# Acessar shell do container
./scripts/docker-manager.sh shell dev

# Ver status dos containers
./scripts/docker-manager.sh status
```

### Prisma e Banco
```bash
# Prisma Studio (apenas dev)
./scripts/docker-manager.sh studio dev

# Migrações
./scripts/docker-manager.sh migrate dev

# Seed do banco
./scripts/docker-manager.sh seed dev

# Acessar PostgreSQL
./scripts/docker-manager.sh db dev
```

## 🧹 Limpeza e Manutenção

### Limpeza Básica
```bash
# Parar containers
./scripts/docker-manager.sh down dev
./scripts/docker-manager.sh down prod

# Remover imagens locais
docker rmi barbershop-dev barbershop-prod
```

### Limpeza Completa
```bash
# Script de limpeza automática
./scripts/docker-manager.sh clean

# Limpeza manual completa
docker system prune -af --volumes
```

## 🔍 Debug e Troubleshooting

### Verificar Builds
```bash
# Listar imagens
docker images | grep barbershop

# Verificar layers
docker history barbershop-dev

# Analisar tamanho
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### Problemas Comuns
```bash
# Cache corrompido
docker builder prune

# Container não inicia
docker logs barbershop-app-dev

# Porta ocupada
docker ps | grep :3000
```

## 📊 Informações do Sistema

### Tamanhos Esperados
```bash
# Verificar tamanhos das imagens
docker images barbershop*

# Resultado esperado:
# barbershop-deps     ~800MB
# barbershop-dev      ~1.3GB  
# barbershop-prod     ~1.8GB
```

### Performance
```bash
# Verificar uso de recursos
docker stats

# Verificar cache de build
docker system df
```

## ⚙️ Configurações por Ambiente

### Variáveis de Ambiente
```bash
# Desenvolvimento
cp .env.development.example .env.development

# Produção  
cp .env.production.example .env.production
```

### Ports Mapping
```bash
# Desenvolvimento
# 3000:3000 -> Next.js
# 5555:5555 -> Prisma Studio
# 5432:5432 -> PostgreSQL

# Produção
# 3000:3000 -> Next.js apenas
```

---

**Criado:** 5 de outubro de 2025  
**Versão:** 1.0 - Comandos para Docker Multi-Stage Unificado