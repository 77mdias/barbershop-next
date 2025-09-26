# 🛠️ Exemplos Práticos - Desenvolvimento de Banco de Dados

Este documento complementa o [Guia de Desenvolvimento](./GUIA-DESENVOLVIMENTO.md) com exemplos práticos e cenários reais que você encontrará no desenvolvimento do projeto.

## 📋 Índice

1. [Cenários de Desenvolvimento](#cenários-de-desenvolvimento)
2. [Exemplos de Migrações](#exemplos-de-migrações)
3. [Casos de Uso Reais](#casos-de-uso-reais)
4. [Resolução de Problemas](#resolução-de-problemas)
5. [Scripts de Automação](#scripts-de-automação)

---

## 🎯 Cenários de Desenvolvimento

### Cenário 1: Novo Desenvolvedor na Equipe

**Situação**: João acabou de entrar na equipe e precisa configurar o ambiente local.

```bash
# 1. Clonar repositório
git clone https://github.com/empresa/barbershop-next.git
cd barbershop-next

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com configurações locais

# 4. Subir banco local (Docker)
docker-compose up -d db

# 5. Aplicar todas as migrações
npm run db:migrate

# 6. Popular com dados de teste
npm run db:seed

# 7. Verificar se está funcionando
npm run db:studio
npm run dev
```

### Cenário 2: Desenvolvendo Nova Feature

**Situação**: Maria precisa adicionar um sistema de avaliações para os serviços.

```bash
# 1. Criar branch para a feature
git checkout -b feature/avaliacoes

# 2. Verificar estado atual do banco
npm run db:studio

# 3. Modificar schema (prisma/schema.prisma)
```

```prisma
// Adicionar ao schema.prisma
model Avaliacao {
  id          Int      @id @default(autoincrement())
  nota        Int      @db.SmallInt // 1-5
  comentario  String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  agendamento   Agendamento @relation(fields: [agendamentoId], references: [id], onDelete: Cascade)
  agendamentoId Int         @unique
  
  @@map("avaliacoes")
}

// Atualizar model existente
model Agendamento {
  id        Int      @id @default(autoincrement())
  // ... campos existentes
  avaliacao Avaliacao?
  
  @@map("agendamentos")
}
```

```bash
# 4. Criar migração
npm run db:migrate
# Nome sugerido: "add_avaliacoes_system"

# 5. Verificar migração gerada
cat prisma/migrations/*/migration.sql

# 6. Testar no Prisma Studio
npm run db:studio

# 7. Desenvolver a feature
# 8. Testar localmente
npm run dev

# 9. Commit e push
git add .
git commit -m "feat: adicionar sistema de avaliações"
git push origin feature/avaliacoes
```

### Cenário 3: Hotfix em Produção

**Situação**: Bug crítico em produção - campo obrigatório está causando erros.

```bash
# 1. Criar branch de hotfix
git checkout main
git checkout -b hotfix/campo-opcional

# 2. Fazer backup de produção PRIMEIRO
pg_dump $DATABASE_URL_PROD > backup_hotfix_$(date +%Y%m%d_%H%M%S).sql

# 3. Corrigir schema
```

```prisma
// Tornar campo opcional temporariamente
model Usuario {
  id       Int     @id @default(autoincrement())
  nome     String
  telefone String? // Era obrigatório, agora opcional
}
```

```bash
# 4. Criar migração
npm run db:migrate
# Nome: "make_telefone_optional_hotfix"

# 5. Testar localmente
npm run db:reset
npm run db:migrate
npm run db:seed

# 6. Deploy rápido
git add .
git commit -m "hotfix: tornar telefone opcional"
git push origin hotfix/campo-opcional

# 7. Aplicar em produção
npm run db:migrate:prod

# 8. Verificar se resolveu
# Monitorar logs da aplicação

# 9. Merge para main
git checkout main
git merge hotfix/campo-opcional
git push origin main
```

---

## 🔄 Exemplos de Migrações

### Migração 1: Adicionando Nova Tabela

```prisma
// schema.prisma - Antes
model Usuario {
  id   Int    @id @default(autoincrement())
  nome String
}

// schema.prisma - Depois
model Usuario {
  id   Int    @id @default(autoincrement())
  nome String
  
  enderecos Endereco[]
}

model Endereco {
  id        Int    @id @default(autoincrement())
  rua       String
  numero    String
  bairro    String
  cidade    String
  cep       String
  
  usuario   Usuario @relation(fields: [usuarioId], references: [id])
  usuarioId Int
  
  @@map("enderecos")
}
```

```sql
-- Migração gerada automaticamente
CREATE TABLE "enderecos" (
    "id" SERIAL NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_usuarioId_fkey" 
FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Migração 2: Modificando Coluna Existente

```prisma
// Antes: preço como Float
model Servico {
  id    Int   @id @default(autoincrement())
  nome  String
  preco Float
}

// Depois: preço como Decimal para precisão monetária
model Servico {
  id    Int     @id @default(autoincrement())
  nome  String
  preco Decimal @db.Decimal(10,2)
}
```

```sql
-- Migração gerada
ALTER TABLE "servicos" ALTER COLUMN "preco" SET DATA TYPE DECIMAL(10,2);
```

### Migração 3: Adicionando Índices para Performance

```prisma
model Agendamento {
  id        Int      @id @default(autoincrement())
  data      DateTime
  status    String
  usuarioId Int
  
  @@index([data])
  @@index([status])
  @@index([usuarioId, data])
  @@map("agendamentos")
}
```

```sql
-- Migração gerada
CREATE INDEX "agendamentos_data_idx" ON "agendamentos"("data");
CREATE INDEX "agendamentos_status_idx" ON "agendamentos"("status");
CREATE INDEX "agendamentos_usuarioId_data_idx" ON "agendamentos"("usuarioId", "data");
```

### Migração 4: Renomeando Coluna (Estratégia Segura)

```bash
# Etapa 1: Adicionar nova coluna
```

```prisma
model Usuario {
  id           Int     @id @default(autoincrement())
  nome         String  // Coluna antiga
  nomeCompleto String? // Nova coluna
}
```

```sql
-- Migração 1
ALTER TABLE "usuarios" ADD COLUMN "nomeCompleto" TEXT;
```

```bash
# Etapa 2: Migrar dados (script customizado)
```

```sql
-- Script de migração de dados
UPDATE usuarios SET "nomeCompleto" = nome WHERE "nomeCompleto" IS NULL;
```

```bash
# Etapa 3: Tornar obrigatória
```

```prisma
model Usuario {
  id           Int    @id @default(autoincrement())
  nome         String // Ainda mantém temporariamente
  nomeCompleto String // Agora obrigatória
}
```

```sql
-- Migração 2
ALTER TABLE "usuarios" ALTER COLUMN "nomeCompleto" SET NOT NULL;
```

```bash
# Etapa 4: Atualizar aplicação para usar nova coluna
# Etapa 5: Remover coluna antiga
```

```prisma
model Usuario {
  id           Int    @id @default(autoincrement())
  nomeCompleto String
}
```

```sql
-- Migração 3
ALTER TABLE "usuarios" DROP COLUMN "nome";
```

---

## 🎪 Casos de Uso Reais

### Caso 1: Sistema de Agendamento

**Requisito**: Implementar sistema completo de agendamento para barbearia.

```prisma
// Schema completo
model Usuario {
  id          Int      @id @default(autoincrement())
  nome        String
  email       String   @unique
  telefone    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  agendamentos Agendamento[]
  
  @@map("usuarios")
}

model Barbeiro {
  id          Int      @id @default(autoincrement())
  nome        String
  email       String   @unique
  especialidades String[]
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  agendamentos Agendamento[]
  horarios     HorarioTrabalho[]
  
  @@map("barbeiros")
}

model Servico {
  id          Int     @id @default(autoincrement())
  nome        String
  descricao   String?
  preco       Decimal @db.Decimal(10,2)
  duracao     Int     // em minutos
  ativo       Boolean @default(true)
  
  agendamentos AgendamentoServico[]
  
  @@map("servicos")
}

model Agendamento {
  id        Int      @id @default(autoincrement())
  data      DateTime
  status    StatusAgendamento @default(AGENDADO)
  observacoes String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  usuario   Usuario @relation(fields: [usuarioId], references: [id])
  usuarioId Int
  
  barbeiro   Barbeiro @relation(fields: [barbeiroId], references: [id])
  barbeiroId Int
  
  servicos  AgendamentoServico[]
  avaliacao Avaliacao?
  
  @@map("agendamentos")
}

model AgendamentoServico {
  agendamento   Agendamento @relation(fields: [agendamentoId], references: [id])
  agendamentoId Int
  
  servico   Servico @relation(fields: [servicoId], references: [id])
  servicoId Int
  
  @@id([agendamentoId, servicoId])
  @@map("agendamento_servicos")
}

model HorarioTrabalho {
  id          Int @id @default(autoincrement())
  diaSemana   Int // 0-6 (domingo-sábado)
  horaInicio  String // "09:00"
  horaFim     String // "18:00"
  
  barbeiro   Barbeiro @relation(fields: [barbeiroId], references: [id])
  barbeiroId Int
  
  @@unique([barbeiroId, diaSemana])
  @@map("horarios_trabalho")
}

model Avaliacao {
  id          Int      @id @default(autoincrement())
  nota        Int      @db.SmallInt
  comentario  String?
  createdAt   DateTime @default(now())
  
  agendamento   Agendamento @relation(fields: [agendamentoId], references: [id])
  agendamentoId Int         @unique
  
  @@map("avaliacoes")
}

enum StatusAgendamento {
  AGENDADO
  CONFIRMADO
  EM_ANDAMENTO
  CONCLUIDO
  CANCELADO
  NAO_COMPARECEU
}
```

### Caso 2: Sistema de Relatórios

**Requisito**: Queries para relatórios gerenciais.

```typescript
// services/relatorios.ts
import { prisma } from '@/lib/db'

export class RelatorioService {
  // Agendamentos por período
  async agendamentosPorPeriodo(inicio: Date, fim: Date) {
    return await prisma.agendamento.findMany({
      where: {
        data: {
          gte: inicio,
          lte: fim
        }
      },
      include: {
        usuario: true,
        barbeiro: true,
        servicos: {
          include: {
            servico: true
          }
        }
      },
      orderBy: {
        data: 'asc'
      }
    })
  }

  // Receita por barbeiro
  async receitaPorBarbeiro(mes: number, ano: number) {
    return await prisma.$queryRaw`
      SELECT 
        b.nome as barbeiro,
        COUNT(a.id) as total_agendamentos,
        SUM(s.preco) as receita_total
      FROM barbeiros b
      LEFT JOIN agendamentos a ON b.id = a."barbeiroId"
      LEFT JOIN agendamento_servicos ags ON a.id = ags."agendamentoId"
      LEFT JOIN servicos s ON ags."servicoId" = s.id
      WHERE 
        EXTRACT(MONTH FROM a.data) = ${mes}
        AND EXTRACT(YEAR FROM a.data) = ${ano}
        AND a.status = 'CONCLUIDO'
      GROUP BY b.id, b.nome
      ORDER BY receita_total DESC
    `
  }

  // Serviços mais populares
  async servicosMaisPopulares(limite: number = 10) {
    return await prisma.servico.findMany({
      include: {
        agendamentos: {
          include: {
            agendamento: {
              where: {
                status: 'CONCLUIDO'
              }
            }
          }
        },
        _count: {
          select: {
            agendamentos: {
              where: {
                agendamento: {
                  status: 'CONCLUIDO'
                }
              }
            }
          }
        }
      },
      orderBy: {
        agendamentos: {
          _count: 'desc'
        }
      },
      take: limite
    })
  }
}
```

---

## 🔧 Resolução de Problemas

### Problema 1: Migração Falhou em Produção

**Erro**: `relation "nova_tabela" already exists`

```bash
# 1. Verificar estado atual
npm run db:pull:prod

# 2. Verificar histórico de migrações
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;

# 3. Marcar migração como aplicada (se tabela já existe)
INSERT INTO "_prisma_migrations" (
  id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count
) VALUES (
  'migration-id', 'checksum', NOW(), 'migration_name', NULL, NULL, NOW(), 1
);

# 4. Verificar se resolveu
npm run db:migrate:prod
```

### Problema 2: Dados Inconsistentes

**Situação**: Agendamentos sem barbeiro válido após migração.

```sql
-- 1. Identificar problema
SELECT a.id, a."barbeiroId", b.id as barbeiro_existe
FROM agendamentos a
LEFT JOIN barbeiros b ON a."barbeiroId" = b.id
WHERE b.id IS NULL;

-- 2. Corrigir dados órfãos
-- Opção A: Atribuir a um barbeiro padrão
UPDATE agendamentos 
SET "barbeiroId" = (SELECT id FROM barbeiros WHERE ativo = true LIMIT 1)
WHERE "barbeiroId" NOT IN (SELECT id FROM barbeiros);

-- Opção B: Cancelar agendamentos órfãos
UPDATE agendamentos 
SET status = 'CANCELADO'
WHERE "barbeiroId" NOT IN (SELECT id FROM barbeiros);
```

### Problema 3: Performance Degradada

**Situação**: Queries lentas após crescimento da base de dados.

```sql
-- 1. Identificar queries lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE mean_time > 1000 -- queries > 1 segundo
ORDER BY mean_time DESC;

-- 2. Analisar plano de execução
EXPLAIN ANALYZE 
SELECT a.*, u.nome, b.nome as barbeiro
FROM agendamentos a
JOIN usuarios u ON a."usuarioId" = u.id
JOIN barbeiros b ON a."barbeiroId" = b.id
WHERE a.data >= '2024-01-01';

-- 3. Adicionar índices necessários
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_usuario_data ON agendamentos("usuarioId", data);
```

---

## 🤖 Scripts de Automação

### Script 1: Backup Automático

```bash
#!/bin/bash
# scripts/backup-db.sh

set -e

# Configurações
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Fazer backup
echo "Iniciando backup do banco de dados..."
pg_dump $DATABASE_URL_PROD > $BACKUP_DIR/backup_$DATE.sql

# Comprimir backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remover backups antigos
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup concluído: backup_$DATE.sql.gz"
```

### Script 2: Verificação de Integridade

```bash
#!/bin/bash
# scripts/check-integrity.sh

set -e

echo "Verificando integridade do banco de dados..."

# Verificar dados órfãos
echo "1. Verificando agendamentos órfãos..."
psql $DATABASE_URL_PROD -c "
SELECT COUNT(*) as agendamentos_orfaos
FROM agendamentos a
LEFT JOIN usuarios u ON a.\"usuarioId\" = u.id
LEFT JOIN barbeiros b ON a.\"barbeiroId\" = b.id
WHERE u.id IS NULL OR b.id IS NULL;
"

# Verificar constraints
echo "2. Verificando violações de constraints..."
psql $DATABASE_URL_PROD -c "
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE NOT convalidated;
"

# Verificar índices corrompidos
echo "3. Verificando índices..."
psql $DATABASE_URL_PROD -c "
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';
"

echo "Verificação concluída!"
```

### Script 3: Deploy Automatizado

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Iniciando deploy..."

# 1. Backup
echo "📦 Fazendo backup..."
./scripts/backup-db.sh

# 2. Testes
echo "🧪 Executando testes..."
npm test

# 3. Build
echo "🔨 Fazendo build..."
npm run build

# 4. Migrações
echo "🗄️ Aplicando migrações..."
npm run db:migrate:prod

# 5. Deploy da aplicação
echo "🌐 Fazendo deploy da aplicação..."
vercel --prod

# 6. Verificação
echo "✅ Verificando deploy..."
curl -f https://barbershop.com/api/health || exit 1

# 7. Verificação de integridade
echo "🔍 Verificando integridade..."
./scripts/check-integrity.sh

echo "🎉 Deploy concluído com sucesso!"
```

---

## 📊 Monitoramento Contínuo

### Métricas para Acompanhar

```sql
-- 1. Crescimento da base de dados
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. Queries mais executadas
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements 
ORDER BY calls DESC 
LIMIT 10;

-- 3. Conexões ativas
SELECT 
  state,
  COUNT(*) as connections
FROM pg_stat_activity 
GROUP BY state;
```

### Alertas Recomendados

```bash
# Configurar alertas para:
# - Uso de disco > 85%
# - Conexões > 80% do limite
# - Queries > 5 segundos
# - Falhas de migração
# - Backup falhou
# - Dados órfãos detectados
```

---

## 🎯 Conclusão

Estes exemplos práticos mostram situações reais que você encontrará no desenvolvimento. Lembre-se:

1. **Sempre teste localmente primeiro**
2. **Faça backup antes de mudanças importantes**
3. **Monitore a aplicação após deploys**
4. **Documente problemas e soluções**
5. **Automatize processos repetitivos**

Para dúvidas específicas, consulte o [Guia de Desenvolvimento](./GUIA-DESENVOLVIMENTO.md) ou a documentação dos [Scripts](./SCRIPTS.md).

---

*Última atualização: $(date +%Y-%m-%d)*