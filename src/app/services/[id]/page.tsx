import Link from "next/link";
import { Scissors, Clock, DollarSign, Calendar } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";

type ServiceDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  const { id } = await params;
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Serviço"
        title="Detalhes do Serviço"
        subtitle="Esta página é demonstrativa. Para ver valores e duração, acesse o fluxo de agendamento."
        actions={[
          { label: "Agendar agora", href: "/scheduling" },
          { label: "Ver promoções", href: "/promotions", variant: "outline" },
        ]}
      />

      <section className="bg-surface-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Service ID card */}
            <div className="rounded-2xl border border-border bg-surface-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                  <Scissors className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold italic text-foreground">
                    ID do serviço
                  </h2>
                  <p className="mt-0.5 font-mono text-sm text-fg-muted">{id}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-fg-muted">
                Agende para visualizar horários, barbeiros disponíveis e preços atualizados.
              </p>
            </div>

            {/* KPI placeholders */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface-card p-6 text-center">
                <span className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                  <Clock className="h-5 w-5" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">Duração</p>
                <p className="mt-1 font-display text-3xl font-bold italic text-accent">—</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-card p-6 text-center">
                <span className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                  <DollarSign className="h-5 w-5" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">Preço</p>
                <p className="mt-1 font-display text-3xl font-bold italic text-accent">—</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-card p-6 text-center">
                <span className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                  <Calendar className="h-5 w-5" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">Disponível</p>
                <p className="mt-1 font-display text-3xl font-bold italic text-accent">—</p>
              </div>
            </div>

            {/* CTA links */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/scheduling"
                className="gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
              >
                Agendar agora
              </Link>
              <Link
                href="/promotions"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
              >
                Ver promoções
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
