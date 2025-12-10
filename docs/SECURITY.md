# 🔒 Guia de Segurança Docker - Barbershop Next.js

## 📋 Visão Geral

Este projeto possui **duas configurações Docker distintas** com níveis de segurança apropriados para cada ambiente.

## 🏠 Ambiente de Desenvolvimento

### ✅ **Configuração Atual (Segura para Dev Local)**

```dockerfile
# Dockerfile.dev - Simplificado para desenvolvimento
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
```

### 🔒 **Aspectos de Segurança**

| Aspecto | Status | Justificativa |
|---------|--------|---------------|
| **Container Root** | ⚠️ Aceitável | Necessário para compatibilidade com volumes montados |
| **Isolamento** | ✅ Seguro | Container isolado em rede Docker privada |
| **Exposição de Portas** | ✅ Controlada | Apenas portas necessárias (3000, 5432, 5555) |
| **Volumes** | ✅ Limitados | Apenas código do projeto montado |
| **Rede** | ✅ Isolada | Comunicação apenas entre containers do projeto |

### ⚠️ **Limitações de Segurança**

- **Root User**: Container executa como root
- **Build Simplificado**: Menos layers de otimização
- **Dev Dependencies**: Inclui dependências de desenvolvimento

### ✅ **Por que é Seguro para Desenvolvimento Local**

1. **Isolamento Completo**: Container não tem acesso ao sistema host
2. **Rede Privada**: Comunicação apenas entre containers do projeto
3. **Volumes Limitados**: Apenas o diretório do projeto é montado
4. **Ambiente Controlado**: Rodando apenas em máquina do desenvolvedor

## 🚀 Ambiente de Produção

### ✅ **Configuração Robusta (Dockerfile.prod)**

```dockerfile
# Multi-stage build otimizado
FROM node:20-alpine AS deps
# ... instalação de dependências

FROM node:20-alpine AS builder  
# ... build da aplicação

FROM node:20-alpine AS runner
# Usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
# ... configuração final
```

### 🛡️ **Medidas de Segurança Implementadas**

| Medida | Implementação |
|--------|---------------|
| **Multi-stage Build** | Reduz tamanho e superfície de ataque |
| **Usuário Não-Root** | Container executa como `nextjs:nodejs` |
| **Imagem Mínima** | Alpine Linux (~200MB final) |
| **Health Checks** | Monitoramento ativo de saúde |
| **Resource Limits** | CPU e memória limitados |
| **NGINX Proxy** | Rate limiting e headers de segurança |
| **Network Isolation** | Banco não exposto externamente |

## 🚨 Regras de Uso

### ✅ **PERMITIDO - Desenvolvimento**
```bash
# Para desenvolvimento local
./scripts/docker-manager.sh up dev
```

### ❌ **PROIBIDO - Desenvolvimento em Produção**
```bash
# NUNCA fazer isso em servidores
docker-compose -f docker-compose.yml up  # ❌
```

### ✅ **OBRIGATÓRIO - Produção**
```bash
# Para produção/staging
./scripts/docker-manager.sh up prod
```

## 📊 Comparação de Segurança

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **Usuário** | root | nextjs (não-privilegiado) |
| **Build** | Single-stage | Multi-stage |
| **Tamanho** | ~800MB | ~200MB |
| **Dependencies** | Dev + Prod | Apenas Prod |
| **Network** | PostgreSQL exposto | PostgreSQL interno |
| **Proxy** | Direto | NGINX com security headers |
| **Rate Limiting** | Não | Sim |
| **Health Checks** | Básico | Completo |
| **Resource Limits** | Não | Sim |

## 🔍 Auditoria de Segurança

### ✅ **Verificações Automáticas**

```bash
# Verificar configuração de desenvolvimento
./scripts/docker-manager.sh status

# Verificar se está usando configuração correta
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"

# Verificar usuário do container
docker exec barbershop-app-dev whoami
# Desenvolvimento: root (esperado)

docker exec barbershop-app-prod whoami
# Produção: nextjs (esperado)
```

### 🚨 **Red Flags em Produção**

```bash
# ❌ Sinais de configuração incorreta em produção:
- Container rodando como root
- PostgreSQL exposto na porta 5432
- Ausência de rate limiting
- Dependências de desenvolvimento presentes
- Ausência de health checks
```

## 📚 Melhores Práticas

### 🏠 **Para Desenvolvimento**

1. **Use apenas localmente**: Nunca exponha em rede
2. **Mantenha atualizado**: `docker system prune` regularmente
3. **Monitor recursos**: `docker stats` para verificar uso
4. **Logs estruturados**: `./scripts/docker-manager.sh logs dev`

### 🚀 **Para Produção**

1. **Use apenas Dockerfile.prod**: Nunca dev em produção
2. **Configure SSL/TLS**: HTTPS obrigatório
3. **Monitor continuamente**: Health checks + logging
4. **Backup automatizado**: Database + volumes
5. **Updates regulares**: Base images e dependências

## 🆘 Troubleshooting de Segurança

### ❓ **"É seguro rodar como root em dev?"**
✅ **SIM** - Para desenvolvimento local:
- Container completamente isolado
- Sem acesso à rede externa
- Volumes limitados ao projeto
- Ambiente controlado

### ❓ **"Posso usar dev config em staging?"**
❌ **NÃO** - Sempre usar configuração de produção:
- Staging deve espelhar produção
- Testes de segurança não seriam válidos
- Risk de vazamento para produção

### ❓ **"Como garantir que estou usando config correta?"**
```bash
# Verificar ambiente
echo $NODE_ENV

# Verificar usuário do container
docker exec -it barbershop-app-dev whoami

# Development: root
# Production: nextjs
```

## 🎯 Roadmap de Segurança

### 📅 **Próximas Melhorias**

1. **Container Scanning**: Vulnerabilidades em dependencies
2. **Secret Management**: HashiCorp Vault ou similar
3. **Network Policies**: Kubernetes Network Policies
4. **Image Signing**: Cosign para verificação de integridade
5. **RBAC**: Role-Based Access Control

---

**💡 Resumo**: A configuração de desenvolvimento é **segura para uso local**, mas **nunca deve ser usada em produção**. Use sempre `Dockerfile.prod` para ambientes de staging/produção.