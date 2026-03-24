# Redesign de Rotas — BarberKings

**Data:** 2026-03-22
**Escopo:** Todas as rotas exceto `/` (Home já finalizada)
**Abordagem:** Paralelo por domínio (5 subagentes)

---

## Páginas já concluídas (NÃO tocar)

As seguintes rotas já foram redesenhadas e estão alinhadas com o design system. **Subagentes devem ignorar esses arquivos completamente:**

- `src/app/about/page.tsx`
- `src/app/gallery/page.tsx`
- `src/app/prices/page.tsx`
- `src/app/promotions/page.tsx`
- `src/app/community/page.tsx`
- `src/app/support/page.tsx`
- `src/app/reviews/page.tsx`
- `src/app/salons/page.tsx`
- `src/app/salons/[id]/page.tsx`

---

## Fora do escopo (ignorar)

Páginas de desenvolvimento interno — não redesenhar:

- `src/app/test-upload/page.tsx`
- `src/app/test-upload-simple/page.tsx`
- `src/app/test-review/page.tsx`

---

## Objetivo

Redesenhar todas as demais páginas da aplicação para seguir o mesmo padrão visual da Home: design system de grooming premium com tokens CSS consistentes, tipografia `font-display italic`, cards com `rounded-2xl`, accent dourado e ausência de cores hardcoded.

---

## Design System Compartilhado

### Tokens obrigatórios (definidos em `globals.css`)

| Token | Uso |
|-------|-----|
| `bg-background` | Fundo de seções primárias |
| `bg-surface-1` | Fundo de seções alternadas |
| `bg-surface-card` | Fundo de cards e containers |
| `text-foreground` | Texto primário |
| `text-fg-muted` | Texto secundário/descritivo |
| `text-fg-subtle` | Labels de métricas, textos terciários |
| `text-accent` | Labels, ícones, destaques dourados |
| `border-border` | Bordas padrão |
| `hsl(var(--accent))` | Cor dourada — botões primários, ícones |
| `hsl(var(--accent)/0.1)` | Background de ícones em cards |

### Tipografia

```
Títulos principais:     font-display text-{4xl|5xl} font-bold italic text-foreground
Títulos de cards:       font-display text-2xl font-bold italic text-foreground
Labels de seção:        text-xs font-semibold uppercase tracking-[0.2em] text-accent
Labels de métrica:      text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle
Subtítulos:             text-base leading-relaxed text-fg-muted (ou text-fg-subtle)
Corpo:                  text-sm leading-relaxed text-fg-muted
```

### Componentes base reutilizáveis

- **`PageHero`** (`src/components/shared/PageHero.tsx`) — cabeçalho de páginas. Props: `badge`, `title`, `subtitle`, `actions`, `children`, `className`
- **`SectionHeader`** (`src/components/shared/SectionHeader.tsx`) — subtítulo de seção. Props: `title`, `subtitle`, `centered`, `className`
- **`Footer`** (`src/components/home/Footer.tsx`) — adicionar em páginas públicas que ainda não têm

### Padrões de card

```tsx
// Card padrão
<article className="card-hover rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300">
  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
    <Icon className="h-5 w-5" />
  </div>
  <h2 className="mt-4 font-display text-2xl font-bold italic text-foreground">Título</h2>
  <p className="mt-2 text-sm leading-relaxed text-fg-muted">Descrição</p>
</article>

// KPI card (dashboard)
<article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">Label</p>
  <p className="mt-3 font-display text-4xl font-bold italic text-accent">42</p>
  <p className="mt-2 text-sm text-fg-muted">Descrição</p>
</article>
```

### Padrões de botão

```tsx
// Primário (accent dourado)
<button className="gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90">
  Label <ArrowRight className="h-4 w-4" />
</button>

// Outline
<button className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent">
  Label
</button>

// Destructive (logout/delete)
<button className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-5 py-2.5 text-sm font-semibold text-destructive transition-all duration-300 hover:bg-[hsl(var(--destructive)/0.15)]">
  Label
</button>
```

### Padrões de tabs

