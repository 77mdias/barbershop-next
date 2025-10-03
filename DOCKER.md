# 🐳 Docker Setup - Barbershop Next.js

Este guia explica como usar Docker para desenvolvimento e produção do projeto Barbershop Next.js.

## 📋 Pré-requisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git** para clonar o repositório

## 🚀 Quick Start

### 1. Clone e Configure

```bash
# Clone o repositório
git clone <repository-url>
cd barbershop-next

# Copie o arquivo de ambiente
cp .env.example .env.development

# Configure as variáveis necessárias
nano .env.development
```

### 2. Desenvolvimento

```bash
# Usar o script manager (recomendado)
./scripts/docker-manager.sh up dev

# Ou comando direto
docker-compose up -d
```

### 3. Produção

```bash
# Configure o ambiente de produção
cp .env.example .env.production
nano .env.production

# Suba o ambiente
./scripts/docker-manager.sh up prod
```

## 🛠️ Comandos Essenciais

### Script Manager (Recomendado)

```bash
# Ver todos os comandos disponíveis
./scripts/docker-manager.sh

# Desenvolvimento
./scripts/docker-manager.sh up dev        # Subir containers
./scripts/docker-manager.sh logs dev      # Ver logs
./scripts/docker-manager.sh shell dev     # Acessar shell
./scripts/docker-manager.sh db dev        # Acessar PostgreSQL
./scripts/docker-manager.sh studio dev    # Abrir Prisma Studio
./scripts/docker-manager.sh migrate dev   # Executar migrações
./scripts/docker-manager.sh seed dev      # Executar seed

# Produção
./scripts/docker-manager.sh up prod       # Subir containers
./scripts/docker-manager.sh logs prod     # Ver logs
./scripts/docker-manager.sh migrate prod  # Executar migrações

# Utilitários
./scripts/docker-manager.sh status        # Ver status
./scripts/docker-manager.sh clean         # Limpar tudo
```

### Comandos Docker Diretos

```bash
# Desenvolvimento
docker-compose up -d                    # Subir containers
docker-compose down                     # Parar containers
docker-compose logs -f                  # Ver logs
docker-compose exec app sh              # Acessar shell
docker-compose exec db psql -U postgres -d barbershop_dev

# Produção
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml logs -f
```

## 🏗️ Estrutura dos Arquivos

```
barbershop-next/
├── Dockerfile.dev              # Imagem para desenvolvimento
├── Dockerfile.prod             # Imagem para produção (multi-stage)
├── docker-compose.yml          # Desenvolvimento
├── docker-compose.prod.yml     # Produção
├── .dockerignore               # Arquivos ignorados no build
├── nginx/
│   └── nginx.conf             # Configuração NGINX (prod)
└── scripts/
    ├── docker-manager.sh      # Script de gerenciamento
    └── init-db.sql           # Script de inicialização do DB
```

## 🔧 Configurações por Ambiente

### Desenvolvimento

- **Hot reload** ativado
- **Prisma Studio** disponível na porta 5555
- **PostgreSQL** exposto na porta 5432
- **Volumes** montados para desenvolvimento local
- **Container root** para compatibilidade com volumes
- **⚠️ Configuração simplificada** - NÃO usar em produção

### Produção

- **Build otimizado** com multi-stage
- **Imagem mínima** (~200MB)
- **Security hardening** aplicado
- **Health checks** configurados
- **NGINX proxy** opcional
- **Resource limits** aplicados
- **Usuário não-root** obrigatório

## 📊 Serviços Disponíveis

### Desenvolvimento

| Serviço | URL/Porta | Descrição |
|---------|-----------|-----------|
| Next.js | http://localhost:3000 | Aplicação principal |
| Prisma Studio | http://localhost:5555 | Interface do banco |
| PostgreSQL | localhost:5432 | Banco de dados |

### Produção

| Serviço | URL/Porta | Descrição |
|---------|-----------|-----------|
| Next.js | http://localhost:3000 | Aplicação principal |
| NGINX | http://localhost:80 | Proxy reverso (opcional) |
| PostgreSQL | Interno | Banco de dados |

## 🗄️ Banco de Dados

### Migrações

```bash
# Desenvolvimento
./scripts/docker-manager.sh migrate dev

# Produção
./scripts/docker-manager.sh migrate prod
```

### Seed

```bash
# Desenvolvimento
./scripts/docker-manager.sh seed dev

# Produção (cuidado!)
./scripts/docker-manager.sh seed prod
```

### Backup e Restore

```bash
# Backup
docker-compose exec db pg_dump -U postgres barbershop_dev > backup.sql

# Restore
docker-compose exec -T db psql -U postgres -d barbershop_dev < backup.sql
```

## 🚨 Solução de Problemas

### Container não inicia

```bash
# Ver logs detalhados
./scripts/docker-manager.sh logs dev

# Rebuild sem cache
./scripts/docker-manager.sh rebuild dev
```

### Problemas de rede

```bash
# Recriar rede
docker network rm barbershop-next_barbershop-network
docker-compose up -d
```

### Limpeza completa

```bash
# Remove tudo (cuidado!)
./scripts/docker-manager.sh clean
```

### Prisma não encontra banco

```bash
# Aguardar banco subir completamente
sleep 10

# Executar migrações novamente
./scripts/docker-manager.sh migrate dev
```

## 🔒 Segurança

### Desenvolvimento

- **Isolamento**: Containers isolados da rede host
- **Volumes limitados**: Apenas código do projeto montado
- **Rede interna**: Comunicação entre containers via rede Docker
- **⚠️ Root user**: Container roda como root para compatibilidade de volumes
- **🚨 IMPORTANTE**: Esta configuração é APENAS para desenvolvimento local

### Produção

- **Multi-stage build**: Reduz superfície de ataque
- **Imagem mínima**: Alpine Linux como base
- **Usuário não-root**: Containers rodando como usuário restrito
- **NGINX com rate limiting**: Proteção contra ataques
- **Headers de segurança**: Configurados automaticamente
- **Health checks ativos**: Monitoramento de saúde dos serviços
- **Resource limits**: Prevenção de DoS por consumo de recursos

## 📈 Performance

### Otimizações Aplicadas

- **Layer caching** eficiente
- **Multi-stage build** para produção
- **NGINX gzip** compression
- **Keep-alive** connections
- **Static files** caching

### Monitoramento

```bash
# Ver uso de recursos
docker stats

# Ver logs de performance
docker-compose logs nginx
```

## 🌐 Deploy

### Preparação

1. Configure `.env.production` com valores reais
2. Ajuste configurações do NGINX se necessário
3. Configure SSL se usando HTTPS

### Deploy Simples

```bash
# Build e deploy
./scripts/docker-manager.sh build prod
./scripts/docker-manager.sh up prod
```

### Deploy com CI/CD

Ver arquivo `.github/workflows/` para exemplos de automação.

## 📚 Referências

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)