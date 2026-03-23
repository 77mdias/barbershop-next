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
    <section className={cn("w-full bg-background py-20 lg:py-28", className)}>
      <div className="container mx-auto px-4">
        <div className="stagger-reveal flex flex-col gap-4 text-center">
          <h2 className="font-display text-3xl font-bold italic tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto max-w-2xl text-base text-fg-muted sm:text-lg">
              {subtitle}
            </p>
          ) : null}
          <div className="mx-auto mt-1 h-0.5 w-12 bg-accent" />
        </div>

        <div className="stagger-reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon ?? "scissors"] ?? Scissors;
            const isFeature = index === 0;

            return (
              <article
                key={service.id}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card p-7 transition-all duration-500",
                  "hover:border-[hsl(var(--accent)/0.4)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]",
                  isFeature && "sm:row-span-1 lg:border-[hsl(var(--accent)/0.2)]",
                )}
              >
                {/* Hover gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent)/0.03)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10 flex items-start justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.15)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted">
                    {service.durationLabel}
                  </span>
                </div>

                <div className="relative z-10 mt-6 flex flex-1 flex-col gap-3 text-left">
                  <div>
                    <h3 className="font-display text-xl font-semibold italic text-foreground">
                      {service.name}
                    </h3>
                    {service.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                        {service.description}
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-auto text-lg font-bold text-accent">
                    {service.priceLabel}
                  </p>

                  <Button
                    asChild
                    variant="secondary"
                    className={cn(
                      "mt-3 rounded-xl border border-border bg-transparent text-foreground transition-all duration-300",
                      "group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent",
                    )}
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
