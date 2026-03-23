import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeroAction = {
  label: string;
  href: string;
  variant?: "primary" | "outline";
};

type PageHeroProps = {
  title: string;
  subtitle: string;
  badge?: string;
  actions?: PageHeroAction[];
  className?: string;
  children?: ReactNode;
};

export function PageHero({
  title,
  subtitle,
  badge,
  actions,
  className,
  children,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "grain-overlay relative overflow-hidden bg-surface-1 py-14 lg:py-20",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-1" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.07)] blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.05)] blur-[80px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="stagger-reveal mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          {badge ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {badge}
            </span>
          ) : null}

          <h1 className="font-display text-4xl font-bold italic tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-fg-muted sm:text-lg">{subtitle}</p>

          {actions && actions.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              {actions.map((action) => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                    action.variant === "outline"
                      ? "border border-border bg-transparent text-foreground hover:border-accent hover:text-accent"
                      : "gold-shimmer bg-accent text-on-accent hover:bg-accent/90",
                  )}
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </section>
  );
}