```tsx
<TabsList className="rounded-2xl border border-border bg-surface-card p-1">
  <TabsTrigger className="rounded-xl px-4 py-2 text-sm font-medium text-fg-muted transition-all data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none">
    Tab
  </TabsTrigger>
</TabsList>
```

### Padrões de input/formulário

```tsx
<input className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]" />
```

### Spinner de loading

```tsx
<div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
```

### Padrões de layout de página

```tsx
// Alternância de fundo entre seções
<main className="flex min-h-screen flex-col bg-background text-foreground">
  <PageHero ... />                         // bg-surface-1 (interno ao PageHero)
  <section className="bg-background ...">  // seção 1
  <section className="bg-surface-1 ...">  // seção 2
  <section className="bg-background ...">  // seção 3
</main>
```

### Hero atmosférico (para páginas com hero customizado sem PageHero)

```tsx
<section className="grain-overlay relative overflow-hidden bg-surface-1 py-14 lg:py-20">
  <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.07)] blur-[90px]" />
  <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.05)] blur-[80px]" />
  ...
</section>
```

### Regras proibidas (NUNCA usar)

- Cores hardcoded: `text-gray-600`, `bg-blue-50`, `text-blue-600`, `border-l-blue-500`, `bg-green-50`, `text-purple-600`, `text-red-600`, etc.
- Emojis em UI (👥, ✂️, 🛡️, ✅, etc.)
- SCSS modules novos para estilos visuais
- `var(--all-black)`, `var(--card-product)`, `var(--button-primary)`, `var(--text-price-secondary)` — variáveis não definidas no design system atual
- `bg-purple-600`, `text-red-600` e outras cores Tailwind hardcoded
- `border-l-4 border-l-{color}` (estilo de border lateral colorida)

---

## Domínio 1 — Auth

### Páginas
- `/auth/signin` → `src/app/auth/signin/page.tsx`
- `/auth/signup` → `src/app/auth/signup/page.tsx`
- `/auth/error` → `src/app/auth/error/page.tsx`
- `/auth/reset-password` → `src/app/auth/reset-password/page.tsx`
- `/auth/thank-you` → `src/app/auth/thank-you/page.tsx`
- `/auth/verify-email` → `src/app/auth/verify-email/page.tsx`
- `/auth-required` → `src/app/auth-required/page.tsx`

### Layout split-screen (signin/signup)

```
┌─────────────────────────────────────────────────────────────┐
│  [esquerda - hidden mobile / lg:flex]   │  [direita]        │
│  bg-surface-1 grain-overlay             │  bg-background    │
│                                         │                   │
│  • Logo BarberKings (font-display       │  • Link "← Voltar"│
│    text-4xl font-bold italic)           │  • Badge page     │
│  • Slogan em text-fg-muted              │  • Título h1      │
│  • Decorative accent line               │  • Subtítulo      │
│  • 3 feature bullets com ícones accent  │  • Formulário     │
│                                         │  • Social logins  │
│                                         │  • Link signup/in │
└─────────────────────────────────────────────────────────────┘
Mobile: apenas lado direito (formulário), sem split
```

Estrutura:
```tsx
<main className="flex min-h-screen bg-background text-foreground">
  {/* Lado esquerdo — apenas desktop */}
  <div className="grain-overlay hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-1 p-12">
    {/* branding */}
  </div>

  {/* Lado direito — formulário */}
  <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12">
    <Link href="/" className="mb-6 self-start inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80">
      <ArrowLeft className="h-4 w-4" /> Voltar
    </Link>
    <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Entrar
    </span>
    <h1 className="font-display text-3xl font-bold italic text-foreground">...</h1>
    <p className="mt-2 text-sm text-fg-muted">...</p>
    {/* Suspense com SignInForm ou SignUpForm — ver instruções abaixo */}
  </div>
</main>
```

### Tratamento do `<Suspense>` (signin/signup)

**Manter o `<Suspense>` wrapper** — é necessário para `useSearchParams` em client components.
Substituir o fallback `bg-[var(--all-black)]` por:

```tsx
<Suspense
  fallback={
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  }
>
  {/* formulário */}
</Suspense>
```

