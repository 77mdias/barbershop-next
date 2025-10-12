# 🔄 Guia de Migração - Arquitetura Antiga → Profissional

## 📋 Visão Geral da Migração

Este guia explica como migrar da **arquitetura antiga** (containers monolíticos) para a **arquitetura profissional** (containers especializados).

### 🎯 **O que Mudou**

| Aspecto | ❌ Arquitetura Antiga | ✅ Arquitetura Profissional |
|---------|----------------------|------------------------------|
| **Dockerfile** | `Dockerfile` monolítico | `Dockerfile.pro` multi-stage |
| **Compose** | `docker-compose.prod.yml` | `docker-compose.pro.yml` |
| **Migrações** | No startup da aplicação | Container dedicado |
| **Segurança** | Schema exposto em produção | Schema isolado |
| **Deploy** | `./scripts/deploy.sh` | `./scripts/deploy-pro.sh` |

---

## 🚀 Processo de Migração

### 📋 **Passo 1: Backup e Preparação**
```bash
# 1. Fazer backup do banco (importante!)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Parar containers atuais
docker compose -f docker-compose.prod.yml down

# 3. Verificar se .env.production está correto
cat .env.production
```

### 📋 **Passo 2: Build da Nova Arquitetura**
```bash
# 1. Build das novas imagens
docker compose -f docker-compose.pro.yml build

# 2. Verificar se images foram criadas
docker images | grep barbershop
```

### 📋 **Passo 3: Deploy Profissional**
```bash
# 1. Primeiro deploy (com migrações)
./scripts/deploy-pro.sh deploy

# 2. Verificar se está funcionando
./scripts/deploy-pro.sh status

# 3. Testar aplicação
curl http://localhost:3000/api/health
```

### 📋 **Passo 4: Validação**
```bash
# 1. Ver logs
./scripts/deploy-pro.sh logs

# 2. Verificar banco
docker compose -f docker-compose.pro.yml run --rm migrator npx prisma migrate status

# 3. Testar funcionalidades críticas da aplicação
```

---

## 🔄 Comandos de Equivalência

### 📦 **Deploy e Operações**

| ❌ Comando Antigo | ✅ Comando Novo |
|------------------|----------------|
| `./scripts/deploy.sh deploy` | `./scripts/deploy-pro.sh deploy` |
| `./scripts/deploy.sh migrate` | `./scripts/deploy-pro.sh migrate` |
| `./scripts/deploy.sh logs` | `./scripts/deploy-pro.sh logs` |
| `./scripts/deploy.sh status` | `./scripts/deploy-pro.sh status` |

### 🐳 **Docker Compose**

| ❌ Comando Antigo | ✅ Comando Novo |
|------------------|----------------|
| `docker compose -f docker-compose.prod.yml up -d` | `docker compose -f docker-compose.pro.yml up -d app` |
| `docker compose -f docker-compose.prod.yml build` | `docker compose -f docker-compose.pro.yml build` |
| `docker compose -f docker-compose.prod.yml logs app` | `./scripts/deploy-pro.sh logs` |

### 🗄️ **Migrações**

| ❌ Comando Antigo | ✅ Comando Novo |
|------------------|----------------|
| `docker exec app npx prisma migrate deploy` | `./scripts/deploy-pro.sh migrate` |
| `docker compose -f docker-compose.prod.yml exec app npx prisma studio` | `docker compose -f docker-compose.pro.yml run --rm migrator npx prisma studio` |

---

## 🚨 Problemas Comuns na Migração

### ❌ **Problema: "Container não encontrado"**
```bash
# Causa: Tentando usar comandos antigos
docker exec barbershop-app-prod npx prisma migrate deploy

# Solução: Usar nova arquitetura
./scripts/deploy-pro.sh migrate
```

### ❌ **Problema: "Schema não encontrado"**
```bash
# Causa: Container de produção não tem schema (por design!)
docker compose -f docker-compose.pro.yml exec app npx prisma migrate deploy

# Solução: Usar container dedicado
./scripts/deploy-pro.sh migrate
```

### ❌ **Problema: "Migrações aplicadas duas vezes"**
```bash
# Causa: Executar migração manual após deploy automático
./scripts/deploy-pro.sh deploy  # já inclui migrações
./scripts/deploy-pro.sh migrate # redundante!

# Solução: Use apenas deploy completo ou migrate isolado
./scripts/deploy-pro.sh deploy   # OU
./scripts/deploy-pro.sh migrate  # seguido de app-only
```

---

## 🔧 Rollback (Se Necessário)

Se precisar voltar para a arquitetura antiga temporariamente:

```bash
# 1. Parar nova arquitetura
docker compose -f docker-compose.pro.yml down

# 2. Voltar para arquitetura antiga
docker compose -f docker-compose.prod.yml up -d

# 3. Aplicar migrações (se necessário)
./scripts/deploy.sh migrate
```

> ⚠️ **Atenção**: O rollback só é recomendado em emergências. A arquitetura profissional é mais segura e confiável.

---

## 📚 Documentação Atualizada

### 📖 **Novos Documentos**
- `docs/docker/README.md` - Visão geral da arquitetura profissional
- `docs/docker/PRODUCTION.md` - Guia específico de produção
- `docs/docker/MIGRATION.md` - Este documento

### 📝 **Documentos Atualizados**
- `.github/copilot-instructions.md` - Comandos atualizados
- `scripts/deploy-pro.sh` - Novo script de deploy
- `README.md` - Instruções principais do projeto

---

## ✅ Checklist Final

Após a migração, confirme:

- [ ] Aplicação está rodando: `curl http://localhost:3000/api/health`
- [ ] Banco está conectado: `./scripts/deploy-pro.sh logs`
- [ ] Migrações aplicadas: `docker compose -f docker-compose.pro.yml run --rm migrator npx prisma migrate status`
- [ ] Funcionalidades críticas testadas
- [ ] Scripts antigos removidos/depreciados
- [ ] Equipe treinada nos novos comandos
- [ ] Documentação atualizada nos procedimentos

---

## 🎉 Benefícios Alcançados

Após a migração, você terá:

### 🛡️ **Segurança**
- Container de produção sem schema do banco
- Superfície de ataque reduzida
- Princípio do menor privilégio aplicado

### 🚀 **Performance**
- Startup mais rápido da aplicação
- Imagens otimizadas e menores
- Cache de build melhorado

### 🔧 **Operacional**
- Migrações isoladas e controladas
- Logs separados por responsabilidade
- Falhas não bloqueiam aplicação
- Deploy mais confiável e previsível

**🎯 Parabéns! Sua aplicação agora segue as melhores práticas de produção empresarial!**