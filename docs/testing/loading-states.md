# 💀 Loading States e Skeleton Loaders - Barbershop Next

Documentação completa do sistema de estados de carregamento e skeleton loaders para melhor experiência do usuário.

---

## 📋 Visão Geral

**Status**: ✅ Implementado (Outubro 2025)  
**Issue**: #012 - Concluída  

O sistema de loading states e skeleton loaders fornece feedback visual durante carregamento de dados, melhorando significativamente a percepção de performance e UX da aplicação.

---

## 🎯 Características

### Benefícios
- ✅ Feedback visual imediato
- ✅ Reduz percepção de lentidão
- ✅ Mantém usuário engajado
- ✅ Melhora UX geral
- ✅ Acessibilidade (ARIA labels)
- ✅ Performance otimizada
- ✅ Componentização reutilizável

### Componentes Implementados
1. **LoadingSpinner** - Spinner animado
2. **Skeleton** - Placeholder animado
3. **ReviewSkeleton** - Skeleton para review card
4. **ReviewsListSkeleton** - Skeleton para lista de reviews

---

## 🛠️ Implementação

### Estrutura de Arquivos

```
src/components/ui/
├── loading-spinner.tsx     # Spinner de carregamento
├── skeleton.tsx           # Skeleton base
└── review-skeleton.tsx    # Skeletons específicos de reviews
```

---

## 1. 🔄 LoadingSpinner

### Características
- Múltiplos tamanhos (sm, md, lg)
- Texto customizável
- Classes Tailwind customizáveis
- Ícone animado (Lucide React)
- Acessível (role="status")

### Código Fonte

**Arquivo**: `/src/components/ui/loading-spinner.tsx`

```tsx
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

function LoadingSpinner({ 
  size = "md", 
  text, 
  className 
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      role="status"
      aria-label={text || "Carregando"}
    >
      <Loader2
        className={cn(
          "animate-spin text-muted-foreground", 
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

export { LoadingSpinner };
```

### Uso

```tsx
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Básico
<LoadingSpinner />

// Com tamanho
<LoadingSpinner size="lg" />

// Com texto
<LoadingSpinner 
  size="md" 
  text="Carregando dados..." 
/>

// Customizado
<LoadingSpinner 
  size="sm" 
  text="Aguarde..."
  className="my-8"
/>
```

### Exemplos de Uso

#### Em Página

```tsx
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner 
          size="lg" 
          text="Carregando dashboard..." 
        />
      </div>
    );
  }
  
  return <Dashboard />;
}
```

#### Em Modal

```tsx
<Dialog>
  <DialogContent>
    {isLoading ? (
      <LoadingSpinner text="Processando..." />
    ) : (
      <form>{/* conteúdo */}</form>
    )}
  </DialogContent>
</Dialog>
```

#### Em Button

```tsx
<Button disabled={isSubmitting}>
  {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
  {isSubmitting ? 'Enviando...' : 'Enviar'}
</Button>
```

---

## 2. 💀 Skeleton

### Características
- Animação pulse
- Classes customizáveis
- Tamanhos e formas flexíveis
- Base para skeletons específicos

### Código Fonte

**Arquivo**: `/src/components/ui/skeleton.tsx`

```tsx
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Carregando conteúdo"
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
```

### Uso Básico

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Linha de texto
<Skeleton className="h-4 w-full" />

// Círculo (avatar)
<Skeleton className="h-12 w-12 rounded-full" />

// Imagem
<Skeleton className="h-48 w-full" />

// Botão
<Skeleton className="h-10 w-24" />
```

### Exemplos de Skeleton Cards

#### Card de Texto

```tsx
function TextCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
```

#### Card de Usuário

```tsx
function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
```

---

## 3. 🎨 ReviewSkeleton

### Características
- Skeleton completo para review card
- Múltiplos skeletons (avatar, texto, imagens)
- Layout consistente com ReviewCard
- ReviewsListSkeleton para lista completa

### Código Fonte

**Arquivo**: `/src/components/ui/review-skeleton.tsx`

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ReviewSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full" />
          
          {/* Nome e data */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          
          {/* Rating */}
          <div className="ml-auto">
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Comentário */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {/* Imagens */}
        <div className="flex gap-2">
          <Skeleton className="h-20 w-20 rounded-md" />
          <Skeleton className="h-20 w-20 rounded-md" />
        </div>
        
        {/* Ações */}
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reviews skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

### Uso

```tsx
import { 
  ReviewSkeleton, 
  ReviewsListSkeleton 
} from "@/components/ui/review-skeleton";