**NÃO alterar** os componentes `SignInForm` e `SignUpForm` internamente — apenas o `page.tsx` wrapper.
**Remover** `CortesGallerySection` e `ReviewPublic` das páginas auth — eram placeholders.

### Páginas simples (error, verify-email, auth-required)

```tsx
<main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
  <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80">
    <ArrowLeft className="h-4 w-4" /> Voltar para o início
  </Link>
  <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 text-center">
    <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent">
      <Icon className="h-6 w-6" />
    </div>
    <h1 className="font-display text-2xl font-bold italic text-foreground">Título</h1>
    <p className="mt-3 text-sm leading-relaxed text-fg-muted">Subtítulo</p>
    {/* CTA */}
  </div>
</main>
```

### Tratamento especial: `/auth/thank-you` (client component complexo)

Esta página tem lógica client-side própria: `useSearchParams`, `useRouter`, `useState`, `useEffect`, fetch para `/api/auth/verify-email`.

**Instruções:**
- Manter a função `ThankYouContent()` e toda sua lógica intacta (`resendVerificationEmail`, `goToLogin`, estados React)
- Manter o `<Suspense>` com `<ThankYouContent />` como único filho
- Redesenhar apenas o JSX visual dentro de `ThankYouContent`:
  - Substituir `bg-[var(--all-black)]` → `bg-background`
  - Substituir `Card` com `border-gray-600 bg-[var(--card-product)]` → `rounded-2xl border border-border bg-surface-card`
  - Substituir ícone `bg-green-500/10 text-green-400` → `bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]`
  - Substituir info box `border-blue-500/20 bg-blue-500/10 text-blue-400` → `rounded-xl border border-border bg-surface-1`
  - Bullets numerados: usar `rounded-full bg-accent text-on-accent` para os números (1, 2, 3)
  - `text-gray-400` → `text-fg-muted`; `text-white` → `text-foreground`
  - Substituir botão `bg-[var(--button-primary)]` → `gold-shimmer bg-accent text-on-accent rounded-xl`
  - Substituir botão outline `border-gray-600 bg-[var(--card-product)]` → `border border-border hover:border-accent hover:text-accent rounded-xl`
- Substituir o fallback do Suspense externo pelo spinner padrão (ver acima)

---

## Domínio 2 — Dashboard

### Páginas
- `/dashboard` → `src/app/dashboard/page.tsx`
- `/dashboard/barber` → `src/app/dashboard/barber/page.tsx`
- `/dashboard/admin` → `src/app/dashboard/admin/page.tsx`
- `/dashboard/admin/users` → `src/app/dashboard/admin/users/page.tsx`
- `/dashboard/admin/users/[id]` → `src/app/dashboard/admin/users/[id]/page.tsx`
- `/dashboard/admin/barbers` → `src/app/dashboard/admin/barbers/page.tsx`
- `/dashboard/admin/reports` → `src/app/dashboard/admin/reports/page.tsx`
- `/dashboard/admin/services` → `src/app/dashboard/admin/services/page.tsx`
- `/dashboard/admin/services/new` → `src/app/dashboard/admin/services/new/page.tsx`
- `/dashboard/admin/services/[id]/edit` → `src/app/dashboard/admin/services/[id]/edit/page.tsx`
- `/dashboard/admin/promotions` → `src/app/dashboard/admin/promotions/page.tsx`
- `/dashboard/admin/promotions/new` → `src/app/dashboard/admin/promotions/new/page.tsx`
- `/dashboard/admin/promotions/[id]/edit` → `src/app/dashboard/admin/promotions/[id]/edit/page.tsx`

### Posicionamento do `RealtimeRefreshBridge`

**Crítico:** Manter `<RealtimeRefreshBridge events={[...]} />` como **primeiro filho do `<main>`**, antes do `PageHero`, sem alterações nos eventos:

```tsx
<main className="flex min-h-screen flex-col bg-background text-foreground">
  <RealtimeRefreshBridge events={["appointment:changed", "review:updated", "analytics:updated"]} />
  <PageHero ... />
  ...
</main>
```

### Layout dashboard cliente (`/dashboard`)

