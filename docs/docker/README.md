# 🐳 Docker e Ambiente de Desenvolvimento

Este documento explica como configurar e utilizar o ambiente Docker para o projeto Barbershop Next.js.

> **🔧 Atualização (Out/2025)**: Configuração simplificada após correção do script docker-manager.sh. O Prisma Studio agora usa o container `app` existente.

## Estrutura de Containers

O projeto utiliza uma arquitetura simplificada com dois containers principais:

```
┌─────────────────┐    ┌─────────────────┐
│   Container     │    │   Container     │
│   app           │    │   db            │
│                 │    │                 │
│ - Next.js :3000 │◄───┤ - PostgreSQL    │
│ - Prisma Studio │    │   :5432         │
│   :5555         │    │                 │
└─────────────────┘    └─────────────────┘
```

## Serviços Ativos

### Desenvolvimento (docker-compose.yml)
- **app**: Container principal com Next.js e Prisma Studio
- **db**: PostgreSQL 15 com dados persistentes

### Produção (docker-compose.prod.yml)  
- **app**: Container otimizado para produção
- **db**: PostgreSQL com configurações de produção
- **nginx**: Proxy reverso (opcional)

## Portas e Acesso

| Serviço | Porta | URL | Ambiente |
|---------|-------|-----|----------|
| Next.js | 3000 | http://localhost:3000 | dev/prod |
| Prisma Studio | 5555 | http://localhost:5555 | dev only |
| PostgreSQL | 5432 | localhost:5432 | dev only |

## Comandos Principais

### Usar Script Manager (Recomendado)
```bash
# Subir ambiente completo
./scripts/docker-manager.sh up dev

# Abrir Prisma Studio
./scripts/docker-manager.sh studio dev

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