import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Star, Clock3, Scissors, Sparkles, ArrowRight } from "lucide-react";
import { getHomePageData } from "@/server/home/getHomePageData";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

type SalonDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const serviceCards = [
  {
    name: "Corte Premium",
    duration: "30 min",
    price: "R$ 70,00",
    icon: Scissors,
    description: "Acabamento refinado com consulta de estilo.",
  },
  {
    name: "Barba Completa",
    duration: "25 min",
    price: "R$ 55,00",
    icon: Sparkles,
    description: "Navalha, toalha quente e finalização precisa.",
  },
  {
    name: "Combo Assinatura",
    duration: "50 min",
    price: "R$ 110,00",
    icon: Clock3,
    description: "Experiência completa para rotina premium.",
  },
];

const statusStyles = {
  OPEN: "border-[hsl(var(--state-open-fg)/0.3)] bg-[hsl(var(--state-open-surface))] text-state-open-fg",
  CLOSING_SOON: "border-[hsl(var(--state-warning-fg)/0.3)] bg-[hsl(var(--state-warning-surface))] text-state-warning-fg",
  CLOSED: "border-[hsl(var(--state-closed-fg)/0.3)] bg-[hsl(var(--state-closed-surface))] text-state-closed-fg",
} as const;

const statusLabels = {
  OPEN: "Aberto agora",
  CLOSING_SOON: "Fecha em breve",
  CLOSED: "Fechado",
} as const;

export default async function SalonDetailsPage({ params }: SalonDetailsPageProps) {
  const { id } = await params;
  const data = await getHomePageData();
  const salons = data.salons.items;
  const salon =
    salons.find((item) => item.id === id) ??
    salons.find((item) => item.id === `fallback-${id}`) ??
    salons.find((item) => item.id === `salon-${id}`);

  const name = salon?.name ?? "Barbearia em destaque";
  const imageUrl = salon?.imageUrl ?? "/images/salon1.svg";
  const address = salon?.address ?? "Endereço será exibido aqui";
  const ratingLabel = salon?.ratingLabel ?? "Avaliações em breve";
  const status = salon?.status ?? "OPEN";

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="relative overflow-hidden bg-surface-1">
        <div className="container mx-auto px-4 py-5">
          <Link href="/salons" className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent/80">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Salões
          </Link>
        </div>

        <div className="container mx-auto grid gap-8 px-4 pb-16 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:pb-20">
          <div className="stagger-reveal space-y-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Detalhes do salão
            </span>
            <h1 className="font-display text-4xl font-bold italic tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {name}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
              Página demonstrativa com layout premium, mantendo os dados da Home e preparando a navegação para o agendamento.
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-2 text-sm text-fg-muted">
                <MapPin className="h-4 w-4 text-accent" />
                {address}
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                  statusStyles[status],
                )}
              >
                {statusLabels[status]}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-2 text-sm text-fg-muted">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {ratingLabel}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/scheduling"
                className="gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
              >
                Agendar neste salão
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/promotions"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
              >
                Ver promoções
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-card shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)]">
            <Image
              src={imageUrl}
              alt={name}
              width={900}
              height={700}
              className="h-[360px] w-full object-cover sm:h-[440px]"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {["Corte", "Barba", "Spa"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="card-hover rounded-2xl border border-border bg-surface-card p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-accent">
              <MapPin className="h-4 w-4" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold italic text-foreground">Endereço</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{address}</p>
          </article>

          <article className="card-hover rounded-2xl border border-border bg-surface-card p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-accent">
              <Clock3 className="h-4 w-4" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold italic text-foreground">Horário</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {status === "OPEN" ? "Aberto agora" : status === "CLOSING_SOON" ? "Fecha em breve" : "Fechado no momento"}
            </p>
          </article>

          <article className="card-hover rounded-2xl border border-border bg-surface-card p-5 sm:col-span-2 lg:col-span-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-accent">
              <Star className="h-4 w-4 fill-accent text-accent" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold italic text-foreground">Avaliação</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{ratingLabel}</p>
          </article>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 sm:py-20">
        <SectionHeader
          title="Serviços do salão"
          subtitle="Seleção de serviços demonstrativos com foco em clareza, ritmo visual e CTA de agendamento."
          centered={false}
          className="mb-10"
        />

        <div className="grid gap-5 md:grid-cols-3">
          {serviceCards.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.name}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-border bg-surface-card p-6 transition-all duration-500",
                  "card-hover hover:border-[hsl(var(--accent)/0.3)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.15)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted">
                    {service.duration}
                  </span>
                </div>

                <div className="mt-5 flex flex-1 flex-col gap-3">
                  <h2 className="font-display text-xl font-semibold italic text-foreground">
                    {service.name}
                  </h2>
                  <p className="text-sm leading-relaxed text-fg-muted">{service.description}</p>
                  <p className="mt-auto text-lg font-bold text-accent">{service.price}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-surface-1">
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <div className="rounded-2xl border border-border bg-surface-card p-8 text-center shadow-[0_24px_60px_-32px_rgba(0,0,0,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Pronto para agendar?</p>
            <h2 className="mt-3 font-display text-3xl font-bold italic text-foreground sm:text-4xl">
              Escolha o melhor horário para este salão
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-fg-muted sm:text-base">
              O fluxo de agendamento recebe o destaque visual e mantém a experiência consistente com o restante da aplicação.
            </p>
            <div className="mt-6">
              <Link
                href="/scheduling"
                className="gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
              >
                Ir para agendamento
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
