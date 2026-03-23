import Link from "next/link";
import type { BookingCtaContent } from "@/types/home";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type BookingCTAProps = BookingCtaContent & {
  className?: string;
};

export function BookingCTA({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  signinHref,
  className,
}: BookingCTAProps) {
  return (
    <section
      className={cn(
        "grain-overlay relative w-full overflow-hidden bg-surface-1 py-16 lg:py-24",
        className,
      )}
    >
      {/* Atmospheric gradient orbs */}
      <div className="pointer-events-none absolute -right-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-[hsl(var(--accent)/0.06)] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-[hsl(var(--accent)/0.04)] blur-[80px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="stagger-reveal mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          {/* Decorative top element */}
          <div className="flex items-center gap-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[hsl(var(--accent)/0.5)]" />
            <div className="h-2 w-2 rotate-45 border border-[hsl(var(--accent)/0.5)]" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[hsl(var(--accent)/0.5)]" />
          </div>

          <h2 className="font-display text-3xl font-bold italic text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>

          <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              className={cn(
                "gold-shimmer h-13 w-full rounded-xl bg-accent px-8 text-base font-semibold text-on-accent shadow-lg transition-all duration-300 sm:w-auto",
                "hover:bg-accent/90 hover:shadow-[0_8px_30px_-4px_hsl(var(--accent)/0.4)]",
              )}
            >
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className={cn(
                "h-13 w-full rounded-xl border border-border bg-transparent px-8 text-base font-semibold text-foreground transition-all duration-300 sm:w-auto",
                "hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]",
              )}
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground/60">
            Já tem conta?
            <Link
              href={signinHref}
              className="ml-2 font-semibold text-[hsl(var(--accent))] transition-colors hover:text-[hsl(var(--accent)/0.8)]"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
