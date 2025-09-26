# 📘 Next.js e TypeScript

## Estrutura do Projeto

```
src/
├── app/                 # Rotas e páginas (App Router)
│   ├── api/             # Rotas de API
│   ├── (auth)/          # Grupo de rotas de autenticação
│   └── page.tsx         # Página inicial
├── components/          # Componentes reutilizáveis
├── lib/                 # Configurações e utilitários
└── styles/              # Estilos globais
```

## Principais Conceitos

### App Router
- Roteamento baseado em sistema de arquivos
- Componentes Server e Client
- Server Actions para manipulação de dados

### TypeScript
- Tipagem estática para maior segurança
- Interfaces para modelos de dados
- Zod para validação de schemas

## Exemplos Práticos

### Criando uma rota de API
```typescript
// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}
```

### Criando um Server Action
```typescript
// src/app/actions.ts
'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createAppointment(formData: FormData) {
  const date = formData.get('date') as string;
  const service = formData.get('service') as string;
  
  await prisma.appointment.create({
    data: { date, service }
  });
  
  revalidatePath('/appointments');
}
```

## Recursos Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zod Documentation](https://zod.dev/)