# 🚀 Regras e Boas Práticas para Projetos Fullstack Web

Este documento define diretrizes para o desenvolvimento de projetos **Fullstack Web** usando a stack padrão:

- **Backend**: Node.js, Next.js (App Router), TypeScript  
- **ORM & Banco**: Prisma ORM + PostgreSQL (Neon, Supabase, etc)  
- **API**: Rotas handlers internas + Server Actions  
- **Autenticação**: NextAuth + Zod + bcryptjs + múltiplos providers (Google, GitHub, etc)  
- **Validação & Segurança**: RBAC, validação de email (nodemailer), redefinição de senha  
- **Infraestrutura**: Docker & Docker Compose  
- **Frontend**: Next.js + Tailwind CSS, Radix UI/Shadcn, SCSS modules  

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
│── docker-compose.yml
│── Dockerfile
│── .env.example
│── README.md
│── docs/                    # Documentação (API, RBAC, fluxos, containers)
```

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

- Criar `Dockerfile` otimizado:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

- Criar `docker-compose.yml` para banco + app:
```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  app:
    build: .
    restart: always
    env_file: .env
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  db_data:
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

1. Estrutura organizada e modular.  
2. Segurança em RBAC, envs e endpoints.  
3. Autenticação sólida com NextAuth, Zod, bcryptjs.  
4. Frontend componentizado com Tailwind/Radix/SCSS.  
5. Infraestrutura com Docker e banco PostgreSQL.  
6. Documentação clara e acessível.  
7. Testes cobrindo funcionalidades críticas.  
8. Escalabilidade, manutenibilidade e revisão contínua.  