// Single review
<ReviewSkeleton />

// Lista completa
<ReviewsListSkeleton />
```

---

## 🎯 Padrões de Uso

### 1. Componente com Loading State

```tsx
"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function MyComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Carregando..." />;
  }

  return <div>{/* renderizar data */}</div>;
}
```

### 2. Componente com Skeleton

```tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MyComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return <div>{/* renderizar data */}</div>;
}
```

### 3. Lista com Skeleton

```tsx
export function ReviewsList() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  if (loading) {
    return <ReviewsListSkeleton />;
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
```

### 4. Suspense Boundary

```tsx
import { Suspense } from "react";
import { ReviewsListSkeleton } from "@/components/ui/review-skeleton";

export default function ReviewsPage() {
  return (
    <Suspense fallback={<ReviewsListSkeleton />}>
      <ReviewsList />
    </Suspense>
  );
}
```

---

## 📊 Componentes Integrados

### Status de Implementação

| Componente | Loading State | Skeleton | Status |
|-----------|---------------|----------|--------|
| ReviewsList | ✅ | ✅ | Completo |
| ReviewForm | ✅ | ⏳ | Parcial |
| Dashboard | ✅ | ✅ | Completo |
| Dashboard Barber | ✅ | ✅ | Completo |
| ImageUpload | ✅ | ⏳ | Parcial |
| AppointmentList | ⏳ | ⏳ | Pendente |

### Exemplos em Produção

#### Dashboard Principal

```tsx
export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

#### Lista de Reviews

```tsx
export function ReviewsList() {
  const { data, isLoading } = useReviews();

  if (isLoading) {
    return <ReviewsListSkeleton />;
  }

  return (
    <div>
      {/* conteúdo */}
    </div>
  );
}
```

---

## 🎨 Customização

### Cores e Animação

```tsx
// Personalizar cor
<Skeleton className="bg-gray-200 dark:bg-gray-800" />

// Velocidade da animação
<Skeleton className="animate-pulse-slow" />

// Sem animação
<Skeleton className="animate-none" />
```

### Formas Customizadas

```tsx
// Quadrado
<Skeleton className="h-20 w-20" />

// Retângulo
<Skeleton className="h-12 w-48" />

// Círculo
<Skeleton className="h-16 w-16 rounded-full" />

// Rounded corners
<Skeleton className="h-32 w-full rounded-lg" />
```

---

## 🚀 Boas Práticas

### 1. Manter Consistência com Layout Real

```tsx
// ✅ Bom - skeleton similar ao conteúdo real
<Skeleton className="h-4 w-full" />    // Título
<Skeleton className="h-3 w-3/4" />     // Subtítulo

// ❌ Evitar - muito diferente
<Skeleton className="h-20 w-20" />     // Para um título
```

### 2. Usar Skeleton para Layouts Complexos

```tsx
// ✅ Bom - mostra estrutura
<ReviewSkeleton />

// ❌ Evitar - genérico demais
<LoadingSpinner />
```

### 3. Combinar com Suspense

```tsx
// ✅ Bom - streaming SSR
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

### 4. Loading State para Ações

```tsx
// ✅ Bom - feedback imediato
<Button disabled={isLoading}>
  {isLoading && <LoadingSpinner size="sm" />}
  Salvar
</Button>
```

---

## 📚 Referências

### Documentação Externa
- [React Suspense](https://react.dev/reference/react/Suspense)
- [shadcn/ui Skeleton](https://ui.shadcn.com/docs/components/skeleton)

### Documentação Interna
- [Features](/docs/FEATURES.md)
- [UI Components](/docs/ui-components.md)
- [Testing](/docs/TESTING.md)

---

## 🔮 Próximos Passos

### Melhorias Planejadas
- [ ] Mais skeletons específicos (AppointmentSkeleton, ServiceSkeleton)
- [ ] Skeleton para tabelas
- [ ] Loading states para infinite scroll
- [ ] Progress indicators para uploads
- [ ] Shimmer effect option

---

**Última atualização**: 21 de outubro de 2025  
**Responsável**: Development Team  
**Status**: ✅ Implementado e em uso
