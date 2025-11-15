# 🤖 Guia para Agentes IA - Desenvolvimento Next.js

## 🎯 Objetivo

Este documento estabelece diretrizes, regras e boas práticas para agentes IA trabalhando em projetos Next.js, garantindo consistência, qualidade e eficiência no desenvolvimento.

---

## 📋 Regras Fundamentais

### **1. Análise Antes da Ação**
- ✅ **SEMPRE** analisar o contexto completo antes de fazer mudanças
- ✅ **SEMPRE** verificar dependências existentes antes de instalar novas
- ✅ **SEMPRE** entender a estrutura do projeto antes de criar arquivos
- ❌ **NUNCA** fazer mudanças sem entender o impacto

### **2. Compatibilidade de Dependências**
- ✅ **SEMPRE** verificar compatibilidade entre versões
- ✅ **SEMPRE** usar versões estáveis em produção
- ✅ **SEMPRE** documentar mudanças de dependências
- ❌ **NUNCA** misturar versões incompatíveis (ex: Tailwind v3 + v4)

### **3. Estrutura e Organização**
- ✅ **SEMPRE** seguir a estrutura de pastas estabelecida
- ✅ **SEMPRE** usar convenções de nomenclatura consistentes
- ✅ **SEMPRE** organizar imports de forma lógica
- ❌ **NUNCA** criar arquivos fora da estrutura padrão sem justificativa

---

## 🏗️ Estrutura de Projeto Next.js

### **Estrutura Padrão**
```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── api/               # Route Handlers
│   ├── (auth)/            # Route Groups
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── forms/            # Componentes de formulário
├── lib/                  # Utilitários e configurações
│   ├── auth.ts           # Configuração de autenticação
│   ├── prisma.ts         # Cliente Prisma
│   └── utils.ts          # Funções utilitárias
├── hooks/                # Custom hooks
├── providers/            # Context providers
├── schemas/              # Schemas de validação (Zod)
├── server/               # Server Actions
├── styles/               # Estilos específicos
└── types/                # Definições de tipos TypeScript
```

### **Regras de Organização**
1. **Componentes UI**: Sempre em `src/components/ui/`
2. **Componentes específicos**: Em `src/components/` ou na pasta da feature
3. **Estilos**: SCSS modules na mesma pasta do componente
4. **Server Actions**: Sempre em `src/server/`
5. **Schemas**: Sempre em `src/schemas/`

---

## 🔧 Configurações Essenciais

### **1. PostCSS (postcss.config.mjs)**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### **2. Tailwind CSS (tailwind.config.js)**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Customizações do tema
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

### **3. TypeScript (tsconfig.json)**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🎨 Padrões de Desenvolvimento

### **1. Componentes React**

#### **Estrutura Padrão**
```tsx
// components/ExampleComponent.tsx
import { cn } from "@/lib/utils";
import styles from "./ExampleComponent.module.scss";

interface ExampleComponentProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function ExampleComponent({ 
  title, 
  children, 
  className 
}: ExampleComponentProps) {
  return (
    <div className={cn(styles.container, className)}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
}
```

#### **Regras para Componentes**
- ✅ **SEMPRE** usar TypeScript com interfaces
- ✅ **SEMPRE** usar `cn()` para combinar classes
- ✅ **SEMPRE** exportar como named export
- ✅ **SEMPRE** usar PascalCase para nomes
- ❌ **NUNCA** usar `any` como tipo

### **2. Server Actions**

#### **Estrutura Padrão**
```tsx
// server/userActions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const session = await getServerSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await prisma.user.create({
      data: validatedFields.data,
    });

    return { success: true, user };
  } catch (error) {
    return { error: "Failed to create user" };
  }
}
```

#### **Regras para Server Actions**
- ✅ **SEMPRE** usar `"use server"` no topo
- ✅ **SEMPRE** validar dados com Zod
- ✅ **SEMPRE** verificar autenticação/autorização
- ✅ **SEMPRE** usar try/catch para erros
- ❌ **NUNCA** expor dados sensíveis

### **3. Schemas de Validação**

#### **Estrutura Padrão**
```tsx
// schemas/userSchemas.ts
import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  email: z.string()
    .email("Email inválido"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
```

---

## 🔐 Segurança e Autenticação

### **1. NextAuth Configuration**
```tsx
// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Seus providers aqui
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
};
```

### **2. Middleware de Proteção**
```tsx
// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Lógica adicional de middleware
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Verificar autorização
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"]
};
```

---

## 🎯 Fluxo de Trabalho para Agentes

### **1. Análise Inicial**
```bash
# 1. Verificar estrutura do projeto
ls -la src/

# 2. Verificar dependências
npm list --depth=0

# 3. Verificar configurações
cat postcss.config.mjs
cat tailwind.config.js
cat tsconfig.json
```

### **2. Antes de Fazer Mudanças**
- [ ] Entender o contexto da solicitação
- [ ] Verificar arquivos relacionados
- [ ] Identificar dependências afetadas
- [ ] Planejar a implementação

### **3. Durante a Implementação**
- [ ] Seguir padrões estabelecidos
- [ ] Usar tipos TypeScript corretos
- [ ] Implementar validação adequada
- [ ] Adicionar tratamento de erros

### **4. Após a Implementação**
- [ ] Testar a funcionalidade
- [ ] Verificar build (`npm run build`)
- [ ] Documentar mudanças importantes
- [ ] Atualizar tipos se necessário

---

## 🚨 Resolução de Problemas Comuns

### **1. Erro de Build - Dependências**
```bash
# Verificar conflitos
npm list tailwindcss

# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### **2. Erro de TypeScript**
```bash
# Verificar tipos
npx tsc --noEmit

# Regenerar tipos do Prisma
npx prisma generate
```

### **3. Erro de PostCSS/Tailwind**
```bash
# Verificar configuração
cat postcss.config.mjs

# Testar build isolada
npx tailwindcss -i ./src/app/globals.css -o ./test.css
```

---

## 📚 Comandos Essenciais

### **Desenvolvimento**
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
```

### **Database (Prisma)**
```bash
npx prisma generate  # Gerar cliente
npx prisma migrate   # Aplicar migrações
npx prisma studio    # Interface visual
npx prisma db push   # Push schema para DB
```

### **Docker**
```bash
docker-compose build # Build das imagens
docker-compose up    # Subir containers
docker-compose down  # Parar containers
```

---

## ✅ Checklist de Qualidade

### **Antes de Finalizar**
- [ ] Código segue padrões estabelecidos
- [ ] TypeScript sem erros
- [ ] Build executa sem erros
- [ ] Componentes são reutilizáveis
- [ ] Validação implementada corretamente
- [ ] Tratamento de erros adequado
- [ ] Documentação atualizada
- [ ] Testes passando (se existirem)

### **Segurança**
- [ ] Dados sensíveis não expostos
- [ ] Autenticação verificada
- [ ] Autorização implementada
- [ ] Inputs validados
- [ ] SQL injection prevenido

---

## 🔗 Recursos Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Zod Documentation](https://zod.dev/)

---

**📝 Última atualização:** 01/10/2024  
**🎯 Versão:** 1.0  
**👥 Público-alvo:** Agentes IA trabalhando com Next.js