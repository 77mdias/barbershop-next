# 📚 Guia Completo de Desenvolvimento de Banco de Dados

Este documento estabelece as melhores práticas para desenvolvimento, migração e deploy de banco de dados em projetos fullstack, seguindo metodologias profissionais e padrões da indústria.

## 📋 Índice

1. [Conceitos Fundamentais](#conceitos-fundamentais)
2. [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
3. [Ambientes e Configuração](#ambientes-e-configuração)
4. [Criação e Modificação de Schema](#criação-e-modificação-de-schema)
5. [Processo de Deploy](#processo-de-deploy)
6. [Backup e Recuperação](#backup-e-recuperação)
7. [Monitoramento e Manutenção](#monitoramento-e-manutenção)
8. [Troubleshooting](#troubleshooting)
9. [Checklist de Boas Práticas](#checklist-de-boas-práticas)

---

## 🎯 Conceitos Fundamentais

### O que são Migrações?

Migrações são scripts versionados que descrevem mudanças incrementais no schema do banco de dados. Elas garantem que:

- **Versionamento**: Cada mudança é rastreada e versionada
- **Reprodutibilidade**: O mesmo schema pode ser recriado em qualquer ambiente
- **Colaboração**: Múltiplos desenvolvedores podem trabalhar no mesmo projeto
- **Rollback**: Possibilidade de reverter mudanças quando necessário

### Princípios Fundamentais

1. **Nunca edite migrações já aplicadas**: Uma vez que uma migração foi aplicada em produção, ela é imutável
2. **Sempre teste em desenvolvimento primeiro**: Toda mudança deve ser testada localmente
3. **Migrações devem ser atômicas**: Uma migração = uma mudança lógica
4. **Backup antes de deploy**: Sempre faça backup antes de aplicar mudanças em produção

---

## 🔄 Fluxo de Desenvolvimento

### 1. Configuração Inicial do Projeto

```bash
# 1. Clonar o repositório
git clone <repository-url>
cd barbershop-next

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Aplicar migrações existentes
npm run db:migrate

# 5. Popular banco com dados de teste
npm run db:seed

# 6. Verificar se tudo está funcionando
npm run db:studio
```

### 2. Desenvolvimento de Nova Feature

#### Passo 1: Análise e Planejamento
```bash
# Antes de começar, sempre verifique o estado atual
npm run db:pull
npm run db:studio
```

#### Passo 2: Modificação do Schema
```bash
# 1. Editar o arquivo prisma/schema.prisma
# 2. Criar a migração
npm run db:migrate

# 3. Verificar a migração gerada
ls prisma/migrations/
cat prisma/migrations/[timestamp]_[nome]/migration.sql

# 4. Testar a migração
npm run db:studio
```

#### Passo 3: Desenvolvimento da Feature
```bash
# 1. Gerar cliente Prisma atualizado
npm run db:generate

# 2. Desenvolver a feature
# 3. Testar localmente
npm run dev
```

#### Passo 4: Testes e Validação
```bash
# 1. Executar testes
npm test

# 2. Verificar integridade dos dados
npm run db:studio

# 3. Testar rollback (se necessário)
npm run db:reset
npm run db:migrate
```

### 3. Preparação para Deploy

#### Passo 1: Revisão de Código
- [ ] Revisar todas as migrações criadas
- [ ] Verificar se não há conflitos com outras branches
- [ ] Confirmar que os testes passam
- [ ] Validar performance das queries

#### Passo 2: Merge e Preparação
```bash
# 1. Merge da branch de desenvolvimento
git checkout main
git merge feature/nova-feature

# 2. Verificar se não há conflitos de migração
npm run db:migrate

# 3. Executar testes finais
npm test
```

---

## 🌍 Ambientes e Configuração

### Estrutura de Ambientes

```
┌─────────────────┬──────────────────┬─────────────────┐
│   DESENVOLVIMENTO │     STAGING      │    PRODUÇÃO     │
├─────────────────┼──────────────────┼─────────────────┤
│ Dados de teste  │ Dados similares  │ Dados reais     │
│ Schema flexível │ Schema estável   │ Schema estável  │
│ Reset frequente │ Reset ocasional  │ Nunca resetar   │
│ Experimentos OK │ Testes finais    │ Apenas deploys  │
└─────────────────┴──────────────────┴─────────────────┘
```

### Configuração de Variáveis

```bash
# .env (Desenvolvimento)
DATABASE_URL="postgresql://user:pass@localhost:5432/barbershop_dev"
DATABASE_URL_PROD="postgresql://user:pass@prod-server:5432/barbershop_prod"
```

### Scripts por Ambiente

| Comando | Desenvolvimento | Produção |
|---------|----------------|----------|
| Migrar | `npm run db:migrate` | `npm run db:migrate:prod` |
| Seed | `npm run db:seed` | `npm run db:seed:prod` |
| Studio | `npm run db:studio` | `npm run db:studio:prod` |
| Reset | `npm run db:reset` | ⚠️ **NUNCA** |

---

## 🔧 Criação e Modificação de Schema

### Tipos de Mudanças

#### 1. Mudanças Seguras (Não Destrutivas)
✅ **Podem ser aplicadas diretamente em produção**

```prisma
// ✅ Adicionar nova tabela
model NovaTabela {
  id   Int    @id @default(autoincrement())
  nome String
}

// ✅ Adicionar nova coluna (opcional)
model Usuario {
  id       Int     @id @default(autoincrement())
  nome     String
  telefone String? // Nova coluna opcional
}

// ✅ Adicionar índice
model Produto {
  id   Int    @id @default(autoincrement())
  nome String @db.VarChar(255)
  
  @@index([nome]) // Novo índice
}
```

#### 2. Mudanças Potencialmente Destrutivas
⚠️ **Requerem cuidado especial**

```prisma
// ⚠️ Renomear coluna (pode quebrar aplicação)
model Usuario {
  id        Int    @id @default(autoincrement())
  nomeCompleto String @map("nome") // Renomeando
}

// ⚠️ Alterar tipo de dados
model Produto {
  id    Int     @id @default(autoincrement())
  preco Decimal @db.Decimal(10,2) // Era Float
}

// ⚠️ Tornar coluna obrigatória
model Usuario {
  id    Int    @id @default(autoincrement())
  email String // Era opcional, agora obrigatório
}
```

#### 3. Mudanças Destrutivas
🚨 **Requerem estratégia especial**

```prisma
// 🚨 Remover coluna
// 🚨 Remover tabela
// 🚨 Alterar chave primária
```

### Estratégias para Mudanças Destrutivas

#### Estratégia 1: Migração em Etapas
```bash
# Etapa 1: Adicionar nova coluna
# Etapa 2: Migrar dados
# Etapa 3: Atualizar aplicação
# Etapa 4: Remover coluna antiga
```

#### Estratégia 2: Blue-Green Deployment
```bash
# 1. Criar novo ambiente
# 2. Aplicar mudanças no novo ambiente
# 3. Migrar dados
# 4. Trocar ambientes
```

### Exemplo Prático: Renomeando uma Coluna

```sql
-- ❌ ERRADO: Mudança direta
ALTER TABLE usuarios RENAME COLUMN nome TO nome_completo;

-- ✅ CORRETO: Migração em etapas
-- Migração 1: Adicionar nova coluna
ALTER TABLE usuarios ADD COLUMN nome_completo VARCHAR(255);

-- Migração 2: Copiar dados
UPDATE usuarios SET nome_completo = nome WHERE nome_completo IS NULL;

-- Migração 3: Tornar obrigatória
ALTER TABLE usuarios ALTER COLUMN nome_completo SET NOT NULL;

-- Migração 4: Atualizar aplicação (deploy)

-- Migração 5: Remover coluna antiga
ALTER TABLE usuarios DROP COLUMN nome;
```

---

## 🚀 Processo de Deploy

### Checklist Pré-Deploy

- [ ] **Backup do banco de produção**
- [ ] **Testes passando em desenvolvimento**
- [ ] **Migração testada localmente**
- [ ] **Revisão de código aprovada**
- [ ] **Documentação atualizada**
- [ ] **Plano de rollback definido**

### Deploy Passo a Passo

#### 1. Backup de Segurança
```bash
# Fazer backup do banco de produção
pg_dump $DATABASE_URL_PROD > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. Aplicar Migrações
```bash
# Verificar status atual
npm run db:pull:prod

# Aplicar migrações
npm run db:migrate:prod

# Verificar se foi aplicado corretamente
npm run db:pull:prod
```

#### 3. Deploy da Aplicação
```bash
# Build da aplicação
npm run build

# Deploy (exemplo com Vercel)
vercel --prod

# Ou Docker
docker build -t barbershop .
docker push barbershop:latest
```

#### 4. Verificação Pós-Deploy
```bash
# Verificar logs da aplicação
# Testar endpoints críticos
# Monitorar métricas de performance
# Verificar integridade dos dados
```

### Rollback de Emergência

#### Se a Migração Falhou
```bash
# 1. Restaurar backup
psql $DATABASE_URL_PROD < backup_YYYYMMDD_HHMMSS.sql

# 2. Reverter deploy da aplicação
vercel rollback

# 3. Investigar e corrigir problema
```

#### Se a Aplicação Falhou
```bash
# 1. Reverter deploy (mantém banco)
vercel rollback

# 2. Investigar logs
# 3. Corrigir e redeploy
```

---

## 💾 Backup e Recuperação

### Estratégia de Backup

#### 1. Backups Automáticos
```bash
# Script de backup diário (crontab)
0 2 * * * pg_dump $DATABASE_URL_PROD > /backups/daily_$(date +\%Y\%m\%d).sql

# Backup semanal
0 2 * * 0 pg_dump $DATABASE_URL_PROD > /backups/weekly_$(date +\%Y\%m\%d).sql

# Backup mensal
0 2 1 * * pg_dump $DATABASE_URL_PROD > /backups/monthly_$(date +\%Y\%m\%d).sql
```

#### 2. Backup Antes de Deploy
```bash
# Sempre antes de mudanças importantes
pg_dump $DATABASE_URL_PROD > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql
```

### Recuperação de Dados

#### Recuperação Completa
```bash
# Restaurar backup completo
psql $DATABASE_URL_PROD < backup_YYYYMMDD.sql
```

#### Recuperação Parcial
```sql
-- Restaurar apenas uma tabela
pg_restore -t usuarios backup_YYYYMMDD.sql
```

---

## 📊 Monitoramento e Manutenção

### Métricas Importantes

#### 1. Performance
- Tempo de resposta das queries
- Uso de CPU e memória
- Conexões ativas
- Locks e deadlocks

#### 2. Integridade
- Consistência dos dados
- Violações de constraints
- Dados órfãos
- Índices corrompidos

### Manutenção Preventiva

#### Semanal
```sql
-- Analisar estatísticas
ANALYZE;

-- Verificar índices não utilizados
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public';
```

#### Mensal
```sql
-- Vacuum completo
VACUUM FULL;

-- Reindexar tabelas grandes
REINDEX TABLE usuarios;
```

### Alertas e Monitoramento

```bash
# Configurar alertas para:
# - Uso de disco > 80%
# - Conexões > 80% do limite
# - Queries lentas > 5 segundos
# - Erros de migração
```

---

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Migração Falhou
```bash
# Verificar logs
npm run db:migrate:prod 2>&1 | tee migration.log

# Verificar estado do banco
npm run db:pull:prod

# Possíveis soluções:
# - Corrigir dados manualmente
# - Aplicar migração customizada
# - Restaurar backup
```

#### 2. Schema Inconsistente
```bash
# Comparar schemas
npm run db:pull
npm run db:pull:prod

# Sincronizar (CUIDADO!)
npm run db:push:prod
```

#### 3. Performance Degradada
```sql
-- Identificar queries lentas
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Verificar índices faltando
SELECT schemaname, tablename, attname
FROM pg_stats
WHERE n_distinct > 100 AND correlation < 0.1;
```

#### 4. Dados Corrompidos
```sql
-- Verificar integridade
SELECT * FROM usuarios WHERE id IS NULL;
SELECT * FROM pedidos WHERE usuario_id NOT IN (SELECT id FROM usuarios);

-- Corrigir dados órfãos
DELETE FROM pedidos WHERE usuario_id NOT IN (SELECT id FROM usuarios);
```

---

## ✅ Checklist de Boas Práticas

### Desenvolvimento
- [ ] Sempre trabalhar em branch separada
- [ ] Testar migrações localmente
- [ ] Usar nomes descritivos para migrações
- [ ] Documentar mudanças complexas
- [ ] Revisar SQL gerado pelo Prisma

### Deploy
- [ ] Fazer backup antes do deploy
- [ ] Aplicar migrações em horário de baixo tráfego
- [ ] Monitorar aplicação após deploy
- [ ] Ter plano de rollback pronto
- [ ] Comunicar mudanças para a equipe

### Segurança
- [ ] Nunca commitar credenciais
- [ ] Usar conexões SSL em produção
- [ ] Limitar permissões de usuários
- [ ] Auditar acessos ao banco
- [ ] Criptografar dados sensíveis

### Performance
- [ ] Criar índices para queries frequentes
- [ ] Evitar N+1 queries
- [ ] Usar paginação em listas grandes
- [ ] Monitorar uso de recursos
- [ ] Otimizar queries lentas

---

## 📚 Recursos Adicionais

### Documentação
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-best-practices.html)

### Ferramentas
- **Prisma Studio**: Interface visual para o banco
- **pgAdmin**: Administração PostgreSQL
- **DataGrip**: IDE para bancos de dados
- **Grafana**: Monitoramento e alertas

### Scripts Úteis
```bash
# Ver todos os scripts disponíveis
npm run

# Documentação dos scripts
cat docs/database/SCRIPTS.md

# Logs detalhados
npm run db:migrate:prod --verbose
```

---

## 🎯 Conclusão

Este guia estabelece as bases para um desenvolvimento de banco de dados profissional e seguro. Seguindo essas práticas, você garante:

- **Confiabilidade**: Mudanças controladas e versionadas
- **Segurança**: Backups e procedimentos de recuperação
- **Performance**: Monitoramento e otimização contínua
- **Colaboração**: Processos claros para toda a equipe

Lembre-se: **a consistência na aplicação dessas práticas é mais importante que a perfeição individual de cada deploy**.

---

*Última atualização: $(date +%Y-%m-%d)*
*Versão: 1.0*