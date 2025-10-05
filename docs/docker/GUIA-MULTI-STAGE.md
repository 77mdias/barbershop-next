# 🎯 Guia Docker Multi-Stage - Barbershop Next.js

## 📋 Visão Geral

Este guia explica como usar o **Dockerfile multi-stage unificado** implementado no projeto Barbershop Next.js.

## 🏗️ Arquitetura dos Stages

### 📦 Stage 1: `deps` (Dependências Base)
```dockerfile
FROM node:20-alpine AS deps
```
**Função:** Base compartilhada com dependências comuns
- ✅ Timezone configurado para São Paulo
- ✅ `package.json` e `package-lock.json` copiados
- ✅ `npm ci` executado
- ✅ Prisma schema copiado

**Cache:** Este stage é **reutilizado** por todos os outros, otimizando builds.

### 🛠️ Stage 2: `dev` (Desenvolvimento)
```dockerfile
FROM deps AS dev
```
**Função:** Ambiente de desenvolvimento com hot reload
- ✅ Todo código fonte copiado
- ✅ Prisma Client gerado
- ✅ Portas 3000 (Next.js) e 5555 (Prisma Studio) expostas
- ✅ Volume binding para desenvolvimento

**Uso:** Target padrão para `docker-compose.yml`

### 🔨 Stage 3: `builder` (Build de Produção)
```dockerfile
FROM deps AS builder
```
**Função:** Compilação otimizada para produção
- ✅ Apenas arquivos necessários para build
- ✅ `npm run build` executado
- ✅ Assets estáticos gerados
- ✅ Prisma Client gerado

**Artefatos:** `.next/standalone`, `.next/static`, `public/`

### 🚀 Stage 4: `prod` (Produção Final)
```dockerfile
FROM node:20-alpine AS prod
```
**Função:** Imagem final mínima e segura
- ✅ Usuário não-root (`nextjs:nodejs`)
- ✅ Apenas dependencies de produção
- ✅ Artefatos copiados do stage `builder`
- ✅ Health check configurado
- ✅ Node.js server otimizado

## 🎯 Como Usar Cada Target

### Desenvolvimento Local
```bash
# Build apenas target dev
docker build --target dev -t barbershop-dev .

# Usando docker-compose (recomendado)
docker compose up -d

# Com script manager
./scripts/docker-manager.sh up dev
```

### Build de Produção
```bash
# Build apenas target prod
docker build --target prod -t barbershop-prod .

# Usando docker-compose prod
docker compose -f docker-compose.prod.yml up -d

# Com script manager
./scripts/docker-manager.sh up prod
```

### Build Completo (Todos Stages)
```bash
# Build até stage final (prod)
docker build -t barbershop-complete .

# Build com tag específica
docker build --target builder -t barbershop-builder .
```

## 📊 Comparação de Tamanhos

| Target | Tamanho Aproximado | Uso |
|--------|-------------------|-----|
| `deps` | ~800MB | Base compartilhada |
| `dev` | ~1.3GB | Desenvolvimento |
| `builder` | ~1.2GB | Build intermediário |
| `prod` | ~1.8GB | Produção final |

## 🔧 Configurações por Ambiente

### Desenvolvimento (target: dev)
```yaml
# docker-compose.yml
services:
  app:
    build:
      target: dev
    volumes:
      - .:/app              # Hot reload
      - /app/node_modules   # Cache de modules
    environment:
      - NODE_ENV=development
```

### Produção (target: prod)
```yaml
# docker-compose.prod.yml
services:
  app:
    build:
      target: prod
    # SEM volumes (imagem standalone)
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          memory: 1G
```

## 🚀 Otimizações Implementadas

### Cache de Layers
- **Layer `deps`**: Reutilizada entre dev/prod
- **Layer `npm ci`**: Cache quando `package.json` não muda
- **Layer source**: Apenas rebuilda quando código muda

### Segurança em Produção
- **Usuário não-root**: `nextjs:nodejs` (UID 1001)
- **Imagem mínima**: Apenas files essenciais
- **Dependencies**: Apenas production dependencies

### Performance
- **Standalone output**: Next.js self-contained
- **Assets estáticos**: Copiados separadamente
- **Health checks**: Monitoramento de container

## 🛠️ Troubleshooting

### Build Lento
```bash
# Verificar cache de layers
docker system df

# Limpar cache se necessário
docker builder prune
```

### Problemas de Permissão
```bash
# Dev: volumes como root (normal)
# Prod: files com ownership nextjs:nodejs
```

### Target Não Encontrado
```bash
# Verificar targets disponíveis
docker build --target deps .
docker build --target dev .
docker build --target builder .
docker build --target prod .
```

## 📈 Próximos Passos

1. **Monitorar tamanhos** de imagem após updates
2. **Implementar** multi-arch builds (ARM/x86)
3. **Adicionar** mais health checks específicos
4. **Otimizar** layers ainda mais com `.dockerignore`

---

**Criado:** 5 de outubro de 2025  
**Versão:** 1.0 - Dockerfile Multi-Stage Unificado