```
<main>
  <RealtimeRefreshBridge />  ← SEMPRE PRIMEIRO
  <PageHero>
    badge: role-based ("Cliente" | "Barbeiro")
    title: "Olá, {nome}"
    subtitle: role-based description
  </PageHero>

  <section bg-background py-12>
    Grid 2x2 → 4 KPI cards (Agendamentos, Avaliações, Perfil, Galeria/Portfólio)
    Cada card: rounded-2xl border bg-surface-card p-6 card-hover
    Link interno como card inteiro com CTA accent no rodapé

  <section bg-surface-1 py-12>
    SectionHeader "Avaliações Recentes"
    ReviewsList em container rounded-2xl border bg-surface-card

  <section bg-background py-12> (condicional isBarber)
    KPI de desempenho (métricas do barbeiro)
    Ações rápidas como cards
```

### Layout dashboard admin

```
<main>
  <RealtimeRefreshBridge />  ← SEMPRE PRIMEIRO
  <PageHero>
    badge: "Administrador"
    title: "Painel BarberKings"
    subtitle: "Gestão completa da plataforma"
  </PageHero>

  <section bg-background py-12>
    4 KPI cards (Usuários, Reviews, Atividade, Receita)
    Padrão KPI card: rounded-2xl border bg-surface-card p-6
    Valores: font-display text-4xl font-bold italic text-accent
    Sub-items: text-sm text-fg-muted (sem emojis — usar ícones lucide)

  <section bg-surface-1 py-12>
    Tabs (design system):
      rounded-2xl border border-border bg-surface-card p-1
      data-[state=active]:bg-accent data-[state=active]:text-on-accent
    Visão Geral | Usuários | Avaliações | Serviços | Sistema

    Conteúdo das tabs:
      Listas em rounded-2xl border bg-surface-card
      Sem border-l-4 colorida
      Top barbeiros: badge de posição em rounded-full bg-[hsl(var(--accent)/0.1)] text-accent
      Barras de progresso: bg-border → bg-accent (substituir bg-gray-200 → bg-yellow-500)
```

### Restrições importantes

- Manter todos os `server actions`, `getServerSession`, `redirect`, métricas e lógica
- Manter `RealtimeRefreshBridge` na posição correta (primeiro filho do `<main>`)
- Substituir emojis (👥, ✂️, 🛡️) por ícones Lucide React correspondentes
- Eliminar todas as cores hardcoded (`text-blue-600`, `text-yellow-600`, `bg-blue-50`, `border-l-blue-500`, etc.)

---

## Domínio 3 — Profile

### Páginas
- `/profile` → `src/app/profile/page.tsx`
- `/profile/settings` → `src/app/profile/settings/page.tsx`
- `/profile/social` → `src/app/profile/social/page.tsx`
- `/profile/social/requests` → `src/app/profile/social/requests/page.tsx`
- `/profile/notifications` → `src/app/profile/notifications/page.tsx`
- `/profile/change-password` → `src/app/profile/change-password/page.tsx`

### Migração SCSS → Tailwind (perfil principal)

O arquivo `src/app/profile/page.module.scss` define as seguintes classes com seus equivalentes Tailwind:

| Classe SCSS | Equivalente Tailwind |
|-------------|---------------------|
| `.profileHeader` | `grain-overlay relative overflow-hidden bg-surface-1 py-12` |
| `.profileHeader__avatar::after` (gradient) | Substituir por `ring-2 ring-[hsl(var(--accent)/0.4)] ring-offset-2 ring-offset-surface-1` no `UserAvatar` |
| `.profileHeader__name` | `font-display text-3xl font-bold italic text-foreground` |
| `.profileHeader__email` | `text-sm text-fg-muted` |
| `.profileHeader__editButton` | Usar botão outline padrão: `inline-flex rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent hover:text-accent` |
| `.profileHeader__editButton_logout` | Usar botão destructive padrão (ver padrões de botão) |
| `.profileContent__menuItem` | `card-hover rounded-2xl border border-border bg-surface-card p-4 transition-all duration-300 hover:border-[hsl(var(--accent)/0.3)]` |
| `.profileContent__menuItem__icon` | `inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent` |
| `.profileContent__menuItem__arrow` | `text-fg-subtle` (usar `ChevronRight` do Lucide) |
| `.profileContent__accountInfo` | `rounded-2xl border border-border bg-surface-1 p-5` |

