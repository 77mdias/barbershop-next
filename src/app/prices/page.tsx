import Link from "next/link";
import { Brush, Percent, Scissors, Sparkles, UserRound } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeader } from "@/components/shared/SectionHeader";

const samplePrices = [
  {
    label: "Corte de Cabelo",
    price: "R$ 70,00",
    time: "30 min",
    icon: Scissors,
    description: "Acabamento limpo e alinhado para rotina ou ocasião especial.",
  },
  {
    label: "Barba Completa",
    price: "R$ 55,00",
    time: "25 min",
    icon: UserRound,
    description: "Modelagem precisa com atenção ao contorno e à textura.",
  },
  {
    label: "Combo Corte + Barba",
    price: "R$ 110,00",
    time: "50 min",
    icon: Sparkles,
    description: "A experiência mais completa para quem busca refinamento em uma única visita.",
  },
  {
    label: "Pezinho / Acabamento",
    price: "R$ 35,00",
    time: "15 min",
    icon: Brush,
    description: "Detalhes rápidos para manter a silhueta sempre impecável.",
  },
];

export default function PricesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Tabela transparente"
        title="Preços & Serviços"
        subtitle="Valores claros, duração estimada e uma leitura rápida do que cada experiência entrega."
        actions={[
          {
            label: "Ver promoções",
            href: "/promotions",
            variant: "outline",
          },
          {
            label: "Agendar agora",
            href: "/scheduling",
          },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-card px-5 py-4">
            <div className="flex items-center gap-3 text-sm text-fg-muted">
              <Percent className="h-4 w-4 text-accent" />
              <span>Quer economizar mais? Confira promoções ativas e pacotes especiais antes de fechar o horário.</span>
            </div>
            <Link
              href="/promotions"
              className="text-sm font-semibold text-accent transition-colors hover:text-accent/80"
            >
              Abrir promoções
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface-1 py-16">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Serviços mais buscados"
            subtitle="A mesma curadoria visual da Home, organizada para comparação rápida."
          />

          <div className="stagger-reveal mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {samplePrices.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className="card-hover group rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.16)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted">
                      {item.time}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h2 className="font-display text-2xl font-bold italic text-foreground">{item.label}</h2>
                    <p className="text-sm leading-relaxed text-fg-muted">{item.description}</p>
                    <p className="text-2xl font-bold text-accent">{item.price}</p>
                  </div>

                  <Link
                    href="/scheduling"
                    className="gold-shimmer mt-6 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
                  >
                    Agendar serviço
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
