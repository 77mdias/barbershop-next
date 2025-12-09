import { Search, ArrowRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HeroSectionContent } from "@/types/home";

const wrapperVariants = cva(
  "mx-auto flex max-w-4xl flex-col items-center gap-6 text-center",
  {
    variants: {
      align: {
        center: "items-center text-center",
        left: "items-start text-left md:text-left",
      },
    },
    defaultVariants: {
      align: "center",
    },
  },
);

const sizeConfig = {
  md: {
    input: "h-12 text-base",
    button: "h-12 px-6 text-base",
  },
  lg: {
    input: "h-14 text-lg",
    button: "h-14 px-7 text-lg",
  },
} as const satisfies Record<string, { input: string; button: string }>;

type HeroSearchProps = HeroSectionContent &
  VariantProps<typeof wrapperVariants> & {
    size?: keyof typeof sizeConfig;
    className?: string;
  };

export function HeroSearch({
  title,
  subtitle,
  placeholder,
  ctaLabel,
  action,
  defaultQuery,
  align,
  size = "lg",
  className,
}: HeroSearchProps) {
  const tokens = sizeConfig[size] ?? sizeConfig.lg;

  return (
    <section className={cn("w-full bg-surface-1 py-16 sm:py-20", className)}>
      <div className="container mx-auto px-4">
        <div className={wrapperVariants({ align })}>
          <span className="inline-flex items-center rounded-full bg-badge-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-badge-fg">
            Experiência premium
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-fg-muted sm:text-lg">
            {subtitle}
          </p>
          <form
            action={action}
            method="GET"
            className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle" />
              <Input
                name="query"
                defaultValue={defaultQuery}
                placeholder={placeholder}
                className={cn(
                  "w-full rounded-full border border-border bg-surface-2 pl-12 pr-14 text-foreground shadow-soft",
                  "placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent/30",
                  tokens.input,
                )}
              />
              <ArrowRight className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle" />
            </div>
            <Button
              type="submit"
              className={cn(
                "rounded-full bg-accent text-on-accent shadow-soft transition hover:bg-accent/90",
                tokens.button,
              )}
            >
              {ctaLabel}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
