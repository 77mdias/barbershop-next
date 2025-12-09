import type { ComponentType } from "react";
import Link from "next/link";
import { Brush, Clock3, Ruler, Scissors, Sparkles, UserRound } from "lucide-react";
import type { PopularServiceCard, PopularServiceIcon } from "@/types/home";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const iconMap: Record<PopularServiceIcon, ComponentType<{ className?: string }>> = {
  scissors: Scissors,
  beard: UserRound,
  sparkles: Sparkles,
  comb: Brush,
  razor: Ruler,
  brush: Brush,
  clock: Clock3,
};

type HeroServicesProps = {
  title: string;
  subtitle?: string;
  services: PopularServiceCard[];
  className?: string;
};

export function HeroServices({ title, subtitle, services, className }: HeroServicesProps) {
  return (
    <section className={cn("w-full bg-surface-1 py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 text-center sm:gap-5">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto max-w-2xl text-base text-fg-muted sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = iconMap[service.icon ?? "scissors"] ?? Scissors;
            return (
              <article
                key={service.id}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-badge-surface px-3 py-1 text-xs font-medium text-badge-fg">
                    {service.durationLabel}
                  </span>
                </div>
                <div className="mt-6 flex flex-1 flex-col gap-3 text-left">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                      {service.name}
                    </h3>
                    {service.description ? (
                      <p className="mt-1 text-sm text-fg-muted">
                        {service.description}
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-auto text-base font-semibold text-foreground sm:text-lg">
                    {service.priceLabel}
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    className="mt-4 rounded-full border border-border bg-surface-1 text-foreground transition group-hover:border-accent group-hover:text-accent"
                  >
                    <Link href={service.href}>Agendar</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
