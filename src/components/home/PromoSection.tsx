import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import type { PromotionCard } from "@/types/home";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const badgeToneClasses: Record<PromotionCard["badgeTone"], string> = {
  neutral: "bg-badge-surface text-badge-fg",
  success: "bg-state-open-surface text-state-open-fg",
  danger: "bg-state-closed-surface text-state-closed-fg",
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
    <section className={cn("w-full bg-surface-2 py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
          </div>
          <Button asChild variant="ghost" className="justify-start px-0 text-accent">
            <Link href={ctaHref} className="inline-flex items-center gap-2">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <article
              key={promo.id}
              className="flex h-full flex-col rounded-2xl border border-border bg-surface-card p-6 shadow-soft"
            >
              <span
                className={cn(
                  "max-w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  badgeToneClasses[promo.badgeTone],
                )}
              >
                {promo.badgeLabel}
              </span>
              <div className="mt-5 flex flex-1 flex-col gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {promo.title}
                  </h3>
                  {promo.description ? (
                    <p className="mt-2 text-sm text-fg-muted">
                      {promo.description}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-dashed border-border bg-surface-2 px-4 py-3 text-sm font-semibold tracking-widest text-foreground">
                  {promo.code}
                </div>
                {promo.expiresLabel ? (
                  <div className="flex items-center gap-2 text-xs text-fg-muted">
                    <CalendarClock className="h-4 w-4" />
                    <span>{promo.expiresLabel}</span>
                  </div>
                ) : null}
                <Button
                  asChild
                  className="mt-auto w-full rounded-full bg-accent text-on-accent shadow-soft hover:bg-accent/90"
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
