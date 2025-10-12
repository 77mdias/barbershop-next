# 🐳 Arquitetura Docker Profissional - Barbershop Next.js

Este documento descreve a **arquitetura Docker profissional** implementada seguindo as melhores práticas de produção empresarial.

> **� Nova Arquitetura (Out/2025)**: **Separação de responsabilidades** com containers especializados para máxima segurança e performance.

## 🎯 Princípios da Arquitetura Profissional

### ✅ **Princípios Aplicados:**
- **Separação de Responsabilidades**: Migrações e aplicação em containers separados
- **Princípio do Menor Privilégio**: Container de produção sem schema do banco
- **Imutabilidade**: Containers especializados para funções específicas
- **Segurança**: Superfície de ataque reduzida
- **Performance**: Imagens otimizadas e startup rápido

### 🏗️ **Arquitetura Multi-Container:**

```
┌─────────────────────────────────────────────┐
│            Dockerfile.pro                   │
├─────────────────────────────────────────────┤
│ 📦 base      → Alpine + dumb-init + security │
│ � deps      → Dependências de produção      │
│ 🔨 builder   → Build da aplicação            │
│ �️ migrator  → Executar migrações (isolado)  │
│ 🚀 production→ Aplicação limpa (sem schema)  │
└─────────────────────────────────────────────┘
```

---

## 📦 Containers Especializados

```
┌─────────────────┐    ┌─────────────────┐
│   Container     │    │   Container     │
│   app:dev       │    │   db            │
│                 │    │                 │
│ - Next.js :3000 │◄───┤ - PostgreSQL    │
│ - Prisma Studio │    │   :5432         │
│   :5555         │    │ - Health checks │
└─────────────────┘    └─────────────────┘
      ↓ Build
┌─────────────────┐
│   Container     │
│   app:prod      │
│                 │
│ - Next.js :3000 │ ──► Banco Externo
│ - Usuário       │     (Neon Database)
│   não-root      │
└─────────────────┘
```

## Serviços Ativos

### 📦 **Migrator Container** (`barbershop-migrator`)
- **Propósito**: Executar migrações do banco de dados
- **Ciclo de vida**: Executa uma vez e termina (`restart: "no"`)
- **Conteúdo**: Schema Prisma + dependências mínimas
- **Target**: `migrator` no `Dockerfile.pro`
- **Segurança**: Acesso isolado ao banco para migrações

### 🚀 **Application Container** (`barbershop-app-prod`)
- **Propósito**: Executar apenas a aplicação Next.js
- **Ciclo de vida**: Longa duração (`restart: unless-stopped`)
- **Conteúdo**: Build da aplicação + dependências de runtime
- **Target**: `production` no `Dockerfile.pro`
- **Segurança**: **SEM schema Prisma** - superfície de ataque reduzida

### 🔄 **Nginx Container** (`barbershop-nginx-prod`)
- **Propósito**: Proxy reverso e load balancer
- **Ciclo de vida**: Longa duração
- **Conteúdo**: Nginx Alpine + configurações SSL
- **Profile**: `proxy` (opcional)

---

## 🚦 Guia de Uso Prático

### 🏗️ **Deploy Profissional (Recomendado)**

```bash
# Deploy completo: migrações + aplicação
./scripts/deploy-pro.sh deploy

# Apenas executar migrações
./scripts/deploy-pro.sh migrate

# Apenas aplicação (pós-migração)
./scripts/deploy-pro.sh app-only

# Ver logs da aplicação
./scripts/deploy-pro.sh logs

# Status de todos os serviços
./scripts/deploy-pro.sh status
```

### ⚙️ **Comandos Docker Diretos**

```bash
# Build de todas as imagens
docker compose -f docker-compose.pro.yml build

# Executar apenas migrações
docker compose -f docker-compose.pro.yml --profile migration up migrator

# Subir aplicação (depende de migrações)
docker compose -f docker-compose.pro.yml up -d app

# Subir com proxy nginx
docker compose -f docker-compose.pro.yml --profile proxy up -d

# Parar todos os serviços
docker compose -f docker-compose.pro.yml down
```

