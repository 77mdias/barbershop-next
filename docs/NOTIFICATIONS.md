# � Sistema de Notificações - Barbershop Next

Documentação completa do sistema de toast notifications implementado com componentes customizados.

---

## 📋 Visão Geral

**Status**: ✅ **100% IMPLEMENTADO** (22 Oct 2025)  
**Implementação**: Sistema customizado com Radix UI Primitives  
**Integração**: Layout principal da aplicação

Sistema profissional de notificações toast para feedback visual nas ações dos usuários, substituindo a dependência externa Sonner por uma implementação customizada e otimizada.

---

## 🎯 Características

### Funcionalidades Principais
- ✅ Toast notifications customizadas e elegantes
- ✅ Hook `useToast` personalizado para gerenciamento de estado
- ✅ 4 tipos principais (success, error, warning, info)
- ✅ Auto-dismiss configurável por tipo
- ✅ Múltiplos toasts simultâneos
- ✅ Emojis integrados para melhor UX
- ✅ API consistente com utilities `showToast`
- ✅ Acessibilidade completa (ARIA)
- ✅ Responsive e mobile-friendly
- ✅ Integração global no layout

### Tipos de Notificações Implementados
1. **Success** - Ações bem-sucedidas
2. **Error** - Erros e problemas
3. **Warning** - Avisos importantes
4. **Info** - Informações gerais
5. **Loading** - Processos em andamento
6. **Promise** - Estados de promises automáticos

---

## 🛠️ Implementação

### Estrutura de Arquivos

```
src/
├── components/ui/
│   ├── sonner.tsx           # Componente Toaster
│   ├── toast.tsx            # Primitivos de toast (shadcn)
│   └── use-toast.ts         # Hook customizado
└── app/
    └── layout.tsx           # Integração no layout
```

### 1. Componente Toaster

**Arquivo**: `/src/components/ui/sonner.tsx`

```tsx
"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
```

### 2. Integração no Layout

**Arquivo**: `/src/app/layout.tsx`

```tsx
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <HeaderNavigation />
          {children}
          <ConditionalBottomNavigation />
          <Toaster /> {/* 👈 Toast notifications */}
        </Providers>
      </body>
    </html>
  );
}
```

---

## 🚀 Uso Básico

### Importação

```typescript
import { toast } from 'sonner';
```

### Exemplos de Uso

#### 1. Success Toast
```typescript
toast.success('Avaliação criada com sucesso!');
```

#### 2. Error Toast
```typescript
toast.error('Erro ao criar avaliação. Tente novamente.');
```

#### 3. Warning Toast
```typescript
toast.warning('Você tem alterações não salvas.');
```

#### 4. Info Toast
```typescript
toast.info('Nova atualização disponível.');
```

#### 5. Loading Toast
```typescript
const loadingToast = toast.loading('Enviando...');

// Depois atualizar
toast.success('Enviado!', { id: loadingToast });
```

---

## 🎨 Customização

### Toast com Duração Customizada

```typescript
toast.success('Mensagem rápida', {
  duration: 2000, // 2 segundos
});

toast.error('Erro persistente', {
  duration: Infinity, // Fica até ser fechado manualmente
});
```

### Toast com Ação

```typescript
toast('Perfil atualizado', {
  action: {
    label: 'Visualizar',
    onClick: () => {
      router.push('/profile');
    },
  },
});
```

### Toast com Descrição

```typescript
toast.success('Operação concluída', {
  description: 'Seus dados foram salvos com sucesso.',
});
```

### Toast com Posição Customizada

```typescript
toast('Notificação', {
  position: 'top-center', // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
});
```

---

## 🔧 Uso Avançado

### 1. Promise Toast

Automaticamente gerencia estados loading → success/error:

```typescript
toast.promise(
  createReview(data),
  {
    loading: 'Criando avaliação...',
    success: 'Avaliação criada com sucesso!',
    error: 'Erro ao criar avaliação',
  }
);
```

### 2. Toast Customizado

```typescript
toast.custom((t) => (
  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg">
    <div className="text-2xl">🎉</div>
    <div>
      <p className="font-semibold">Parabéns!</p>
      <p className="text-sm text-gray-600">Você alcançou uma meta!</p>
    </div>
    <button
      onClick={() => toast.dismiss(t)}
      className="ml-auto text-gray-400 hover:text-gray-600"
    >
      ✕
    </button>
  </div>
));
```

### 3. Múltiplos Toasts em Sequência

```typescript
const toastId = toast.loading('Processando...');

try {
  await step1();
  toast.loading('Quase lá...', { id: toastId });
  
  await step2();
  toast.success('Concluído!', { id: toastId });
} catch (error) {
  toast.error('Erro no processo', { id: toastId });
}
```

---

## 📦 Integração com Componentes

### ReviewForm

