# Routes Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar todas as páginas da aplicação (exceto Home e páginas já concluídas) para seguir o design system premium da Home — tokens CSS, tipografia `font-display italic`, cards `rounded-2xl`, accent dourado, sem cores hardcoded.

**Architecture:** 5 tarefas paralelas e independentes, uma por domínio (Auth, Dashboard, Profile, Legal+Services, Chat+Scheduling). Cada tarefa redesenha apenas o visual dos `page.tsx`, preservando toda a lógica de negócio, server actions, hooks e componentes funcionais existentes.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui (Radix), Lucide React, NextAuth.js v4

**Spec:** `docs/superpowers/specs/2026-03-22-routes-redesign-design.md`

---

## Referência rápida de design system

> Leia o spec completo antes de começar. Aqui está o resumo para consulta rápida.

**Tokens obrigatórios:** `bg-background`, `bg-surface-1`, `bg-surface-card`, `text-foreground`, `text-fg-muted`, `text-fg-subtle`, `text-accent`, `border-border`, `hsl(var(--accent))`, `hsl(var(--accent)/0.1)`

**Tipografia:** `font-display font-bold italic text-foreground` para títulos

**Card padrão:** `card-hover rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300`

**KPI card:** label `text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle` + valor `font-display text-4xl font-bold italic text-accent`

**Botão primário:** `gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90`

**Botão outline:** `inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent`

**Tabs:** `TabsList` com `rounded-2xl border border-border bg-surface-card p-1` e `TabsTrigger` com `data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none`

**Input:** `h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]`

**Spinner:** `mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent`

**NUNCA usar:** cores hardcoded (`text-gray-600`, `bg-blue-50`, `text-blue-600`, etc.), emojis em UI, `var(--all-black)`, `var(--card-product)`, SCSS modules novos, `border-l-4 border-l-{color}`

**Arquivos de referência:** `src/app/about/page.tsx`, `src/app/salons/page.tsx`, `src/app/reviews/page.tsx`, `src/components/shared/PageHero.tsx`, `src/app/globals.css`

---

## Task 1: Domínio Auth

**Arquivos a modificar:**
- `src/app/auth/signin/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/app/auth/error/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/app/auth/thank-you/page.tsx`
- `src/app/auth/verify-email/page.tsx`
- `src/app/auth-required/page.tsx`

**Arquivos a NÃO modificar:** `SignInForm`, `SignUpForm`, `ErrorContent`, `ResetPasswordForm`, `AuthWarning` e qualquer componente em subpastas `components/`

- [ ] **Step 1: Ler todos os arquivos do domínio**

```bash
# Ler para entender o estado atual antes de qualquer edição
cat src/app/auth/signin/page.tsx
cat src/app/auth/signup/page.tsx
cat src/app/auth/error/page.tsx
cat src/app/auth/reset-password/page.tsx
cat src/app/auth/thank-you/page.tsx
cat src/app/auth/verify-email/page.tsx
cat src/app/auth-required/page.tsx
```

- [ ] **Step 2: Redesenhar `/auth/signin/page.tsx`**

Substituir o wrapper atual pelo layout split-screen. O componente `<SignInForm />` deve ser preservado intacto dentro do `<Suspense>`.

```tsx
import { Suspense } from "react";
import SignInForm from "./components/SignInForm";
import Link from "next/link";
import { ArrowLeft, Scissors, Star, Users } from "lucide-react";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <main className="flex min-h-screen bg-background text-foreground">
        {/* Lado esquerdo — apenas desktop */}
        <div className="grain-overlay hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-1 p-12">
          <div className="font-display text-3xl font-bold italic text-foreground">
            Barber<span className="text-accent">Kings</span>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-4xl font-bold italic text-foreground">
                A experiência premium que você merece
              </h2>
              <p className="mt-4 text-base leading-relaxed text-fg-muted">
                Agende com precisão, acompanhe em tempo real e eleve seu ritual de grooming.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Scissors, text: "Barbeiros certificados e experientes" },
                { icon: Star, text: "Avaliações reais da comunidade" },
                { icon: Users, text: "Agendamento fácil em poucos cliques" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-fg-muted">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-[hsl(var(--accent)/0.4)]" />
            <span className="text-xs text-fg-subtle">BarberKings · 2026</span>
          </div>
        </div>

        {/* Lado direito — formulário */}
        <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Entrar
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold italic text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Acesse sua conta para gerenciar agendamentos e avaliações.
            </p>
            <div className="mt-8">
              <SignInForm />
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
}
```

- [ ] **Step 3: Redesenhar `/auth/signup/page.tsx`**

Mesmo padrão split-screen, ajustando textos para cadastro. Preservar `<SignUpForm />` intacto.

