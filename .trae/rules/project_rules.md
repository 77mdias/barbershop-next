# 🚀 Regras e Boas Práticas para Projetos Fullstack Web

Este documento define diretrizes para o desenvolvimento de projetos **Fullstack Web** usando a stack padrão:

- **Backend**: Node.js, Next.js (App Router), TypeScript  
- **ORM & Banco**: Prisma ORM + PostgreSQL (Neon, Supabase, etc)  
- **API**: Rotas handlers internas + Server Actions  
- **Autenticação**: NextAuth + Zod + bcryptjs + múltiplos providers (Google, GitHub, etc)  
- **Validação & Segurança**: RBAC, validação de email (nodemailer), redefinição de senha  
- **Infraestrutura**: Docker & Docker Compose (**OBRIGATÓRIO** para projetos maiores)  
- **Frontend**: Next.js + Tailwind CSS, Radix UI/Shadcn, SCSS modules  

## 🐳 Estratégia de Desenvolvimento com Docker

### Princípio Fundamental
**Em projetos maiores (multi-ambiente, produção), TODO o desenvolvimento ocorre dentro de containers Docker**. Dependências NÃO são instaladas localmente - apenas Docker e Docker Compose são necessários na máquina do desenvolvedor.

### Critérios para Uso de Docker
- ✅ **OBRIGATÓRIO**: Projetos com mais de um ambiente (dev, staging, prod)
- ✅ **OBRIGATÓRIO**: Projetos com banco de dados
- ✅ **OBRIGATÓRIO**: Projetos em equipe (+ de 1 desenvolvedor)
- ⚠️ **OPCIONAL**: Projetos pequenos/protótipos individuais

---

## 📂 1. Estrutura de Projeto Recomendada

Organização base para projetos escaláveis:

```
project-root/
│── src/
│   ├── app/                 # Rotas, páginas e Server Actions
│   │   ├── api/             # Rotas de API internas (handlers)
│   │   └── (auth)/          # Fluxos de autenticação (login, cadastro, reset)
│   ├── components/          # Componentes reutilizáveis (UI + lógica compartilhada)
│   ├── modules/             # Features independentes (ex: users, posts, billing)
│   │   └── user/
│   │       ├── services/    # Regras de negócio
│   │       ├── models/      # Definições de Prisma e DTOs
│   │       └── utils/       # Funções auxiliares
│   ├── styles/              # Tailwind configs, SCSS modules
│   ├── lib/                 # Configurações globais (db.ts, auth.ts, utils.ts)
│   └── middleware.ts        # Middlewares globais (RBAC, logs, headers)
│── prisma/
│   └── schema.prisma        # Definição do banco
│── tests/                   # Unitários e integrados
│── docker-compose.yml       # OBRIGATÓRIO - Configuração de desenvolvimento
│── docker-compose.prod.yml  # OBRIGATÓRIO - Configuração de produção  
│── Dockerfile               # OBRIGATÓRIO - Build da aplicação
│── .env.example             # Template de variáveis de ambiente
│── README.md
│── docs/                    # Documentação (API, RBAC, fluxos, containers)
│   └── docker/              # Documentação específica do Docker
```

### 🔧 Comandos Docker vs Comandos Locais

**⚠️ IMPORTANTE**: Em projetos Docker, NUNCA use comandos npm/npx/node diretamente. Use sempre através dos containers:

| ❌ Comando Local | ✅ Comando Docker | Descrição |
|-----------------|------------------|-----------|
| `npm install` | `docker compose build` | Instalar dependências |
| `npm run dev` | `docker compose up app` | Iniciar desenvolvimento |
| `npx prisma migrate dev` | `docker compose exec app npx prisma migrate dev` | Migrations do Prisma |
| `npx prisma studio` | `docker compose exec app npx prisma studio` | Prisma Studio |
| `npm run build` | `docker compose exec app npm run build` | Build da aplicação |
| `npm test` | `docker compose exec app npm test` | Executar testes |
| `npx eslint .` | `docker compose exec app npx eslint .` | Linting |

---

## 🔐 2. RBAC, Segurança e Variáveis de Ambiente

- **RBAC (Role-Based Access Control):**
  - Definir roles no banco (`User`, `Admin`, `SuperAdmin`, etc).
  - Middleware para verificar permissões em cada rota.
  - Sempre aplicar checagem de roles antes de retornar dados.

- **Segurança:**
  - Nunca expor credenciais diretamente no código.
  - Proteger endpoints internos com autenticação obrigatória.
  - Usar headers de segurança (`helmet`, `next-safe-middleware`).

