import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeaderAction = {
  label: string;
  href: string;
};

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: SectionHeaderAction;
  centered?: boolean;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  action,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("space-y-2", centered ? "mx-auto max-w-2xl" : "max-w-2xl")}>
        <h2
          className={cn(
            "font-display text-3xl font-bold italic tracking-tight text-foreground sm:text-4xl",
            centered ? "accent-line accent-line-center" : "accent-line",
          )}
        >
          {title}
        </h2>
        {subtitle ? <p className="text-sm text-fg-muted sm:text-base">{subtitle}</p> : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