```tsx
import { Suspense } from "react";
import SignUpForm from "./components/SignUpForm";
import Link from "next/link";
import { ArrowLeft, Scissors, Star, Users } from "lucide-react";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <main className="flex min-h-screen bg-background text-foreground">
        {/* Lado esquerdo — apenas desktop */}
        <div className="grain-overlay hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-1 p-12">
          <div className="font-display text-3xl font-bold italic text-foreground">
            Barber<span className="text-accent">Kings</span>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-4xl font-bold italic text-foreground">
                Faça parte da comunidade premium
              </h2>
              <p className="mt-4 text-base leading-relaxed text-fg-muted">
                Crie sua conta e tenha acesso à melhor experiência de barbearia da cidade.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Scissors, text: "Acesso a barbeiros especializados" },
                { icon: Star, text: "Histórico completo de atendimentos" },
                { icon: Users, text: "Comunidade exclusiva de clientes" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-fg-muted">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-[hsl(var(--accent)/0.4)]" />
            <span className="text-xs text-fg-subtle">BarberKings · 2026</span>
          </div>
        </div>

        {/* Lado direito — formulário */}
        <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Cadastro
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold italic text-foreground">
              Crie sua conta
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Preencha os dados abaixo para começar a usar a plataforma.
            </p>
            <div className="mt-8">
              <SignUpForm />
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
}
```

- [ ] **Step 4: Redesenhar `/auth/error/page.tsx`**

Substituir fallback `var(--all-black)` por spinner padrão. Manter `<ErrorContent />` intacto.

```tsx
import { Suspense } from "react";
import ErrorContent from "./components/ErrorContent";

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
```

> Nota: O componente `ErrorContent` interno já pode ter estilos próprios — verificar se ele também usa `var(--all-black)`. Se sim, ler e redesenhar seguindo o padrão do card simples (ver Step 6).

- [ ] **Step 5: Redesenhar `/auth/reset-password/page.tsx`**

Mesmo padrão do Step 4: substituir fallback, manter `<ResetPasswordForm />` intacto.

```tsx
import { Suspense } from "react";
import ResetPasswordForm from "./components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
```

- [ ] **Step 6: Redesenhar `/auth/thank-you/page.tsx`**

**CRÍTICO:** Este arquivo começa com `"use client"` — manter essa diretiva na primeira linha. É um page component client-side completo, NÃO um Server Component com wrapper. Não criar um servidor que envolva um cliente.

Este arquivo tem lógica client-side própria: `useSearchParams`, `useRouter`, `useState`, `useEffect`, fetch para `/api/auth/verify-email`. Manter toda a lógica intacta — redesenhar apenas o JSX visual dentro de `ThankYouContent`.

Substituições visuais:
- `bg-[var(--all-black)]` → `bg-background`
- Card `border-gray-600 bg-[var(--card-product)]` → `rounded-2xl border border-border bg-surface-card`
- Ícone `bg-green-500/10 text-green-400` → `bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]`
- Info box `border-blue-500/20 bg-blue-500/10 text-blue-400` → `rounded-xl border border-border bg-surface-1 text-fg-muted`
- Bullets 1/2/3: `rounded-full bg-accent text-on-accent text-xs font-semibold`
- `text-gray-400` → `text-fg-muted`; `text-white` → `text-foreground`
- Botão principal `bg-[var(--button-primary)]` → `gold-shimmer bg-accent text-on-accent rounded-xl w-full`
- Botão outline → `border border-border hover:border-accent hover:text-accent rounded-xl w-full`
- Fallback externo do `<Suspense>` → spinner padrão

Manter: `ThankYouContent`, `resendVerificationEmail`, `goToLogin`, todos os estados React, o `<Suspense>` wrapper, e o fetch para `/api/auth/verify-email`.

- [ ] **Step 7: Redesenhar `/auth/verify-email/page.tsx`**

**CRÍTICO:** Este arquivo começa com `"use client"` — manter essa diretiva na primeira linha. É um page component client-side completo, NÃO um Server Component com wrapper. Não criar um servidor que envolva um cliente.

Este arquivo também tem lógica client-side complexa: `verifyEmail`, `resendVerificationEmail`, `verificationStatus` state, `useSearchParams`, `useRouter`, fetch API. Manter toda a lógica.

Substituições visuais em todos os estados de render (`isVerifying`, `success`, `error`, default):
- `bg-[var(--all-black)]` → `bg-background`
- `Card` com `border-gray-600 bg-[var(--card-product)]` → `rounded-2xl border border-border bg-surface-card`
- `CardTitle text-center text-white` → `font-display text-2xl font-bold italic text-foreground text-center`
- `CardDescription text-center text-gray-400` → `text-sm text-fg-muted text-center`
- `text-green-400` (success) → `text-[hsl(var(--success))]`
- `text-red-400` (error) → `text-destructive`
- Spinner `border-b-2 border-[var(--text-price)]` → `border-2 border-border border-t-accent`
- Input `border-gray-600 bg-[var(--card-product)] text-white placeholder-gray-400` → input padrão do design system
- Botões → padrões primary e outline do design system
- Fallback `<Suspense fallback={<div>Carregando...</div>}>` → spinner padrão