```typescript
"use client";

import { toast } from 'sonner';
import { createReview } from '@/server/reviewActions';

export function ReviewForm() {
  const onSubmit = async (data: ReviewFormData) => {
    try {
      const result = await createReview(data);
      
      if (result.success) {
        toast.success('Avaliação enviada com sucesso!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* campos do formulário */}
    </form>
  );
}
```

### Server Actions

```typescript
"use server";

import { toast } from 'sonner';

export async function deleteReview(id: string) {
  try {
    await db.serviceHistory.delete({
      where: { id },
    });
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: 'Erro ao deletar avaliação' 
    };
  }
}

// No componente cliente
const handleDelete = async (id: string) => {
  const result = await deleteReview(id);
  
  if (result.success) {
    toast.success('Avaliação deletada');
  } else {
    toast.error(result.error);
  }
};
```

### Dashboard Actions

```typescript
export async function getBarberMetrics(barberId: string) {
  try {
    // ... buscar métricas
    return { success: true, data: metrics };
  } catch (error) {
    // Toast é mostrado no cliente
    return { 
      success: false, 
      error: 'Erro ao carregar métricas' 
    };
  }
}
```

---

## 🎯 Boas Práticas

### 1. Mensagens Claras e Objetivas

```typescript
// ✅ Bom
toast.success('Perfil atualizado com sucesso');

// ❌ Evitar
toast.success('OK');
```

### 2. Feedback Imediato

```typescript
const handleSubmit = async () => {
  // Mostrar loading imediatamente
  const toastId = toast.loading('Salvando...');
  
  try {
    await saveData();
    toast.success('Salvo!', { id: toastId });
  } catch (error) {
    toast.error('Erro ao salvar', { id: toastId });
  }
};
```

### 3. Erros Informativos

```typescript
// ✅ Bom
toast.error('Email já cadastrado. Tente fazer login.');

// ❌ Evitar
toast.error('Erro');
```

### 4. Ações Relevantes

```typescript
// Permitir desfazer ações importantes
toast.success('Item deletado', {
  action: {
    label: 'Desfazer',
    onClick: () => restoreItem(),
  },
  duration: 5000, // Tempo suficiente para reagir
});
```

### 5. Limitar Duração

```typescript
// Loading de longa duração
toast.loading('Processando arquivo grande...', {
  duration: 10000, // 10 segundos
});

// Success/Error rápidos
toast.success('Copiado!', {
  duration: 2000, // 2 segundos
});
```

---

## 🎨 Customização de Estilo

### Tailwind Classes

O componente Toaster já está configurado com classes Tailwind que seguem o design system:

```typescript
toastOptions={{
  classNames: {
    toast: "bg-background text-foreground border-border shadow-lg",
    description: "text-muted-foreground",
    actionButton: "bg-primary text-primary-foreground",
    cancelButton: "bg-muted text-muted-foreground",
  },
}}
```

### Temas

```typescript
// Light mode (padrão)
<Toaster />

// Dark mode (automático com preferência do sistema)
<Toaster theme="dark" />

// Sempre escuro
<Toaster theme="dark" />
```

---

## 📊 Status de Implementação

### Componentes Integrados
- ✅ ReviewForm
- ✅ ReviewsList
- ✅ Dashboard components
- ✅ Layout principal
- ⏳ ImageUpload (em progresso)
- ⏳ Appointment forms (planejado)

### Tipos de Feedback Implementados
- ✅ Sucesso em operações
- ✅ Erros em formulários
- ✅ Loading states
- ✅ Confirmações de ações
- ⏳ Notificações em tempo real (planejado)

---

## 🔮 Próximos Passos

### Features Planejadas
- [ ] Notificações push (web push API)
- [ ] Histórico de notificações
- [ ] Agrupamento de notificações similares
- [ ] Notificações persistentes (banco de dados)
- [ ] Configurações de preferência do usuário

### Melhorias
- [ ] Sons de notificação (opcional)
- [ ] Vibração em mobile
- [ ] Animações customizadas
- [ ] Temas personalizados

---

## 📚 Referências

### Documentação Externa
- [Sonner Official Docs](https://sonner.emilkowal.ski/)
- [shadcn/ui Toast](https://ui.shadcn.com/docs/components/toast)

### Documentação Interna
- [Features](/docs/FEATURES.md)
- [Development Guide](/docs/development/README.md)

---

## 🆘 Troubleshooting

### Toast não aparece

```typescript
// Verificar se Toaster está no layout
// Verificar import correto
import { toast } from 'sonner'; // ✅
import { toast } from '@/components/ui/toast'; // ❌
```

### Múltiplos toasts simultaneamente

```typescript
// Usar o mesmo ID para atualizar
const id = toast.loading('Processando...');
toast.success('Concluído!', { id });
```

### Toast persiste após navegação

```typescript
// Limpar todos os toasts
toast.dismiss();

// Ou implementar no router
router.push('/dashboard');
toast.dismiss();
```

---

**Última atualização**: 21 de outubro de 2025  
**Responsável**: Development Team  
**Status**: ✅ Implementado e funcional