**Após migração:** Remover import de `styles from "@/app/profile/page.module.scss"` e remover todas as referências `styles.*` do JSX. O arquivo `page.module.scss` pode ser deletado.

### Layout perfil principal

```tsx
<div className="flex min-h-screen flex-col bg-background text-foreground">
  {/* Hero section — substituir SCSS gradient */}
  <div className="grain-overlay relative overflow-hidden bg-surface-1 py-12 text-center">
    <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.07)] blur-[90px]" />
    {/* Avatar com ring accent */}
    <div className="relative inline-block">
      <UserAvatar ... className="h-24 w-24 ring-2 ring-[hsl(var(--accent)/0.4)] ring-offset-2 ring-offset-surface-1" />
      <button onClick={() => setIsPhotoUploadOpen(true)}
        className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-all hover:bg-accent/90">
        <Camera className="h-4 w-4" />
      </button>
    </div>
    <h1 className="mt-4 font-display text-3xl font-bold italic text-foreground">{user.name}</h1>
    <p className="mt-1 text-sm text-fg-muted">{user.email}</p>
    <div className="mt-5 flex items-center justify-center gap-3">
      <button onClick={() => setIsEditModalOpen(true)}
        className="inline-flex rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent hover:text-accent">
        Editar Perfil
      </button>
      <button onClick={() => signOut(...)}
        className="inline-flex rounded-xl border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-[hsl(var(--destructive)/0.15)]">
        Sair da Conta
      </button>
    </div>
  </div>

  {/* Menu items */}
  <div className="container mx-auto px-4 py-8">
    <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-fg-subtle">Configurações</h2>
    <div className="space-y-3">
      {/* Cada item: card-hover rounded-2xl border bg-surface-card */}
      {/* ícone accent + label + ChevronRight */}
    </div>

    {/* Informações da conta */}
    <div className="mt-6 rounded-2xl border border-border bg-surface-1 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-subtle mb-4">Informações da Conta</p>
      {/* itens em flex justify-between text-sm */}
    </div>
  </div>

  {/* Modais — manter intactos */}
  <EditProfileModal ... />
  {/* Modal upload foto — manter intacto */}
</div>
```

### Restrições importantes

- Manter `useAuth`, `EditProfileModal`, `ProfileUploadSimple` completamente funcionais
- Manter `signOut`, `signIn` callbacks e `useRouter`
- Remover import do SCSS e todas as referências `styles.*`
- Substituir ícone de câmera inline SVG por `<Camera className="h-4 w-4" />` do Lucide
- Manter `BottomNavigation` se presente, apenas remover classes hardcoded
- Manter navegação mobile (`navigationItems`, `handleNavigation`)

---

## Domínio 4 — Legal + Serviços

### Páginas
- `/legal/terms` → `src/app/legal/terms/page.tsx`
- `/legal/privacy` → `src/app/legal/privacy/page.tsx`
- `/legal/cookies` → `src/app/legal/cookies/page.tsx`
- `/services/[id]` → `src/app/services/[id]/page.tsx`

### Layout legal

```tsx
<main className="flex min-h-screen flex-col bg-background text-foreground">
  <PageHero
    badge="Legal" {/* ou "Privacidade" | "Cookies" */}
    title="Termos de Uso"
    subtitle="..."
    actions={[{ label: "Voltar para a Home", href: "/" }]}
  />

  <section className="bg-surface-1 py-16">
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface-card p-8">
        {/* Seções de conteúdo com h2 italic + p text-fg-muted */}
        {/* Links: text-accent hover:text-accent/80 */}
        {/* Links entre páginas legais no rodapé do card */}
      </div>
    </div>
  </section>
</main>
```

### Layout service detail (`/services/[id]`)

**Importante:** Ler o arquivo atual ANTES de redesenhar. Preservar o mecanismo de fetch de dados existente. Se o arquivo não tiver fetch implementado, usar dados estáticos de placeholder.