Manter: `VerifyEmailContent`, toda lógica de estados, `verifyEmail`, `resendVerificationEmail`, `useCallback`, `useEffect`, fetch e router.

- [ ] **Step 8: Redesenhar `/auth-required/page.tsx`**

Substituir o spinner do fallback e manter `<AuthWarning />` intacto.

```tsx
import { Suspense } from 'react';
import AuthWarning from '@/components/AuthWarning';

interface AuthRequiredPageProps {
  searchParams: Promise<{
    target?: string;
    redirect?: string;
  }>;
}

export default async function AuthRequiredPage({ searchParams }: AuthRequiredPageProps) {
  const params = await searchParams;
  const targetRoute = params.target;
  const redirectUrl = params.redirect || '/auth/signin';

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    }>
      <AuthWarning
        targetRoute={targetRoute}
        redirectUrl={redirectUrl}
        countdown={10}
        allowCancel={true}
      />
    </Suspense>
  );
}
```

> Nota: Verificar se `AuthWarning` internamente usa estilos hardcoded. Se sim, redesenhar seguindo padrão do card simples.

- [ ] **Step 9: Verificar componentes internos de auth**

Ler os componentes referenciados para verificar se usam `var(--all-black)` ou cores hardcoded:
- `src/app/auth/error/components/ErrorContent.tsx`
- `src/app/auth/signin/components/SignInForm.tsx` (NÃO alterar lógica — apenas verificar)
- `src/components/AuthWarning.tsx`

Se `ErrorContent` ou `AuthWarning` usarem `var(--all-black)`, redesenhar apenas o visual seguindo o padrão de card simples centralizado:

```tsx
// Padrão de card simples para páginas auth standalone
<main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
  <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 text-center">
    <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent">
      <Icon className="h-6 w-6" />
    </div>
    <h1 className="font-display text-2xl font-bold italic text-foreground">Título</h1>
    <p className="mt-3 text-sm leading-relaxed text-fg-muted">Descrição</p>
    <div className="mt-6 space-y-3">
      {/* CTAs */}
    </div>
  </div>
</main>
```

- [ ] **Step 10: Validar e commitar**

```bash
npm run validate
```

Esperado: sem erros de lint ou TypeScript.

```bash
git add src/app/auth/ src/app/auth-required/
git commit -m "feat: redesign auth pages with premium split-screen layout"
```

---

## Task 2: Domínio Dashboard

