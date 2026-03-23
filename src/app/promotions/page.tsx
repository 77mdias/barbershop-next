import Link from "next/link";
import { Gift, Sparkles, Tag } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { getHomePageData } from "@/server/home/getHomePageData";

export default async function PromotionsPage() {
  const data = await getHomePageData();
  const promotions = data.promotions.items;
  const filters = [
    "Todos",
    "Cortes",
    "Barbas",
    "Pacotes",
    "VIP",
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Ofertas exclusivas"
        title="Ofertas Exclusivas"
        subtitle="Cupons e campanhas ativas com leitura clara de prazo, valor e contexto de uso."
        actions={[
          {
            label: "Agendar agora",
            href: "/scheduling",
          },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Filtros visuais"
            subtitle="Referências de categoria para orientar a navegação sem alterar a lógica atual."
            centered={false}
          />

          <div className="mt-6 flex flex-wrap gap-3">
            {filters.map((filter, index) => {
              const active = index === 0;

              return (
                <span
                  key={filter}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300",
                    active
                      ? "border-accent bg-[hsl(var(--accent)/0.1)] text-accent"
                      : "border-border bg-surface-card text-fg-muted",
                  ].join(" ")}
                >
                  {active ? <Sparkles className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                  {filter}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface-1 py-16">
        <div className="container mx-auto px-4">
          <div className="stagger-reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo) => (
              <article
                key={promo.id}
                className="card-hover group rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.2)] bg-[hsl(var(--accent)/0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    <Gift className="h-3.5 w-3.5" />
                    {promo.badgeLabel}
                  </span>
                  {promo.expiresLabel ? (
                    <span className="rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted">
                      {promo.expiresLabel}
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-5 font-display text-2xl font-bold italic text-foreground">
                  {promo.title}
                </h2>
                {promo.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-fg-muted">{promo.description}</p>
                ) : null}

                <div className="mt-5 rounded-xl border border-dashed border-[hsl(var(--accent)/0.32)] bg-[hsl(var(--accent)/0.05)] px-4 py-3 text-center text-sm font-bold tracking-[0.18em] text-accent">
                  {promo.code}
                </div>

                <Link
                  href="/scheduling"
                  className="gold-shimmer mt-6 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
                >
                  Usar agora
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