### 🛠️ **Desenvolvimento (Ambiente Local)**

```bash
# Desenvolvimento com hot reload
docker compose up app

# Banco de desenvolvimento
docker compose up -d db

# Migrações de desenvolvimento
docker compose exec app npx prisma migrate dev

# Prisma Studio
docker compose exec app npx prisma studio
```

### Produção (docker-compose.prod.yml)  
- **app** (target: prod): Container otimizado, usuário não-root, sem volumes
- **nginx**: Proxy reverso (opcional)
- **Banco**: Externo via Neon Database (não containerizado)

## Portas e Acesso

| Serviço | Porta | URL | Ambiente |
|---------|-------|-----|----------|
| Next.js | 3000 | http://localhost:3000 | dev/prod |
| Prisma Studio | 5555 | http://localhost:5555 | dev only |
| PostgreSQL | 5432 | localhost:5432 | dev only |
| Neon Database | - | Via connection string | prod only |

## Comandos Principais

### Usar Script Manager (Recomendado)
```bash
# Subir ambiente completo de desenvolvimento
./scripts/docker-manager.sh up dev

# Subir ambiente de produção
./scripts/docker-manager.sh up prod

# Abrir Prisma Studio (apenas desenvolvimento)
./scripts/docker-manager.sh studio dev

# Build com target específico
./scripts/docker-manager.sh build dev   # Target: dev
./scripts/docker-manager.sh build prod  # Target: prod

# Ver status dos containers
./scripts/docker-manager.sh status

# Acessar shell do container
./scripts/docker-manager.sh shell dev

# Acessar PostgreSQL
./scripts/docker-manager.sh db dev
```

### Comandos Docker Diretos
```bash
# Desenvolvimento
docker-compose up -d
docker-compose logs -f
docker-compose exec app sh

# Produção
docker-compose -f docker-compose.prod.yml up -d
```

## Volumes e Persistência

### Desenvolvimento
- **Código fonte**: `.:/app` (hot reload)
- **Node modules**: `/app/node_modules` (performance)
- **Dados PostgreSQL**: `barbershop_pgdata_dev` (persistente)

### Produção
- **Apenas dados PostgreSQL**: `barbershop_pgdata_prod` (persistente)
- **Sem volumes de código** (build incluído na imagem)

## Troubleshooting

### Prisma Studio não abre
```bash
# Verificar se app está rodando
./scripts/docker-manager.sh status

# Se necessário, reiniciar
./scripts/docker-manager.sh down dev
./scripts/docker-manager.sh up dev
```

### Porta já em uso
```bash
# Verificar quem está usando a porta
sudo netstat -tulpn | grep :3000

# Parar containers se necessário
./scripts/docker-manager.sh down dev
```

### Problemas de build
```bash
# Rebuild sem cache
./scripts/docker-manager.sh rebuild dev

# Limpeza completa
./scripts/docker-manager.sh clean
```

### Problemas de permissão (Linux)
```bash
# Ajustar permissões dos volumes
sudo chown -R $(id -u):$(id -g) .

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

## Logs e Debugging

```bash
# Logs de todos os serviços
./scripts/docker-manager.sh logs dev

# Logs específicos
docker-compose logs app
docker-compose logs db

# Debug dentro do container
./scripts/docker-manager.sh shell dev
ps aux
df -h
env | grep DATABASE
```

## Diferenças Dev vs Prod

### Desenvolvimento
- Hot reload ativo
- Volumes montados
- PostgreSQL exposto
- Container roda como root (volumes)
- Prisma Studio disponível

### Produção
- Build otimizado
- Imagem mínima (~200MB)
- Container não-root
- PostgreSQL interno
- NGINX opcional
- Health checks ativos

---

📚 **Documentação relacionada**:
- `DOCKER.md` - Guia completo
- `SETUP-DOCKER.md` - Setup inicial
- `docs/docker/CORRECCAO-DOCKER-MANAGER.md` - Detalhes da correção