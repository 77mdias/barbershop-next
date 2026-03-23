import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAdminMetrics } from "@/server/dashboardActions";
import { getServicesForAdmin } from "@/server/serviceAdminActions";
import { PageHero } from "@/components/shared/PageHero";
import { RealtimeRefreshBridge } from "@/components/realtime/RealtimeRefreshBridge";
import Link from "next/link";
import {
  Users,
  BarChart3,
  Star,
  TrendingUp,
  UserCog,
  Settings,
  Activity,
  DollarSign,
  Database,
  AlertTriangle,
  Scissors,
  Plus,
  Edit,
  Power,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const metricsResult = await getAdminMetrics();
  const metrics = metricsResult.success ? metricsResult.data : null;

  const servicesResult = await getServicesForAdmin({ limit: 10 });
  const services = servicesResult.success ? servicesResult.data : [];
  const totalServices = services.length;
  const activeServices = services.filter((s: any) => s.active).length;
  const inactiveServices = services.filter((s: any) => !s.active).length;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <RealtimeRefreshBridge events={["appointment:changed", "review:updated", "analytics:updated"]} />
      <PageHero
        badge="Administrador"
        title="Painel Administrativo"
        subtitle="Gerencie toda a plataforma e monitore métricas globais."
      />

      {!metrics && (
        <section className="bg-background py-12">
          <div className="container mx-auto px-4 flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </section>
      )}

      {metrics && (
        <>
          {/* KPI Cards */}
          <section className="bg-background py-12">
            <div className="container mx-auto px-4">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                    Total de Usuários
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                    {metrics.totalUsers}
                  </p>
                  <div className="mt-3 flex flex-col gap-1 text-xs text-fg-muted">
                    <span>Clientes: {metrics.clientsCount}</span>
                    <span>Barbeiros: {metrics.barbersCount}</span>
                    <span>Admins: {metrics.adminsCount}</span>
                  </div>
                </article>

                <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <Star className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                    Sistema de Reviews
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                    {metrics.totalReviews}
                  </p>
                  <div className="mt-3 flex flex-col gap-1 text-xs text-fg-muted">
                    <span>Média: {metrics.globalAverage}/5</span>
                    <span>Este mês: {metrics.monthlyReviews}</span>
                    <span>5 estrelas: {metrics.fiveStarReviews}</span>
                  </div>
                </article>

                <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <Activity className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                    Atividade Mensal
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                    {metrics.monthlyActivity}
                  </p>
                  <div className="mt-3 flex flex-col gap-1 text-xs text-fg-muted">
                    <span>Agendamentos: {metrics.monthlyAppointments}</span>
                    <span>Avaliações: {metrics.monthlyReviews}</span>
                    <span>Novos usuários: {metrics.newUsersThisMonth}</span>
                  </div>
                </article>

                <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                    Receita Mensal
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                    R$ {(metrics.monthlyRevenue || 0).toFixed(2)}
                  </p>
                  <div className="mt-3 flex flex-col gap-1 text-xs text-fg-muted">
                    <span>Total: R$ {(metrics.totalRevenue || 0).toFixed(2)}</span>
                    <span>Serviços pagos: {metrics.paidServices}</span>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <section className="bg-surface-1 py-12">
            <div className="container mx-auto px-4">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="rounded-2xl border border-border bg-surface-card p-1 flex flex-wrap gap-1 h-auto">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Visão Geral</span>
                    <span className="sm:hidden">Visão</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none"
                  >
                    <Users className="h-4 w-4" />
                    Usuários
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none"
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Avaliações</span>
                    <span className="sm:hidden">Reviews</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none"
                  >
                    <Scissors className="h-4 w-4" />
                    Serviços
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none"
                  >
                    <Settings className="h-4 w-4" />
                    Sistema
                  </TabsTrigger>
                </TabsList>

                {/* Visão Geral */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-5 lg:grid-cols-2">
                    <article className="rounded-2xl border border-border bg-surface-card p-6">
                      <h3 className="mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        Top Barbeiros (Avaliações)
                      </h3>
                      <div className="space-y-4">
                        {metrics.topBarbers?.map((barber, index) => (
                          <div key={barber.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-1 text-sm font-semibold text-foreground">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium text-foreground">{barber.name}</p>
                                <p className="text-xs text-fg-muted">{barber.totalReviews} avaliações</p>
                              </div>
                            </div>
                            <p className="font-bold text-accent">
                              <Star className="inline h-4 w-4 mr-1 fill-accent" />
                              {barber.averageRating}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>

                    <article className="rounded-2xl border border-border bg-surface-card p-6">
                      <h3 className="mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-accent" />
                        Distribuição de Avaliações
                      </h3>
                      <div className="space-y-3">
                        {metrics.ratingDistribution?.map((rating) => (
                          <div key={rating.rating} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {rating.rating} <Star className="inline h-4 w-4 text-accent fill-accent" />
                            </span>
                            <div className="flex flex-1 items-center gap-3 ml-4">
                              <div className="flex-1 rounded-full bg-border h-2">
                                <div
                                  className="h-2 rounded-full bg-accent"
                                  style={{
                                    width: `${(rating._count.rating / metrics.totalReviews) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="min-w-[3rem] text-right text-sm text-fg-muted">
                                {rating._count.rating}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  </div>
                </TabsContent>

                {/* Gestão de Usuários */}
                <TabsContent value="users" className="space-y-6">
                  <div className="grid gap-5 lg:grid-cols-3">
                    <article className="rounded-2xl border border-border bg-surface-card p-6">
                      <h3 className="mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-accent" />
                        Ações Rápidas
                      </h3>
                      <div className="flex flex-col gap-3">
                        <Link
                          href="/dashboard/admin/users"
                          className="gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
                        >
                          <Users className="h-4 w-4" />
                          Gerenciar Usuários
                        </Link>
                        <Link
                          href="/dashboard/admin/barbers"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                        >
                          <UserCog className="h-4 w-4" />
                          Gerenciar Barbeiros
                        </Link>
                        <Link
                          href="/dashboard/admin/reports"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Relatórios
                        </Link>
                      </div>
                    </article>

                    <article className="rounded-2xl border border-border bg-surface-card p-6 lg:col-span-2">
                      <h3 className="mb-5 font-display text-xl font-bold italic text-foreground">
                        Estatísticas Detalhadas
                      </h3>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                            Usuários Ativos (30 dias)
                          </p>
                          <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                            {metrics.activeUsers}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                            Novos Usuários (mês)
                          </p>
                          <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                            {metrics.newUsersThisMonth}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                            Taxa de Conversão
                          </p>
                          <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                            {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                            Barbeiros Ativos
                          </p>
                          <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                            {metrics.activeBarbersCount}
                          </p>
                        </div>
                      </div>
                    </article>
                  </div>
                </TabsContent>

                {/* Sistema de Avaliações */}
                <TabsContent value="reviews" className="space-y-6">
                  <article className="rounded-2xl border border-border bg-surface-card p-6">
                    <h3 className="mb-5 font-display text-xl font-bold italic text-foreground">
                      Monitoramento de Avaliações
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                          Avaliações Hoje
                        </p>
                        <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                          {metrics.todayReviews}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                          Média Geral
                        </p>
                        <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                          {metrics.globalAverage}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                          Reviews Pendentes
                        </p>
                        <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                          {metrics.pendingReviews}
                        </p>
                      </div>
                    </div>
                  </article>
                </TabsContent>

                {/* Serviços */}
                <TabsContent value="services" className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                        <Scissors className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                        Total de Serviços
                      </p>
                      <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                        {totalServices}
                      </p>
                      <p className="mt-1 text-xs text-fg-muted">cadastrados na plataforma</p>
                    </article>

                    <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                        <Power className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                        Serviços Ativos
                      </p>
                      <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                        {activeServices}
                      </p>
                      <p className="mt-1 text-xs text-fg-muted">disponíveis para agendamento</p>
                    </article>

                    <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                        <Power className="h-5 w-5 opacity-50" />
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                        Serviços Inativos
                      </p>
                      <p className="mt-2 font-display text-4xl font-bold italic text-fg-muted">
                        {inactiveServices}
                      </p>
                      <p className="mt-1 text-xs text-fg-muted">temporariamente desativados</p>
                    </article>

                    <article className="card-hover rounded-2xl border border-border bg-surface-card p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                        <Settings className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                        Gerenciamento
                      </p>
                      <div className="mt-3 flex flex-col gap-2">
                        <Link
                          href="/dashboard/admin/services"
                          className="gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
                        >
                          <Scissors className="h-3.5 w-3.5" />
                          Ver Todos
                        </Link>
                        <Link
                          href="/dashboard/admin/services/new"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-xs font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Novo Serviço
                        </Link>
                      </div>
                    </article>
                  </div>

                  <article className="rounded-2xl border border-border bg-surface-card">
                    <div className="border-b border-border px-6 py-4">
                      <h3 className="font-display text-xl font-bold italic text-foreground">
                        Serviços Recentes
                      </h3>
                      <p className="mt-1 text-sm text-fg-muted">
                        Últimos serviços cadastrados ou atualizados
                      </p>
                    </div>
                    <div className="divide-y divide-border">
                      {services.slice(0, 5).map((service: any) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-surface-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent">
                              <Scissors className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{service.name}</p>
                              <p className="text-sm text-fg-muted">
                                {service.duration} min · R$ {Number(service.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                service.active
                                  ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]"
                                  : "bg-border text-fg-subtle"
                              }`}
                            >
                              {service.active ? "Ativo" : "Inativo"}
                            </span>
                            <Link
                              href={`/dashboard/admin/services/${service.id}/edit`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:border-accent hover:text-accent"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))}

                      {services.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-fg-muted">
                          <Scissors className="h-12 w-12 opacity-30" />
                          <p className="text-sm">Nenhum serviço cadastrado ainda</p>
                          <Link
                            href="/dashboard/admin/services/new"
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                          >
                            Criar primeiro serviço
                          </Link>
                        </div>
                      )}
                    </div>
                  </article>
                </TabsContent>

                {/* Sistema */}
                <TabsContent value="system" className="space-y-6">
                  <div className="grid gap-5 lg:grid-cols-2">
                    <article className="rounded-2xl border border-border bg-surface-card p-6">
                      <h3 className="mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                        <Database className="h-5 w-5 text-accent" />
                        Status do Sistema
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: "Status da API", status: "Online" },
                          { label: "Banco de Dados", status: "Conectado" },
                          { label: "Uploads de Imagem", status: "Funcionando" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-sm text-foreground">{item.label}</span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--success)/0.12)] px-2.5 py-0.5 text-xs font-semibold text-[hsl(var(--success))]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </article>

                    <article className="rounded-2xl border border-border bg-surface-card p-6">
                      <h3 className="mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                        <Settings className="h-5 w-5 text-accent" />
                        Configurações Administrativas
                      </h3>
                      <div className="flex flex-col gap-3">
                        <Link
                          href="/admin/settings"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                        >
                          <Settings className="h-4 w-4" />
                          Configurações Gerais
                        </Link>
                        <Link
                          href="/admin/backup"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                        >
                          <Database className="h-4 w-4" />
                          Backup &amp; Restore
                        </Link>
                        <Link
                          href="/admin/logs"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Logs do Sistema
                        </Link>
                      </div>
                    </article>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
