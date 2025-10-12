# 🚀 Guia de Produção - Arquitetura Docker Profissional

## 📋 Checklist de Deploy

### ✅ **Pré-requisitos**
- [ ] Arquivo `.env.production` configurado
- [ ] Banco de dados de produção acessível
- [ ] Docker e Docker Compose instalados
- [ ] Permissões de execução nos scripts (`chmod +x scripts/*.sh`)

### ✅ **Primeiro Deploy**
```bash
# 1. Verificar configuração
cat .env.production

# 2. Build das imagens
docker compose -f docker-compose.pro.yml build

# 3. Deploy completo
./scripts/deploy-pro.sh deploy

# 4. Verificar status
./scripts/deploy-pro.sh status
```

---

## 🔄 Fluxo de Deploy Profissional

### 🎯 **Deploy Automático**
```bash
./scripts/deploy-pro.sh deploy
```

**O que acontece:**
1. 🏗️ **Build**: Constrói imagens especializadas
2. 🗄️ **Migration**: Executa container `migrator` (uma vez)
3. ✅ **Validation**: Verifica se migrações foram bem-sucedidas
4. 🚀 **Application**: Sobe container `production` (depende de #3)
5. 🔍 **Health Check**: Valida se aplicação está respondendo

### 🛡️ **Segurança por Design**
- **Container de produção**: SEM acesso ao schema Prisma
- **Migrações isoladas**: Executadas em container separado
- **Usuários não-root**: Todos os containers usam usuários limitados
- **Falhas isoladas**: Problemas em migrações não afetam aplicação

---

## 📊 Monitoramento e Logs

### 📋 **Ver Logs**
```bash
# Logs da aplicação (tempo real)
./scripts/deploy-pro.sh logs

# Logs do migrator
docker compose -f docker-compose.pro.yml logs migrator

# Logs do nginx (se habilitado)
docker compose -f docker-compose.pro.yml --profile proxy logs nginx
```

### 📈 **Health Checks**
```bash
# Status de todos os serviços
./scripts/deploy-pro.sh status

# Health check manual da aplicação
curl http://localhost:3000/api/health

# Verificar se aplicação está respondendo
docker compose -f docker-compose.pro.yml ps
```

---

## 🔧 Operações de Manutenção

### 🗄️ **Migrações**
```bash
# Aplicar novas migrações
./scripts/deploy-pro.sh migrate

# Verificar status das migrações
docker compose -f docker-compose.pro.yml run --rm migrator npx prisma migrate status

# Executar migração específica (troubleshooting)
docker compose -f docker-compose.pro.yml run --rm migrator npx prisma migrate deploy
```

### 🔄 **Atualizações da Aplicação**
```bash
# Rebuild apenas da aplicação
docker compose -f docker-compose.pro.yml build app

# Deploy apenas da aplicação (sem migrações)
./scripts/deploy-pro.sh app-only

# Restart da aplicação
docker compose -f docker-compose.pro.yml restart app
```

### 🧹 **Limpeza**
```bash
# Parar todos os serviços
docker compose -f docker-compose.pro.yml down

# Remover volumes (⚠️ CUIDADO: remove dados locais)
docker compose -f docker-compose.pro.yml down -v

# Limpar imagens não utilizadas
docker system prune -f
```

---

## 🚨 Troubleshooting

### ❌ **Problema: Migração falha**
```bash
# Ver logs detalhados do migrator
docker compose -f docker-compose.pro.yml logs migrator

# Executar migração interativa
docker compose -f docker-compose.pro.yml run --rm migrator sh

# Verificar conectividade com banco
docker compose -f docker-compose.pro.yml run --rm migrator npx prisma db pull
```

### ❌ **Problema: Aplicação não sobe**
```bash
# Ver logs da aplicação
./scripts/deploy-pro.sh logs

# Verificar variáveis de ambiente
docker compose -f docker-compose.pro.yml config

# Health check manual
curl -f http://localhost:3000/api/health || echo "App não está respondendo"
```

### ❌ **Problema: Dependency de migrações**
```bash
# Forçar execução da aplicação (bypass dependency)
docker compose -f docker-compose.pro.yml up -d app --no-deps

# Executar migração manualmente depois
./scripts/deploy-pro.sh migrate
```

---

## 🏆 Boas Práticas de Produção

### ✅ **Faça**
- Use sempre `./scripts/deploy-pro.sh deploy` para deploy completo
- Monitore logs regularmente
- Faça backup do banco antes de migrações grandes
- Teste migrações em ambiente de staging primeiro
- Use profiles do Docker Compose (`--profile proxy`)

### ❌ **Não Faça**
- Não execute migrações diretamente no container de produção
- Não use `docker-compose.yml` (desenvolvimento) em produção
- Não pule verificações de health check
- Não execute comandos root nos containers
- Não exponha portas desnecessárias

---

## 🔐 Configuração de Segurança

### 🛡️ **Variáveis de Ambiente Sensíveis**
```bash
# .env.production (exemplo)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
```

### 🔒 **Configurações de Rede**
```yaml
# Isolamento de rede
networks:
  barbershop-network:
    driver: bridge
    internal: false  # Acesso externo apenas para app
```

### 👤 **Usuários dos Containers**
- **migrator**: `migrator:migrator` (uid/gid: 1001)
- **production**: `nextjs:nodejs` (uid/gid: 1001)
- **nginx**: `nginx:nginx` (uid/gid: 101)

---

## 📈 Escalabilidade

### 🔄 **Load Balancing com Nginx**
```bash
# Habilitar proxy nginx
docker compose -f docker-compose.pro.yml --profile proxy up -d

# Múltiplas instâncias da aplicação
docker compose -f docker-compose.pro.yml up -d --scale app=3
```

### 📊 **Recursos e Limites**
```yaml
deploy:
  resources:
    limits:
      cpus: "1.0"
      memory: 1G
    reservations:
      cpus: "0.5"
      memory: 512M
```

---

**🎯 Esta arquitetura garante deployments seguros, rápidos e confiáveis em produção!**