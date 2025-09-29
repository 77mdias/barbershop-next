# 📚 Documentação de Decisões Técnicas - Barbershop App

## 🎯 Visão Geral do Projeto

Este projeto é uma aplicação web moderna para agendamento de serviços de barbearia, desenvolvida com foco em **experiência mobile-first** e **design system consistente**.

### Stack Tecnológica Escolhida

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + SCSS Modules
- **Componentes**: shadcn/ui + Radix UI
- **Arquitetura**: Component-driven development

---

## 🏗️ Decisões de Arquitetura

### 1. Estrutura de Componentes

**Decisão**: Separar componentes em duas categorias:
- `src/components/ui/` - Componentes base reutilizáveis (Button, Card, Avatar)
- `src/components/` - Componentes específicos da aplicação (Header, ServiceCard, etc.)

**Justificativa**: 
- Facilita manutenção e reutilização
- Segue padrões do shadcn/ui
- Permite evolução independente dos componentes

### 2. Sistema de Design

**Decisão**: Implementar design system completo com tokens CSS customizados

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... mais tokens */
}
```

**Justificativa**:
- Consistência visual em toda aplicação
- Facilita mudanças de tema (dark/light mode)
- Melhora DX (Developer Experience)

### 3. Styling Strategy: Tailwind + SCSS Modules

**Decisão**: Usar Tailwind para utilitários básicos e SCSS Modules para componentes complexos

**Exemplo prático**:
```tsx
// Tailwind para layout básico
<div className="flex items-center gap-3 p-4">
  
// SCSS Module para estilização específica
<div className={styles.serviceCard}>
```

**Justificativa**:
- Tailwind: Prototipagem rápida e consistência
- SCSS: Controle fino para animações e estados complexos
- Modules: Evita conflitos de CSS

---

## 🎨 Implementações de Design

### 1. Componente ServiceCard

**Desafio**: Criar cards de serviços com estados ativos/inativos

**Solução**:
```scss
.serviceCard {
  @apply bg-white rounded-2xl p-4 transition-all duration-200;
  
  &.active {
    @apply bg-primary text-primary-foreground;
    transform: scale(1.02);
  }
  
  &:hover {
    @apply shadow-md;
    transform: translateY(-2px);
  }
}
```

**Aprendizado**: SCSS Modules permitem estados complexos mantendo type safety

### 2. Sistema de Avatar

**Desafio**: Avatar com fallback para iniciais quando imagem falha

**Solução**:
```tsx
export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  return (
    <div className={cn(sizeClasses[size], styles.avatar)}>
      {src && !imageError ? (
        <img onError={() => setImageError(true)} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}
```

**Aprendizado**: Estado local para controlar fallbacks melhora UX

### 3. Design Responsivo

**Estratégia**: Mobile-first com breakpoints Tailwind

```scss
.header {
  @apply px-4 py-3;
  
  @screen sm {
    @apply px-6 py-4;
  }
  
  &__greeting {
    @apply text-sm;
    
    @screen sm {
      @apply text-base;
    }
  }
}
```

**Aprendizado**: Combinar Tailwind responsive classes com SCSS @screen é poderoso

---

## 🔧 Utilitários e Helpers

### 1. Função cn() para Class Names

```typescript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Uso**: Combina classes condicionalmente e resolve conflitos Tailwind

### 2. Geração de Iniciais

```typescript
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
```

**Uso**: Fallback consistente para avatars

---

## 📱 Padrões de UX Implementados

### 1. Feedback Visual
- **Hover states**: Elevação sutil com `transform: translateY(-2px)`
- **Active states**: Mudança de cor e escala
- **Loading states**: Skeleton com `animate-pulse`

### 2. Acessibilidade
- **Alt texts** descritivos em imagens
- **Focus states** visíveis
- **Semantic HTML** (nav, main, section)

### 3. Performance
- **Lazy loading** de imagens
- **Error boundaries** para fallbacks
- **Otimização de re-renders** com useCallback

---

## 🚀 Próximos Passos Sugeridos

### 1. Funcionalidades
- [ ] Sistema de autenticação (NextAuth.js)
- [ ] Integração com banco de dados (Prisma + PostgreSQL)
- [ ] Sistema de agendamentos
- [ ] Pagamentos (Stripe)

### 2. Melhorias Técnicas
- [ ] Testes unitários (Jest + Testing Library)
- [ ] Storybook para documentação de componentes
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance

### 3. UX/UI
- [ ] Animações com Framer Motion
- [ ] Dark mode completo
- [ ] PWA capabilities
- [ ] Micro-interações

---

## 💡 Lições Aprendidas

### 1. **Design System First**
Investir tempo inicial em tokens e componentes base acelera desenvolvimento posterior.

### 2. **TypeScript + Props Interface**
Documentar props com JSDoc melhora DX e manutenibilidade.

### 3. **SCSS Modules + Tailwind**
Combinação poderosa: Tailwind para layout, SCSS para estados complexos.

### 4. **Mobile-First Always**
Começar mobile e expandir para desktop resulta em melhor UX.

### 5. **Component Composition**
Preferir composição a props complexas (ex: Avatar simples vs Avatar + AvatarImage + AvatarFallback).

---

## 📊 Métricas de Qualidade

- ✅ **TypeScript**: 100% tipado
- ✅ **Responsivo**: Mobile-first design
- ✅ **Acessibilidade**: Semantic HTML + ARIA
- ✅ **Performance**: Otimizações de imagem e estado
- ✅ **Manutenibilidade**: Componentes modulares

---

*Documentação criada seguindo metodologia de aprendizado ativo e decisões técnicas fundamentadas.*