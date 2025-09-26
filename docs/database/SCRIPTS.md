# Scripts de Banco de Dados - Múltiplos Ambientes

Este documento explica como usar os scripts npm para gerenciar o banco de dados em diferentes ambientes (desenvolvimento e produção).

## Configuração de Variáveis de Ambiente

O projeto está configurado para usar diferentes bancos de dados:

- **Desenvolvimento**: `DATABASE_URL` e `DIRECT_URL`
- **Produção**: `DATABASE_URL_PROD` e `DIRECT_URL_PROD`

Todas as variáveis estão definidas no arquivo `.env`.

## Scripts Disponíveis

### Desenvolvimento (padrão)

```bash
# Aplicar migrações em desenvolvimento
npm run db:migrate

# Fazer push do schema (sem criar migração)
npm run db:push

# Abrir Prisma Studio
npm run db:studio

# Executar seed (popular banco com dados de teste)
npm run db:seed

# Resetar banco (apagar tudo e reaplicar migrações)
npm run db:reset

# Gerar cliente Prisma
npm run db:generate

# Fazer pull do schema do banco
npm run db:pull
```

### Produção

```bash
# Aplicar migrações em produção
npm run db:migrate:prod

# Fazer push do schema em produção
npm run db:push:prod

# Abrir Prisma Studio para produção
npm run db:studio:prod

# Executar seed em produção
npm run db:seed:prod

# Resetar banco de produção (CUIDADO!)
npm run db:reset:prod

# Fazer pull do schema do banco de produção
npm run db:pull:prod
```

## Fluxo Recomendado

### Para Desenvolvimento

1. **Primeira configuração**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

2. **Alterações no schema**:
   ```bash
   npm run db:migrate
   ```

3. **Visualizar dados**:
   ```bash
   npm run db:studio
   ```

### Para Produção

1. **Deploy inicial**:
   ```bash
   npm run db:migrate:prod
   ```

2. **Atualizações**:
   ```bash
   npm run db:migrate:prod
   ```

3. **Monitoramento** (se necessário):
   ```bash
   npm run db:studio:prod
   ```

## Script Shell (Alternativa)

Você também pode usar o script shell diretamente:

```bash
# Usar o script diretamente
./scripts/db-prod.sh migrate
./scripts/db-prod.sh pull
./scripts/db-prod.sh studio

# Ver todas as opções
./scripts/db-prod.sh
```

## Comandos Manuais (Alternativa)

Se preferir usar comandos diretos:

```bash
# Desenvolvimento
DATABASE_URL=$DATABASE_URL prisma migrate dev

# Produção (carregando variáveis do .env)
source .env
DATABASE_URL=$DATABASE_URL_PROD prisma migrate deploy
```

## Segurança

⚠️ **IMPORTANTE**: 
- Nunca execute `npm run db:reset:prod` em produção sem backup
- Use `migrate deploy` em produção (não `migrate dev`)
- Sempre teste migrações em desenvolvimento primeiro

## Troubleshooting

### Erro de conexão
Verifique se as variáveis de ambiente estão corretas no arquivo `.env`.

### Migração não aplicada
```bash
# Verificar status
npm run db:pull:prod

# Forçar aplicação
npm run db:migrate:prod
```

### Schema desatualizado
```bash
# Regenerar cliente
npm run db:generate
```