**Arquivos a modificar:**
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/barber/page.tsx`
- `src/app/dashboard/admin/page.tsx`
- `src/app/dashboard/admin/users/page.tsx`
- `src/app/dashboard/admin/users/[id]/page.tsx`
- `src/app/dashboard/admin/barbers/page.tsx`
- `src/app/dashboard/admin/reports/page.tsx`
- `src/app/dashboard/admin/services/page.tsx`
- `src/app/dashboard/admin/services/new/page.tsx`
- `src/app/dashboard/admin/services/[id]/edit/page.tsx`
- `src/app/dashboard/admin/promotions/page.tsx`
- `src/app/dashboard/admin/promotions/new/page.tsx`
- `src/app/dashboard/admin/promotions/[id]/edit/page.tsx`

**Manter intactos:** `getServerSession`, `redirect`, `getDashboardMetrics`, `getAdminMetrics`, `getBarberMetrics`, `getServicesForAdmin`, `RealtimeRefreshBridge`, `ReviewsList`, `ReviewSection`, `LoadingSpinner`

- [ ] **Step 1: Ler todos os arquivos do domínio**

Ler cada arquivo para entender estado atual antes de editar.

- [ ] **Step 2: Redesenhar `/dashboard/page.tsx` (dashboard cliente)**

Regras:
- `<RealtimeRefreshBridge />` deve ser o **primeiro filho do `<main>`**, antes do `PageHero`
- Remover `mt-12 mb-16` do container raiz (o PageHero define espaçamento)
- Substituir `text-gray-600` → `text-fg-muted`
- Substituir badge de role por badge no design system
- Substituir cards `Card/CardHeader/CardTitle` por cards padrão (`rounded-2xl border border-border bg-surface-card`)
- Substituir `Button asChild` por links diretos com classes de botão
- Remover `<Separator />` — usar espaçamento entre seções
- Substituir emojis por ícones Lucide

```tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewsList } from "@/components/ReviewsList";
import { getDashboardMetrics } from "@/server/dashboardActions";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { RealtimeRefreshBridge } from "@/components/realtime/RealtimeRefreshBridge";
import Link from "next/link";
import { Calendar, Star, User, Scissors, Heart, Eye, Clock, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const userRole = session.user.role;
  const isBarber = userRole === "BARBER";
  const isAdmin = userRole === "ADMIN";
  if (isAdmin) redirect("/dashboard/admin");

  const metricsResult = await getDashboardMetrics(session.user.id);
  const metrics = metricsResult.success ? metricsResult.data : null;

  const quickActions = [
    {
      icon: Calendar,
      title: "Agendamentos",
      description: isBarber ? "Próximos atendimentos" : "Seus próximos horários",
      href: "/scheduling/manage",
      cta: "Ver Agendamentos",
    },
    {
      icon: Star,
      title: "Avaliações",
      description: isBarber ? "Reviews dos seus serviços" : "Suas avaliações",
      href: "/reviews",
      cta: "Ver Reviews",
    },
    {
      icon: User,
      title: "Perfil",
      description: "Configurações da conta",
      href: "/profile",
      cta: "Editar Perfil",
    },
    {
      icon: isBarber ? Scissors : Heart,
      title: isBarber ? "Portfólio" : "Galeria",
      description: isBarber ? "Seus trabalhos" : "Trabalhos da barbearia",
      href: "/gallery",
      cta: "Ver Galeria",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <RealtimeRefreshBridge events={["appointment:changed", "review:updated", "analytics:updated"]} />
      <PageHero
        badge={isBarber ? "Barbeiro" : "Cliente"}
        title={`Olá, ${session.user.name?.split(" ")[0]}`}
        subtitle={isBarber ? "Gerencie seus clientes, serviços e performance." : "Acompanhe seus agendamentos e avaliações."}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <article key={action.title} className="card-hover group rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.16)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-bold italic text-foreground">{action.title}</h2>
                  <p className="mt-2 text-sm text-fg-muted">{action.description}</p>
                  <Link
                    href={action.href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                  >
                    {action.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {metrics && isBarber && (
        <section className="bg-surface-1 py-12">
          <div className="container mx-auto px-4">
            <SectionHeader title="Performance do Mês" subtitle="Métricas atualizadas em tempo real." centered={false} className="mb-8" />
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { label: "Clientes Este Mês", value: (metrics as any)?.monthlyClients ?? 0 },
                { label: "Avaliação Média", value: (metrics as any)?.averageRating?.toFixed(1) ?? "0.0" },
                { label: "Total de Reviews", value: (metrics as any)?.totalReviews ?? 0 },
              ].map((kpi) => (
                <article key={kpi.label} className="card-hover rounded-2xl border border-border bg-surface-card p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">{kpi.label}</p>
                  <p className="mt-3 font-display text-4xl font-bold italic text-accent">{kpi.value}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={isBarber ? "Reviews Recebidas" : "Suas Últimas Avaliações"}
            subtitle="Histórico atualizado dos feedbacks mais recentes."
            centered={false}
            className="mb-8"
          />
          <div className="rounded-2xl border border-border bg-surface-card">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
              </div>
            }>
              <ReviewsList
                userId={isBarber ? undefined : session.user.id}
                barberId={isBarber ? session.user.id : undefined}
                showStats={false}
                showActions={false}
                limit={3}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Redesenhar `/dashboard/barber/page.tsx`**

Regras:
- Remover `mt-12 mb-16` do container
- Substituir header hardcoded por `PageHero` com badge "Barbeiro"
- Substituir cards de métricas por KPI cards do design system
- Substituir tabs por design system (accent ativo)
- Substituir `text-gray-600`, `text-gray-500` → `text-fg-muted`
- Substituir emojis em badges (📅, ⭐, 👥, 💰, 📝, 🏆, 📊) por ícones Lucide
- Substituir progress bars `bg-gray-200 → bg-border`, `bg-blue-600/green-600/purple-600 → bg-accent`
- Substituir conquistas `bg-yellow-50/blue-50/green-50 border-yellow-200/blue-200/green-200` → `bg-surface-1 border-border`
- Substituir Card footer com emoji → seção CTA accent
- **CRÍTICO:** Adicionar `<RealtimeRefreshBridge events={['appointment:changed', 'review:updated', 'analytics:updated']} />` como **primeiro filho do `<main>`**, antes do `PageHero` (igual ao admin dashboard)
- Manter toda a lógica: `getBarberMetrics`, `ratingDistribution`, `ReviewsList`, `ReviewSection`

- [ ] **Step 4: Redesenhar `/dashboard/admin/page.tsx`**

Regras:
- Adicionar `<RealtimeRefreshBridge />` como primeiro filho do `<main>`
- Substituir header admin por `PageHero` com badge "Administrador"
- KPI cards: remover `border-l-4 border-l-blue-500/yellow-500/green-500/purple-500`, usar padrão KPI card
- Substituir emojis nos sub-items por ícones Lucide ou texto simples
- Substituir tabs `data-[state=active]:bg-purple-600` → `data-[state=active]:bg-accent data-[state=active]:text-on-accent`
- Substituir barras de distribuição `bg-gray-200 → bg-border`, `bg-yellow-500 → bg-accent`
- Substituir badge `variant="destructive"` por badge no design system (rounded-full accent)
- Substituir lista de serviços `hover:bg-accent transition-colors` por `hover:bg-surface-1`
- Substituir badge de serviço `bg-green-500` por `bg-[hsl(var(--success))]`
- Substituir botões `bg-purple-600 hover:bg-purple-700` → `gold-shimmer bg-accent hover:bg-accent/90`
- Remover `<Separator />` — usar espaçamento
- Manter toda a lógica: `getAdminMetrics`, `getServicesForAdmin`, métricas, `RealtimeRefreshBridge`

- [ ] **Step 5: Redesenhar sub-páginas admin**

Para cada uma das páginas abaixo, **ler o arquivo atual primeiro**, identificar todos os server actions, componentes funcionais e dados que são passados como props, e preservá-los integralmente:
- `src/app/dashboard/admin/users/page.tsx` — tabela/lista de usuários; manter: `getServerSession`, `redirect`, query Prisma de usuários e props passadas para componentes de lista
- `src/app/dashboard/admin/users/[id]/page.tsx` — detalhes de usuário; manter: `getServerSession`, `redirect`, query Prisma por `params.id`, todos os dados do usuário passados para componentes
- `src/app/dashboard/admin/barbers/page.tsx` — lista de barbeiros; manter: `getServerSession`, `redirect`, query Prisma e todos os dados passados
- `src/app/dashboard/admin/reports/page.tsx` — relatórios; manter: `getServerSession`, `redirect`, todas as queries de métricas/agregações e componentes de gráfico/tabela existentes
- `src/app/dashboard/admin/services/page.tsx` — lista de serviços; manter: `getServerSession`, `redirect`, query de serviços, todas as actions de delete/toggle/status
- `src/app/dashboard/admin/services/new/page.tsx` — formulário; manter: `getServerSession`, `redirect`, server action de criação de serviço e todos seus argumentos
- `src/app/dashboard/admin/services/[id]/edit/page.tsx` — formulário edição; manter: `getServerSession`, `redirect`, query de serviço por `params.id`, server action de update
- `src/app/dashboard/admin/promotions/page.tsx` — lista de promoções; manter: `getServerSession`, `redirect`, query de promoções
- `src/app/dashboard/admin/promotions/new/page.tsx` — formulário; manter: `getServerSession`, `redirect`, server action de criação de promoção
- `src/app/dashboard/admin/promotions/[id]/edit/page.tsx` — formulário edição; manter: `getServerSession`, `redirect`, query de promoção por `params.id`, server action de update

Para páginas de formulário (new/edit), usar:
- Inputs padrão do design system
- Botões primários com `gold-shimmer bg-accent`
- Container `rounded-2xl border bg-surface-card p-6`
- PageHero com badge + título do formulário

Para páginas de lista:
- PageHero com badge + título
- Tabela em container `rounded-2xl border bg-surface-card`
- Cabeçalhos de tabela `text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle`
- Linhas com `border-border` e `hover:bg-surface-1`

- [ ] **Step 6: Validar e commitar**

```bash
npm run validate
```

```bash
git add src/app/dashboard/
git commit -m "feat: redesign dashboard pages with premium design system"
```

---

## Task 3: Domínio Profile

**Arquivos a modificar:**
- `src/app/profile/page.tsx`
- `src/app/profile/settings/page.tsx`
- `src/app/profile/social/page.tsx`
- `src/app/profile/social/requests/page.tsx`
- `src/app/profile/notifications/page.tsx`
- `src/app/profile/change-password/page.tsx`

**Arquivo a deletar após migração:** `src/app/profile/page.module.scss`

**Manter intactos:** `useAuth`, `EditProfileModal`, `ProfileUploadSimple`, `UserAvatar`, `BottomNavigation`, `signOut`, `signIn`, todos os hooks e callbacks

- [ ] **Step 1: Ler todos os arquivos do domínio**

```bash
cat src/app/profile/page.tsx
cat src/app/profile/page.module.scss
cat src/app/profile/settings/page.tsx
cat src/app/profile/social/page.tsx
cat src/app/profile/social/requests/page.tsx
cat src/app/profile/notifications/page.tsx
cat src/app/profile/change-password/page.tsx
```

- [ ] **Step 2: Redesenhar `/profile/page.tsx` — migração SCSS → Tailwind**

Tabela de migração:

| Classe SCSS | Substituição Tailwind |
|-------------|----------------------|
| `.profileHeader` | `grain-overlay relative overflow-hidden bg-surface-1 py-12 text-center` |
| `.profileHeader__avatar::after` | `ring-2 ring-[hsl(var(--accent)/0.4)] ring-offset-2 ring-offset-surface-1` no UserAvatar |
| `.profileHeader__name` | `font-display text-3xl font-bold italic text-foreground` |
| `.profileHeader__email` | `text-sm text-fg-muted` |
| `.profileHeader__editButton` | `inline-flex rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-all duration-300` |
| `.profileHeader__editButton_logout` | `inline-flex rounded-xl border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-[hsl(var(--destructive)/0.15)] transition-all duration-300` |
| `.profileContent__menuItem` | `card-hover rounded-2xl border border-border bg-surface-card p-4 transition-all duration-300 hover:border-[hsl(var(--accent)/0.3)]` |
| `.profileContent__menuItem__icon` | `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent` |
| `.profileContent__menuItem__arrow` | `text-fg-subtle` (usar `ChevronRight` do Lucide) |
| `.profileContent__accountInfo` | `rounded-2xl border border-border bg-surface-1 p-5` |

Depois de substituir todas as referências `styles.*`, remover o import:
```tsx
// REMOVER esta linha:
import styles from "@/app/profile/page.module.scss";
```

Estrutura do hero redesenhado:
```tsx
{/* Hero */}
<div className="grain-overlay relative overflow-hidden bg-surface-1 py-12 text-center">
  <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.07)] blur-[90px]" />
  <div className="relative inline-block">
    <UserAvatar
      src={user.image}
      name={user.name}
      email={user.email}
      size="xl"
      className="h-24 w-24 ring-2 ring-[hsl(var(--accent)/0.4)] ring-offset-2 ring-offset-surface-1"
    />
    <button
      onClick={() => setIsPhotoUploadOpen(true)}
      className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-all hover:bg-accent/90"
      title="Alterar foto de perfil"
    >
      <Camera className="h-4 w-4" />
    </button>
  </div>
  <h1 className="mt-4 font-display text-3xl font-bold italic text-foreground">
    {user.name || "Usuário"}
  </h1>
  <p className="mt-1 text-sm text-fg-muted">{user.email}</p>
  <div className="mt-5 flex items-center justify-center gap-3">
    <button
      onClick={() => setIsEditModalOpen(true)}
      className="inline-flex rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
    >
      Editar Perfil
    </button>
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex rounded-xl border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-5 py-2.5 text-sm font-semibold text-destructive transition-all duration-300 hover:bg-[hsl(var(--destructive)/0.15)]"
    >
      Sair da Conta
    </button>
  </div>
</div>
```

Menu items redesenhados:
```tsx
<div className="space-y-3">
  {menuItems.map((item) => {
    const Icon = item.icon; // usar ícones Lucide em vez de SVGs inline
    return (
      <Link key={item.label} href={item.href}
        className="card-hover flex items-center gap-4 rounded-2xl border border-border bg-surface-card p-4 transition-all duration-300 hover:border-[hsl(var(--accent)/0.3)]"
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
        <ChevronRight className="h-4 w-4 text-fg-subtle" />
      </Link>
    );
  })}
</div>
```

> Nota: Substituir os SVGs inline por ícones Lucide equivalentes: Settings (configurações), Users (social), MessageSquare (feedback), LayoutDashboard (dashboard), Gift (gift card)

- [ ] **Step 3: Deletar SCSS após confirmar que não há mais referências**

```bash
# Verificar que não há mais imports do SCSS
grep -r "page.module.scss" src/app/profile/
# Se output vazio, deletar
rm src/app/profile/page.module.scss
```

- [ ] **Step 4: Redesenhar sub-páginas de perfil**

Para cada arquivo, ler e redesenhar:

**`/profile/settings/page.tsx`:**
- PageHero com badge "Configurações" + link de voltar
- Formulário em `rounded-2xl border bg-surface-card p-6`
- Inputs padrão do design system
- Botão salvar `gold-shimmer bg-accent`

**`/profile/social/page.tsx`:**
- PageHero com badge "Social" + título "Amigos & Conexões"
- Lista de amigos em cards `rounded-2xl border bg-surface-card`
- Avatar + nome + status em cada card
- Botões de ação outline/accent

**`/profile/social/requests/page.tsx`:**
- PageHero com badge "Solicitações"
- Cards de solicitação pendente com botões aceitar/recusar
- Aceitar: `gold-shimmer bg-accent`
- Recusar: botão destructive

**`/profile/notifications/page.tsx`:**
- PageHero com badge "Notificações"
- Lista de notificações em `rounded-2xl border bg-surface-card`
- Item não lido: `bg-[hsl(var(--accent)/0.05)] border-[hsl(var(--accent)/0.2)]`

**`/profile/change-password/page.tsx`:**
- PageHero com badge "Segurança" + link de voltar
- Formulário em `rounded-2xl border bg-surface-card p-6`
- 3 inputs (senha atual, nova, confirmar)
- Botão salvar `gold-shimmer bg-accent`

Para todos: manter lógica de formulário, server actions, validações e hooks existentes.

- [ ] **Step 5: Validar e commitar**

```bash
npm run validate
```

```bash
git add src/app/profile/
git commit -m "feat: redesign profile pages, migrate SCSS to Tailwind design system"
```

---

## Task 4: Domínio Legal + Serviços

**Arquivos a modificar:**
- `src/app/legal/terms/page.tsx`
- `src/app/legal/privacy/page.tsx`
- `src/app/legal/cookies/page.tsx`
- `src/app/services/[id]/page.tsx`

- [ ] **Step 1: Ler todos os arquivos**

```bash
cat src/app/legal/terms/page.tsx
cat src/app/legal/privacy/page.tsx
cat src/app/legal/cookies/page.tsx
cat src/app/services/[id]/page.tsx
```

- [ ] **Step 2: Redesenhar `/legal/terms/page.tsx`**

```tsx
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";

export default function TermsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Legal"
        title="Termos de Uso"
        subtitle="Transparência e clareza sobre o uso da plataforma BarberKings."
        actions={[{ label: "Voltar para a Home", href: "/" }]}
      />

      <section className="bg-surface-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6">
            <article className="rounded-2xl border border-border bg-surface-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold italic text-foreground">Transparência e privacidade</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
                <p>Reservamo-nos o direito de ajustar funcionalidades e conteúdos sem aviso prévio nesta versão demonstrativa.</p>
                <p>Dados sensíveis não são coletados neste ambiente; informações exibidas podem ser fictícias.</p>
                <p>Agendamentos e pagamentos reais devem ser realizados apenas em ambientes autorizados.</p>
              </div>
            </article>

            <div className="flex flex-wrap gap-3">
              <Link href="/legal/privacy" className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80">
                Política de Privacidade
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
              <Link href="/legal/cookies" className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80">
                Política de Cookies
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Redesenhar `/legal/privacy/page.tsx` e `/legal/cookies/page.tsx`**

Seguir o mesmo padrão do Step 2, ajustando badge, título e conteúdo para cada página.

- [ ] **Step 4: Redesenhar `/services/[id]/page.tsx`**

**Importante:** Ler o arquivo atual e preservar o mecanismo de fetch de dados existente. Se não houver fetch, usar placeholders estáticos.

```tsx
// Estrutura alvo (adaptar ao mecanismo de fetch existente):
<main className="flex min-h-screen flex-col bg-background text-foreground">
  <PageHero
    badge={categoria}
    title={nome do serviço}
    subtitle={descrição}
    actions={[
      { label: "Agendar este serviço", href: "/scheduling" },
      { label: "Ver promoções", href: "/promotions", variant: "outline" },
    ]}
  />

  <section className="bg-surface-1 py-12">
    <div className="container mx-auto px-4">
      <div className="grid gap-5 sm:grid-cols-3">
        {/* KPI: Duração, Preço, Disponibilidade */}
      </div>
    </div>
  </section>
</main>
```

- [ ] **Step 5: Validar e commitar**

```bash
npm run validate
```

```bash
git add src/app/legal/ src/app/services/
git commit -m "feat: redesign legal and service detail pages with PageHero pattern"
```

---

## Task 5: Domínio Chat + Scheduling

**Arquivos a modificar:**
- `src/app/chat/page.tsx`
- `src/app/chat/[conversationId]/page.tsx`
- `src/app/scheduling/page.tsx`
- `src/app/scheduling/manage/page.tsx`

**Manter intactos:** `ChatList`, `SchedulingClient`, `AppointmentsList`, componentes de chat e scheduling

**Exceção:** `/chat/[conversationId]` — sem PageHero, container full-height

- [ ] **Step 1: Ler todos os arquivos**

```bash
cat src/app/chat/page.tsx
cat src/app/chat/[conversationId]/page.tsx
cat src/app/scheduling/page.tsx
cat src/app/scheduling/manage/page.tsx
```

- [ ] **Step 2: Redesenhar `/chat/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatList } from "@/components/chat/ChatList";
import { getUserConversations } from "@/server/chatActions";
import { PageHero } from "@/components/shared/PageHero";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const result = await getUserConversations({ page: 1, limit: 50 });
  const conversations = result.success && result.data ? result.data : [];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Mensagens"
        title="Suas Conversas"
        subtitle="Fale com a equipe e acompanhe atendimentos em tempo real."
        className="py-10 lg:py-14"
      />
      <section className="flex-1 container mx-auto px-4 py-6">
        <ChatList
          currentUserId={session.user.id}
          initialConversations={conversations as any}
        />
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Redesenhar `/chat/[conversationId]/page.tsx`**

Ler o arquivo atual. Adicionar apenas o wrapper `<main>` com `h-screen bg-background` sem PageHero. O componente de chat interno deve ocupar toda a altura disponível.

```tsx
// Estrutura alvo (manter props e lógica do componente existente):
<main className="flex h-screen flex-col bg-background text-foreground">
  {/* Componente existente de chat — preservar intacto */}
</main>
```

- [ ] **Step 4: Redesenhar `/scheduling/page.tsx`**

```tsx
import { SchedulingClient } from "@/components/scheduling/SchedulingClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createAppointment } from "@/server/appointmentActions";
import { PageHero } from "@/components/shared/PageHero";

// Interfaces (copiar exatamente do arquivo original)
interface Service {
  id: string; name: string; description: string | null;
  duration: number; price: number; active: boolean;
  createdAt: Date; updatedAt: Date;
}
interface Barber {
  id: string; name: string | null; email: string;
  image: string | null; role: string;
  createdAt: Date; updatedAt: Date;
}
interface AppointmentFormData {
  serviceId?: string; barberId?: string; date?: Date; time?: string;
}

export default async function SchedulingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  // CRÍTICO: Copiar esta função INTEIRAMENTE do arquivo original sem alterações
  const handleAppointmentSubmit = async (data: AppointmentFormData & {
    service: Service;
    barber: Barber;
  }) => {
    "use server";
    try {
      if (!data.date || !data.time || !data.serviceId || !data.barberId) {
        throw new Error("Dados incompletos para agendamento");
      }
      const [hours, minutes] = data.time.split(':').map(Number);
      const appointmentDate = new Date(data.date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      const result = await createAppointment({
        serviceId: data.serviceId,
        barberId: data.barberId,
        date: appointmentDate,
        notes: `Agendamento de ${data.service.name} com ${data.barber.name || 'barbeiro'}`,
      });
      if (result.success) { return; }
      else { throw new Error(result.error || "Erro ao criar agendamento"); }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      throw error;
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Agendamentos"
        title="Novo Agendamento"
        subtitle="Escolha o serviço, barbeiro e horário ideal para você."
        className="py-10 lg:py-14"
      />
      <section className="flex-1">
        <SchedulingClient onSubmit={handleAppointmentSubmit} />
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Redesenhar `/scheduling/manage/page.tsx`**

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAppointments } from "@/server/appointmentActions";
import { AppointmentsList } from "@/components/scheduling/AppointmentsList";
import { PageHero } from "@/components/shared/PageHero";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ManageAppointmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const appointmentsResult = await getAppointments({ page: 1, limit: 10, status: undefined });
  const appointments = appointmentsResult.success ? appointmentsResult.data : null;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Agenda"
        title="Meus Agendamentos"
        subtitle="Visualize, gerencie e cancele seus horários marcados."
        actions={[{ label: "Novo Agendamento", href: "/scheduling" }]}
      />
      <section className="container mx-auto px-4 py-10">
        <AppointmentsList
          initialAppointments={appointments?.appointments || []}
          totalCount={appointments?.pagination.total || 0}
          currentPage={appointments?.pagination.page || 1}
          totalPages={appointments?.pagination.totalPages || 1}
        />
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Validar e commitar**

```bash
npm run validate
```

```bash
git add src/app/chat/ src/app/scheduling/
git commit -m "feat: redesign chat and scheduling pages with PageHero wrapper"
```

---

## Task 6: Validação Final

**Após conclusão de todas as 5 tarefas:**

- [ ] **Step 1: Build completo**

```bash
npm run build
```

Esperado: build sem erros. Se houver erros de TypeScript, corrigir antes de prosseguir.

- [ ] **Step 2: Verificar ausência de padrões proibidos**

```bash
# Verificar cores hardcoded restantes
grep -r "text-gray-[0-9]" src/app/ --include="*.tsx" | grep -v "node_modules"
grep -r "bg-blue-" src/app/ --include="*.tsx" | grep -v "node_modules"
grep -r "var(--all-black)" src/app/ --include="*.tsx" | grep -v "node_modules"
grep -r "var(--card-product)" src/app/ --include="*.tsx" | grep -v "node_modules"
```

Esperado: output vazio ou apenas em arquivos de componentes funcionais que estavam fora do escopo.

- [ ] **Step 3: Verificar ausência de emojis**

```bash
# Verificar emojis restantes em JSX (emojis Unicode básicos)
grep -r "👥\|✂️\|🛡️\|✅\|🚀\|📅\|⭐\|💰\|📝\|🏆\|📊" src/app/ --include="*.tsx"
```

Esperado: output vazio.

- [ ] **Step 4: Commit final de validação**

```bash
git add -A
git commit -m "feat: complete routes redesign — all pages aligned with premium design system"
```

---

## Notas para execução paralela

As Tasks 1-5 são **completamente independentes** entre si — podem ser executadas em paralelo por subagentes diferentes sem conflitos de merge. Cada tarefa toca arquivos em diretórios distintos:

| Task | Diretório |
|------|-----------|
| Task 1 | `src/app/auth/`, `src/app/auth-required/` |
| Task 2 | `src/app/dashboard/` |
| Task 3 | `src/app/profile/` |
| Task 4 | `src/app/legal/`, `src/app/services/` |
| Task 5 | `src/app/chat/`, `src/app/scheduling/` |

A Task 6 (validação final) deve ser executada somente após a conclusão de todas as outras.
