import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { SalonCard } from "@/types/home";
import { cn } from "@/lib/utils";

const statusStyles: Record<SalonCard["status"], string> = {
  OPEN: "bg-state-open-surface text-state-open-fg",
  CLOSING_SOON: "bg-state-warning-surface text-state-warning-fg",
  CLOSED: "bg-state-closed-surface text-state-closed-fg",
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
    <section className={cn("w-full bg-surface-1 py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="text-sm text-fg-muted sm:text-base">
              Escolha a barbearia ideal perto de você.
            </p>
          </div>
          <Link href={ctaHref} className="text-sm font-semibold text-accent">
            {ctaLabel}
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {salons.map((salon) => (
            <article
              key={salon.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative">
                <Image
                  src={salon.imageUrl}
                  alt={salon.name}
                  width={400}
                  height={260}
                  className="h-48 w-full object-cover"
                />
                <span
                  className={cn(
                    "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold",
                    statusStyles[salon.status],
                  )}
                >
                  {statusLabels[salon.status]}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {salon.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-fg-muted">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span>{salon.ratingLabel}</span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3 text-sm text-fg-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {salon.address}
                  </span>
                  <span className="rounded-full bg-badge-surface px-3 py-1 text-xs font-medium text-badge-fg">
                    {salon.distanceLabel}
                  </span>
                </div>
                <Link
                  href={salon.href}
                  className="mt-auto inline-flex items-center justify-center rounded-full border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
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