- **Variáveis de Ambiente:**
  - Declarar todas no arquivo `.env.example`.
  - Carregar com `process.env` apenas em **server-side**.
  - Nunca versionar `.env`.

**Exemplo de checagem RBAC:**
```ts
// middleware/rbac.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function requireRole(role: string, req: Request) {
  const session = await getServerSession();
  if (!session || session.user.role !== role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
```

---

## 🔑 3. Fluxos de Autenticação e Validação

- **NextAuth:**
  - Usar providers OAuth (Google, GitHub, etc).
  - Session com JWT + refresh tokens.
  - Integração com Prisma para persistir usuários.

- **Zod para validação:**
```ts
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});
```

- **bcryptjs para senhas:**
```ts
import bcrypt from "bcryptjs";

const hashed = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, user.password);
```

- **Validação de email (nodemailer):**
```ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: "noreply@project.com",
  to: email,
  subject: "Verifique seu email",
  text: "Clique no link para confirmar sua conta."
});
```

- **Redefinição de senha:**
  - Gerar token temporário no banco (com expiração).
  - Enviar link via email.
  - Validar e atualizar senha com bcrypt.

---

## 🎨 4. Boas Práticas para o Frontend

- **Componentização:**
  - Criar componentes pequenos e reutilizáveis.
  - Separar UI pura (presentational) da lógica de negócio.

- **Tailwind CSS:**
  - Usar classes utilitárias para prototipagem rápida.
  - Criar `tailwind.config.js` com design system.

- **Radix UI / Shadcn:**
  - Usar para acessibilidade e consistência de UI.

- **SCSS Modules:**
  - Para componentes complexos ou estilização mais refinada.

**Exemplo de componente:**  
```tsx
// components/Button.tsx
import { cn } from "@/lib/utils";

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn("px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700")}
    >
      {label}
    </button>
  );
}
```

---

## 🐳 5. Docker e Containers

### 🎯 Configuração Padrão para Projetos Maiores

**OBRIGATÓRIO**: Todo projeto maior deve ter configuração Docker completa:

- **Dockerfile multi-stage** otimizado:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production stage  
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

- **docker-compose.yml** para desenvolvimento:
```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

  app:
    build: 
      context: .
      target: builder  # Para desenvolvimento, usar stage builder
    restart: always
    env_file: .env.development
    ports:
      - "3000:3000"
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev

volumes:
  db_data:
```

- **docker-compose.prod.yml** para produção:
```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - db_data:/var/lib/postgresql/data

  app:
    build:
      context: .
      target: runner  # Para produção, usar stage runner
    restart: always
    env_file: .env.production
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  db_data:
```

### 🚀 Comandos Docker Essenciais

```bash
# Setup inicial do projeto
docker compose build                     # Build dos containers
docker compose up -d db                 # Subir apenas banco
docker compose exec app npx prisma migrate dev  # Aplicar migrations

# Desenvolvimento diário
docker compose up app                    # Iniciar desenvolvimento (com logs)
docker compose up -d                    # Iniciar em background
docker compose down                     # Parar containers

# Comandos de desenvolvimento
docker compose exec app npm install [package]       # Instalar nova dependência
docker compose exec app npx prisma studio          # Abrir Prisma Studio
docker compose exec app npx prisma migrate dev     # Nova migration
docker compose exec app npm run test              # Executar testes
docker compose exec app npm run lint              # Linting

# Debugging e manutenção
docker compose logs app                 # Ver logs da aplicação
docker compose exec app sh             # Acessar terminal do container
docker system prune                    # Limpar images/containers não utilizados

# Produção
docker compose -f docker-compose.prod.yml up -d     # Deploy produção
```

---

## 📝 6. Documentação Obrigatória

Cada projeto deve conter:

- **README.md** com:
  - Descrição do projeto
  - Como rodar localmente e com Docker
  - Fluxos principais (auth, RBAC, API)
