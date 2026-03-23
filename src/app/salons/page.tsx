import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star, ArrowRight, Clock3 } from "lucide-react";
import { getHomePageData } from "@/server/home/getHomePageData";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

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

export default async function SalonsPage() {
  const data = await getHomePageData();
  const salons = data.salons.items;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Barbearias"
        title="Salões Próximos"
        subtitle="Escolha a unidade ideal, veja o status em tempo real e siga para o agendamento com uma experiência visual consistente."
      >
        <div className="mt-2 w-full max-w-3xl">
          <div className="rounded-2xl border border-border bg-surface-card p-3 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                <input
                  type="text"
                  readOnly
                  value="Buscar por bairro, distância ou unidade"
                  aria-label="Buscar salões"
                  className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
                />
              </div>
              <Link
                href="/scheduling"
                className="gold-shimmer inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
              >
                Agendar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {["Centro", "Zona Sul", "Até 3 km", "Aberto agora"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PageHero>

      <section className="container mx-auto px-4 py-16 sm:py-20">
        <SectionHeader
          title="Seleção em destaque"
          subtitle="A mesma linguagem visual da Home aplicada à vitrine de unidades."
          centered={false}
          className="mb-10"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {salons.map((salon, index) => (
            <article
              key={salon.id}
              className={cn(
                "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card transition-all duration-500",
                "card-hover hover:border-[hsl(var(--accent)/0.3)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]",
              )}
            >
              <div className="relative overflow-hidden">
                <Image
                  src={salon.imageUrl}
                  alt={salon.name}
                  width={400}
                  height={260}
                  className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <span
                  className={cn(
                    "absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md",
                    statusStyles[salon.status],
                  )}
                >
                  {statusLabels[salon.status]}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-semibold italic text-foreground">
                    {salon.name}
                  </h2>
                  <p className="inline-flex items-start gap-2 text-sm text-fg-muted">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{salon.address}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted">
                  <Clock3 className="h-3.5 w-3.5 text-accent" />
                    {salon.distanceLabel ?? `${index + 1} km`}
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent)/0.1)] px-3 py-1 text-xs font-semibold text-accent">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {salon.ratingLabel ?? "—"}
                  </div>
                </div>

                <Link
                  href={salon.href || `/salons/${salon.id}`}
                  className="mt-auto inline-flex items-center justify-center rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                >
                  Ver detalhes
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
