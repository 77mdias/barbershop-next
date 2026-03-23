import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";
import type { SalonCard } from "@/types/home";
import { cn } from "@/lib/utils";

const statusStyles: Record<SalonCard["status"], string> = {
  OPEN: "border-[hsl(var(--state-open-fg)/0.3)] bg-[hsl(var(--state-open-surface))] text-state-open-fg",
  CLOSING_SOON: "border-[hsl(var(--state-warning-fg)/0.3)] bg-[hsl(var(--state-warning-surface))] text-state-warning-fg",
  CLOSED: "border-[hsl(var(--state-closed-fg)/0.3)] bg-[hsl(var(--state-closed-surface))] text-state-closed-fg",
};

const statusLabels: Record<SalonCard["status"], string> = {
  OPEN: "Aberto agora",
  CLOSING_SOON: "Fecha em breve",
  CLOSED: "Fechado",
};

type SalonGridProps = {
  title: string;
  ctaLabel: string;
  ctaHref: string;
  salons: SalonCard[];
  className?: string;
};

export function SalonGrid({ title, ctaLabel, ctaHref, salons, className }: SalonGridProps) {
  return (
    <section className={cn("w-full bg-background py-20 lg:py-28", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold italic tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-fg-muted sm:text-base">
              Escolha a barbearia ideal perto de você.
            </p>
            <div className="mt-3 h-0.5 w-12 bg-accent" />
          </div>
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="stagger-reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {salons.map((salon) => (
            <article
              key={salon.id}
              className={cn(
                "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card transition-all duration-500",
                "hover:border-[hsl(var(--accent)/0.3)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]",
              )}
            >
              {/* Image with overlay */}
              <div className="relative overflow-hidden">
                <Image
                  src={salon.imageUrl}
                  alt={salon.name}
                  width={400}
                  height={260}
                  className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Dark gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span
                  className={cn(
                    "absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm",
                    statusStyles[salon.status],
                  )}
                >
                  {statusLabels[salon.status]}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-6">
                <div>
                  <h3 className="font-display text-lg font-semibold italic text-foreground">
                    {salon.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-fg-muted">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span>{salon.ratingLabel}</span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 text-sm text-fg-muted">
                  <span className="inline-flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2 text-xs">{salon.address}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-border bg-surface-1 px-2.5 py-0.5 text-xs font-medium text-fg-muted">
                    {salon.distanceLabel}
                  </span>
                </div>

                <Link
                  href={salon.href}
                  className={cn(
                    "mt-auto inline-flex items-center justify-center rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-300",
                    "hover:border-accent hover:bg-accent hover:text-on-accent",
                  )}
                >
                  Ver detalhes
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
