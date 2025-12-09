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
    <section className={cn("w-full bg-surface-emphasis py-20", className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            {title}
          </h2>
          <p className="text-base text-fg-muted sm:text-lg">
            {description}
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="w-full rounded-full bg-accent text-on-accent shadow-soft hover:bg-accent/90 sm:w-auto"
            >
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full rounded-full border border-border bg-surface-1 text-foreground hover:border-accent hover:text-accent sm:w-auto"
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>
          <p className="text-sm text-fg-muted">
            Já tem conta?
            <Link href={signinHref} className="ml-2 font-semibold text-accent">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