```
PageHero com dados do serviço (nome, badge de categoria)
KPI cards: duração, preço, disponibilidade
Seção de descrição detalhada
CTA: gold-shimmer bg-accent rounded-xl "Agendar este serviço"
```

---

## Domínio 5 — Chat + Scheduling

### Páginas
- `/chat` → `src/app/chat/page.tsx`
- `/chat/[conversationId]` → `src/app/chat/[conversationId]/page.tsx`
- `/scheduling` → `src/app/scheduling/page.tsx`
- `/scheduling/manage` → `src/app/scheduling/manage/page.tsx`

### Wrapper pattern (para `/chat` e `/scheduling`)

Estas páginas delegam o conteúdo para componentes existentes que **não devem ser alterados internamente**.

```tsx
// /chat/page.tsx
<main className="flex min-h-screen flex-col bg-background text-foreground">
  <PageHero
    badge="Mensagens"
    title="Suas Conversas"
    subtitle="Fale com a equipe e acompanhe atendimentos em tempo real."
    className="py-10 lg:py-14"
  />
  <section className="flex-1 container mx-auto px-4 py-6">
    <ChatList ... />  {/* manter props intactas */}
  </section>
</main>

// /scheduling/page.tsx
<main className="flex min-h-screen flex-col bg-background text-foreground">
  <PageHero
    badge="Agendamentos"
    title="Novo Agendamento"
    subtitle="Escolha o serviço, barbeiro e horário ideal para você."
    className="py-10 lg:py-14"
  />
  <section className="flex-1">
    <SchedulingClient ... />  {/* manter props intactas */}
  </section>
</main>

// /scheduling/manage/page.tsx
<main className="flex min-h-screen flex-col bg-background text-foreground">
  <PageHero
    badge="Agenda"
    title="Meus Agendamentos"
    subtitle="Visualize e gerencie seus horários marcados."
    className="py-10 lg:py-14"
  />
  <section className="container mx-auto px-4 py-8">
    {/* componente de gestão existente */}
  </section>
</main>
```

### Exceção: `/chat/[conversationId]` — sem PageHero

A UI de chat de conversa individual precisa de altura total para o layout de mensagens. **Não adicionar PageHero**.

```tsx
// /chat/[conversationId]/page.tsx
<main className="flex h-screen flex-col bg-background text-foreground">
  {/* Componente de chat existente — ocupa toda a altura */}
  <ChatConversation ... />
</main>
```

Ajustar apenas o container wrapper — não alterar o componente de chat interno.

### Restrições importantes

- NÃO alterar `ChatList`, `SchedulingClient`, `ChatConversation` ou seus componentes internos
- `/chat/[id]` — sem PageHero, container full-height
- Manter todos os `server actions` e `redirect` intactos
- Manter `getServerSession` e lógica de autenticação

---

## Arquivos de referência (ler antes de codificar)

- `src/components/home/HeroSearch.tsx` — padrão de hero atmosférico
- `src/components/shared/PageHero.tsx` — componente PageHero (props e estrutura)
- `src/components/shared/SectionHeader.tsx` — componente SectionHeader
- `src/app/about/page.tsx` — exemplo de página pública redesenhada
- `src/app/salons/page.tsx` — exemplo com PageHero + grid de cards
- `src/app/reviews/page.tsx` — exemplo com tabs no design system
- `src/app/globals.css` — todos os tokens CSS disponíveis
- `src/app/support/page.tsx` — exemplo com FAQ e seção de CTA no rodapé

---

## Checklist por subagente

Antes de finalizar, verificar:
- [ ] Nenhuma cor hardcoded (`text-gray-*`, `bg-blue-*`, `text-white` fora de botões accent)
- [ ] Nenhum emoji em UI
- [ ] Todos os tokens CSS são do design system (`bg-surface-1`, `text-fg-muted`, etc.)
- [ ] `font-display font-bold italic` nos títulos
- [ ] Cards usam `rounded-2xl border border-border bg-surface-card`
- [ ] Botões primários usam `gold-shimmer bg-accent text-on-accent rounded-xl`
- [ ] Lógica de negócio, server actions e componentes funcionais intactos
- [ ] Imports não utilizados removidos
