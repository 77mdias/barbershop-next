import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HeroSectionContent } from "@/types/home";

type HeroSearchProps = HeroSectionContent & {
  size?: "md" | "lg";
  className?: string;
};

export function HeroSearch({
  title,
  subtitle,
  placeholder,
  ctaLabel,
  action,
  defaultQuery,
  className,
}: HeroSearchProps) {
  return (
    <section
      className={cn(
        "grain-overlay relative w-full overflow-hidden bg-surface-1 py-20 sm:py-24 lg:py-32",
        className,
      )}
    >
      {/* Atmospheric gradient layers */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-1" />
      <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-[hsl(var(--accent)/0.06)] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-[hsl(var(--accent)/0.04)] blur-[100px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="stagger-reveal mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          {/* Premium badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
            Experiência premium
          </span>

          {/* Main heading */}
          <h1 className="font-display text-5xl font-bold italic tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {subtitle}
          </p>

          {/* Search form */}
          <form
            action={action}
            method="GET"
            className="mt-4 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                name="query"
                defaultValue={defaultQuery}
                placeholder={placeholder}
                className={cn(
                  "h-14 w-full rounded-xl border border-border bg-background pl-12 pr-14 text-lg text-foreground",
                  "placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent)/0.5)] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)]",
                  "backdrop-blur-sm transition-all duration-300",
                )}
              />
              <ArrowRight className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/30" />
            </div>
            <Button
              type="submit"
              className={cn(
                "gold-shimmer h-14 rounded-xl bg-accent px-8 text-lg font-semibold text-on-accent shadow-lg transition-all duration-300",
                "hover:bg-accent/90 hover:shadow-[0_8px_30px_-4px_hsl(var(--accent)/0.4)]",
              )}
            >
              {ctaLabel}
            </Button>
          </form>

          {/* Decorative accent line */}
          <div className="mt-4 flex items-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[hsl(var(--accent)/0.4)]" />
            <div className="h-1.5 w-1.5 rotate-45 border border-[hsl(var(--accent)/0.4)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[hsl(var(--accent)/0.4)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
