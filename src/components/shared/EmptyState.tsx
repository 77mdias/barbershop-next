import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-border bg-surface-card px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-accent">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-semibold italic text-foreground">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-fg-muted sm:text-base">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
