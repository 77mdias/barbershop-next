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
import { Calendar, Star, User, Scissors, Heart, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userRole = session.user.role;
  const isBarber = userRole === "BARBER";
  const isAdmin = userRole === "ADMIN";

  if (isAdmin) {
    redirect("/dashboard/admin");
  }

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
        subtitle={
          isBarber
            ? "Gerencie seus clientes, serviços e performance."
            : "Acompanhe seus agendamentos e avaliações."
        }
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <article
                  key={action.title}
                  className="card-hover group rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.16)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-bold italic text-foreground">
                    {action.title}
                  </h2>
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
            <SectionHeader
              title="Performance do Mês"
              subtitle="Métricas atualizadas em tempo real."
              centered={false}
              className="mb-8"
            />
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { label: "Clientes Este Mês", value: (metrics as any)?.monthlyClients ?? 0 },
                {
                  label: "Avaliação Média",
                  value: (metrics as any)?.averageRating?.toFixed(1) ?? "0.0",
                },
                { label: "Total de Reviews", value: (metrics as any)?.totalReviews ?? 0 },
              ].map((kpi) => (
                <article
                  key={kpi.label}
                  className="card-hover rounded-2xl border border-border bg-surface-card p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                    {kpi.label}
                  </p>
                  <p className="mt-3 font-display text-4xl font-bold italic text-accent">
                    {kpi.value}
                  </p>
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
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
                </div>
              }
            >
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
