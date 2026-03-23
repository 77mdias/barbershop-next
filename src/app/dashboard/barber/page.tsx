import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsList } from "@/components/ReviewsList";
import { getBarberMetrics } from "@/server/dashboardActions";
import { PageHero } from "@/components/shared/PageHero";
import { RealtimeRefreshBridge } from "@/components/realtime/RealtimeRefreshBridge";
import Link from "next/link";
import {
  Star,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  MessageSquare,
  DollarSign,
  Award,
} from "lucide-react";

export default async function BarberDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "BARBER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const metricsResult = await getBarberMetrics(session.user.id);
  const metrics = metricsResult.success ? metricsResult.data : null;

  const ratingDistribution = [5, 4, 3, 2, 1].map((score) => {
    const entry = metrics?.ratingDistribution?.find((item) => item.rating === score);
    const rawPercentage = entry?.percentage ?? 0;
    const normalizedPercentage = Math.max(0, Math.min(100, Math.round(rawPercentage)));

    return {
      rating: score,
      percentage: normalizedPercentage,
      count: entry?.count ?? 0,
    };
  });

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <RealtimeRefreshBridge
        events={["appointment:changed", "review:updated", "analytics:updated"]}
      />
      <PageHero
        badge="Barbeiro"
        title="Dashboard do Barbeiro"
        subtitle="Gerencie seus atendimentos, reviews e performance."
        actions={[{ label: "Dashboard Geral", href: "/dashboard", variant: "outline" }]}
      />

      {/* KPI Cards */}
      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                Hoje
              </p>
              <p className="mt-2 font-display text-4xl font-bold italic text-accent">--</p>
              <p className="mt-1 text-xs text-fg-muted">
                {new Date().toLocaleDateString("pt-BR")}
              </p>
            </article>

            <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                <Star className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                Avaliação
              </p>
              <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                {metrics?.averageRating?.toFixed(1) || "0.0"}
              </p>
              <p className="mt-1 text-xs text-fg-muted">Média Geral</p>
            </article>

            <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                <Users className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                Clientes
              </p>
              <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                {metrics?.totalClients || 0}
              </p>
              <p className="mt-1 text-xs text-fg-muted">Total Atendidos</p>
            </article>

            <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                Receita
              </p>
              <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                R$ {metrics?.monthlyRevenue?.toFixed(2) || "0.00"}
              </p>
              <p className="mt-1 text-xs text-fg-muted">Este Mês</p>
            </article>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-surface-1 py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="mb-8 rounded-2xl border border-border bg-surface-card p-1">
              <TabsTrigger
                value="reviews"
                className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none"
              >
                <Star className="h-4 w-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="appointments"
                className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none"
              >
                <Calendar className="h-4 w-4" />
                Agendamentos
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none"
              >
                <BarChart3 className="h-4 w-4" />
                Análises
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none"
              >
                <TrendingUp className="h-4 w-4" />
                Performance
              </TabsTrigger>
            </TabsList>

            {/* Tab: Reviews */}
            <TabsContent value="reviews" className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-3">
                <article className="card-hover rounded-2xl border border-border bg-surface-card p-6 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-display text-4xl font-bold italic text-accent">
                    {metrics?.totalReviews || 0}
                  </p>
                  <p className="mt-2 text-sm text-fg-muted">Total de Reviews</p>
                </article>

                <article className="card-hover rounded-2xl border border-border bg-surface-card p-6 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <Star className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-display text-4xl font-bold italic text-accent">
                    {metrics?.fiveStarReviews || 0}
                  </p>
                  <p className="mt-2 text-sm text-fg-muted">Reviews 5 Estrelas</p>
                </article>

                <article className="card-hover rounded-2xl border border-border bg-surface-card p-6 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-display text-4xl font-bold italic text-accent">
                    {metrics?.monthlyAverageRating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="mt-2 text-sm text-fg-muted">Média Este Mês</p>
                </article>
              </div>

              <article className="rounded-2xl border border-border bg-surface-card p-6">
                <h3 className="mb-4 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Distribuição de Notas
                </h3>
                <div className="space-y-2">
                  {ratingDistribution.map((distribution) => (
                    <div
                      key={`summary-${distribution.rating}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        {distribution.rating}
                        <Star className="h-4 w-4 text-accent" />
                      </span>
                      <span className="text-fg-muted">
                        {distribution.count} reviews · {distribution.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-border bg-surface-card">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h3 className="font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    Suas Reviews Recentes
                  </h3>
                  <Link
                    href="/reviews?view=barber"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                  >
                    Ver Todas
                  </Link>
                </div>
                <div className="p-6">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-8">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
                      </div>
                    }
                  >
                    <ReviewsList
                      barberId={session.user.id}
                      showStats={true}
                      showActions={true}
                      limit={5}
                    />
                  </Suspense>
                </div>
              </article>
            </TabsContent>

            {/* Tab: Agendamentos */}
            <TabsContent value="appointments" className="space-y-6">
              <article className="rounded-2xl border border-border bg-surface-card p-8 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.1)] text-accent">
                  <Calendar className="h-8 w-8 opacity-60" />
                </div>
                <p className="mt-4 text-fg-muted">
                  Integração com sistema de agendamentos em desenvolvimento
                </p>
                <Link
                  href="/scheduling"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                >
                  Ver Agendamentos
                </Link>
              </article>
            </TabsContent>

            {/* Tab: Análises */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <article className="rounded-2xl border border-border bg-surface-card p-6">
                  <h3 className="mb-4 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-accent" />
                    Reviews por Mês
                  </h3>
                  <div className="flex flex-col items-center justify-center py-8 text-fg-muted">
                    <BarChart3 className="h-12 w-12 opacity-40" />
                    <p className="mt-4 text-sm">Gráficos de análise em desenvolvimento</p>
                  </div>
                </article>

                <article className="rounded-2xl border border-border bg-surface-card p-6">
                  <h3 className="mb-4 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent" />
                    Distribuição de Notas
                  </h3>
                  <div className="space-y-3">
                    {ratingDistribution.map((distribution) => (
                      <div key={distribution.rating} className="flex items-center gap-3">
                        <span className="w-4 text-sm text-foreground">{distribution.rating}</span>
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <div className="flex-1 rounded-full bg-border h-2">
                          <div
                            className="h-2 rounded-full bg-accent"
                            style={{ width: `${distribution.percentage}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-sm text-fg-muted">
                          {distribution.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </TabsContent>

            {/* Tab: Performance */}
            <TabsContent value="performance" className="space-y-6">
              <article className="rounded-2xl border border-border bg-surface-card p-6">
                <h3 className="mb-6 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Conquistas e Metas
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.1)] text-accent">
                      <Award className="h-5 w-5" />
                    </div>
                    <p className="mt-3 font-semibold text-foreground">Top Rated</p>
                    <p className="mt-1 text-xs text-fg-muted">Média 4.5+ por 3 meses</p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.1)] text-accent">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="mt-3 font-semibold text-foreground">Client Favorite</p>
                    <p className="mt-1 text-xs text-fg-muted">50+ clientes atendidos</p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.1)] text-accent">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <p className="mt-3 font-semibold text-foreground">Review Master</p>
                    <p className="mt-1 text-xs text-fg-muted">100+ reviews recebidas</p>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-border bg-surface-card p-6">
                <h3 className="mb-6 font-display text-xl font-bold italic text-foreground">
                  Metas do Mês
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-foreground">Avaliação Média (Meta: 4.5)</span>
                      <span className="font-medium text-fg-muted">
                        {metrics?.goals?.averageRating?.current?.toFixed(1) || "0.0"} / 4.5
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-border">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{
                          width: `${metrics?.goals?.averageRating?.percentage || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-foreground">Reviews Recebidas (Meta: 20)</span>
                      <span className="font-medium text-fg-muted">
                        {metrics?.goals?.monthlyReviews?.current || 0} / 20
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-border">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{
                          width: `${metrics?.goals?.monthlyReviews?.percentage || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-foreground">Clientes Atendidos (Meta: 100)</span>
                      <span className="font-medium text-fg-muted">
                        {metrics?.goals?.monthlyClients?.current || 0} / 100
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-border">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{
                          width: `${metrics?.goals?.monthlyClients?.percentage || 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}