- **docs/** com:
  - Endpoints da API
  - Estrutura de RBAC e permissões
  - Instruções para containers
  - Fluxos de autenticação e redefinição de senha

### 📋 Documentação de Desenvolvimento (docs/development/)

**OBRIGATÓRIO**: Sempre verificar e atualizar a documentação de desenvolvimento antes de finalizar qualquer tarefa:

- **TASKS.md** - Lista de tarefas, bugs e melhorias:
  - ✅ **Atualizar DIARIAMENTE** conforme progresso das atividades
  - Marcar status: `✅ Concluído`, `🚧 Em Desenvolvimento`, `📝 Planejado`, `💡 Ideia`
  - Incluir estimativas, assignees e descrições detalhadas
  - Priorizar com labels: `🔥 Alta`, `📋 Média`, `🔧 Baixa`

- **ROADMAP.md** - Planejamento de funcionalidades e cronograma:
  - ✅ **Atualizar SEMANALMENTE** ou quando mudanças significativas
  - Revisar funcionalidades planejadas vs. implementadas
  - Ajustar cronogramas e prioridades conforme necessário

- **CHANGELOG.md** - Histórico detalhado de mudanças:
  - ✅ **Atualizar A CADA FEATURE/BUGFIX** implementado
  - Seguir formato padronizado (Added, Changed, Fixed, Removed)
  - Incluir versioning semântico quando aplicável

### 🔄 Fluxo Obrigatório de Atualização da Documentação

**ANTES de finalizar qualquer task/feature:**

1. **Verificar `TASKS.md`**:
   - Marcar task atual como concluída ✅
   - Adicionar novas tasks identificadas durante desenvolvimento
   - Atualizar estimativas se necessário

2. **Atualizar `CHANGELOG.md`**:
   - Documentar todas as mudanças implementadas
   - Incluir impactos técnicos e de negócio
   - Referenciar issues/tasks relacionadas

3. **Revisar `ROADMAP.md` (se aplicável)**:
   - Verificar se funcionalidade afeta planejamento futuro
   - Atualizar status de milestones
   - Ajustar dependências entre features

**Checklist de Documentação**:
- [ ] Task marcada como concluída no TASKS.md
- [ ] Mudanças documentadas no CHANGELOG.md  
- [ ] ROADMAP.md revisado (se mudanças significativas)
- [ ] Novas tasks identificadas adicionadas ao TASKS.md

---

## 🧪 7. Testes e Refatoração

- Usar **Jest** ou **Vitest** para testes unitários.
- Usar **Playwright** ou **Cypress** para testes integrados.
- Criar testes para:
  - Auth e RBAC
  - Rotas de API
  - Componentes críticos
- Refatorar código periodicamente:
  - Identificar duplicações
  - Melhorar legibilidade
  - Atualizar dependências

---

## 📌 8. Observações de Organização e Escalabilidade

- Manter separação clara entre **camadas** (UI, lógica, dados).
- Usar **módulos independentes** para cada feature.
- Garantir consistência no estilo de código (ESLint + Prettier).
- Automatizar processos (Husky + lint-staged).
- Investir em documentação e revisões de código.

---

## ✅ Resumo Final

O projeto deve sempre seguir estes princípios:

1. **Estrutura organizada e modular**.  
2. **Segurança em RBAC, envs e endpoints**.  
3. **Autenticação sólida com NextAuth, Zod, bcryptjs**.  
4. **Frontend componentizado com Tailwind/Radix/SCSS**.  
5. **Infraestrutura Docker-first para projetos maiores**.  
6. **Documentação clara e sempre atualizada** (especialmente docs/development/).  
7. **Testes cobrindo funcionalidades críticas**.  
8. **Escalabilidade, manutenibilidade e revisão contínua**.  

### 🐳 REGRA CRÍTICA - Docker-First Development

**Para projetos maiores (multi-ambiente, produção):**
- ✅ **OBRIGATÓRIO**: Todo desenvolvimento em containers Docker
- ✅ **OBRIGATÓRIO**: Usar `docker compose exec app [comando]` ao invés de comandos locais
- ✅ **OBRIGATÓRIO**: Apenas Docker e Docker Compose instalados localmente
- ❌ **PROIBIDO**: Instalar Node.js, npm, Prisma localmente

**Critérios para Docker:**
- Projetos com banco de dados → **Docker OBRIGATÓRIO**
- Projetos em equipe (+ de 1 dev) → **Docker OBRIGATÓRIO**  
- Projetos com múltiplos ambientes → **Docker OBRIGATÓRIO**
- Protótipos individuais → **Docker OPCIONAL**

### 🚨 REGRA CRÍTICA - Documentação de Desenvolvimento

**NUNCA finalize uma task sem atualizar a documentação correspondente:**
- ✅ **TASKS.md** - Status diário das atividades
- ✅ **CHANGELOG.md** - Histórico de cada mudança implementada  
- ✅ **ROADMAP.md** - Planejamento e cronograma (revisão semanal)

**Esta regra é OBRIGATÓRIA e deve ser seguida por todos os desenvolvedores do projeto.**  
