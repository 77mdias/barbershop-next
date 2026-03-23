import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import type { PromotionCard } from "@/types/home";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const badgeToneClasses: Record<PromotionCard["badgeTone"], string> = {
  neutral: "border-border text-fg-muted",
  success: "border-[hsl(var(--state-open-fg)/0.3)] text-state-open-fg",
  danger: "border-[hsl(var(--state-closed-fg)/0.3)] text-state-closed-fg",
};

type PromoSectionProps = {
  title: string;
  ctaLabel: string;
  ctaHref: string;
  promotions: PromotionCard[];
  className?: string;
};

export function PromoSection({ title, ctaLabel, ctaHref, promotions, className }: PromoSectionProps) {
  return (
    <section className={cn("w-full bg-surface-1 py-20 lg:py-28", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold italic tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h2>
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

        <div className="stagger-reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <article
              key={promo.id}
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card p-7 transition-all duration-500",
                "hover:border-[hsl(var(--accent)/0.3)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]",
              )}
            >
              {/* Subtle top accent gradient */}
              <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--accent)/0.4)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <span
                className={cn(
                  "max-w-fit rounded-full border bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                  badgeToneClasses[promo.badgeTone],
                )}
              >
                {promo.badgeLabel}
              </span>

              <div className="mt-5 flex flex-1 flex-col gap-4">
                <div>
                  <h3 className="font-display text-xl font-semibold italic text-foreground">
                    {promo.title}
                  </h3>
                  {promo.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {promo.description}
                    </p>
                  ) : null}
                </div>

                {/* Promo code display */}
                <div className="relative rounded-xl border border-dashed border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.04)] px-4 py-3 text-center text-sm font-bold tracking-[0.15em] text-accent">
                  {promo.code}
                </div>

                {promo.expiresLabel ? (
                  <div className="flex items-center gap-2 text-xs text-fg-subtle">
                    <CalendarClock className="h-3.5 w-3.5" />
                    <span>{promo.expiresLabel}</span>
                  </div>
                ) : null}

                <Button
                  asChild
                  className={cn(
                    "gold-shimmer mt-auto w-full rounded-xl bg-accent text-on-accent transition-all duration-300",
                    "hover:bg-accent/90 hover:shadow-[0_8px_24px_-4px_hsl(var(--accent)/0.3)]",
                  )}
                >
                  <Link href={promo.href} className="inline-flex items-center justify-center gap-2">
                    Usar agora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
