# Runbook Operacional

## 1. Modo oficial por ambiente

- **Dev local**: Docker (`make dev-up`)
- **Produção oficial**: Vercel
- **Self-hosted Docker**: opcional (`./scripts/deploy-pro.sh`)

## 2. Desenvolvimento local

### Inicialização

```bash
make dev-up
```

### Operação diária

```bash
make dev-logs
make dev-shell
make quality-check
make test
make dev-down
```

### Banco de dados (dev)

```bash
make db-migrate
make db-seed
make db-studio
```

## 3. Produção oficial (Vercel)

### Build

```bash
npm run build:vercel
```

### Migrações

```bash
make prod-migrate-vercel
```

### Deploy

- Push para branch ligada ao Vercel
- Verificar variáveis de ambiente no dashboard

## 4. Simulação local de produção

```bash
make prod-local
```

## 5. Produção Docker self-hosted (opcional)

```bash
./scripts/deploy-pro.sh deploy
./scripts/deploy-pro.sh migrate
./scripts/deploy-pro.sh app-only
./scripts/deploy-pro.sh logs
./scripts/deploy-pro.sh status
```

## 6. Convenção dos arquivos Docker de produção

- `docker-compose.pro.yml`: **ativo** para self-hosted profissional (migrator + app)
- `docker-compose.prod.yml`: **legado** (manter apenas por compatibilidade)

## 7. Troubleshooting rápido

### Ambiente não sobe

```bash
make dev-down
./scripts/docker-manager.sh rebuild dev
make dev-up
```

### Migração falhou

```bash
make db-status
make db-migrate
```

### Erros de qualidade

```bash
make quality-check
make test
```

