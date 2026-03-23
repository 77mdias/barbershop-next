import type { ComponentType } from "react";
import Link from "next/link";
import { Facebook, Globe, Instagram, Music2, Youtube } from "lucide-react";
import type { HomePageData } from "@/types/home";
import { cn } from "@/lib/utils";

type FooterProps = HomePageData["footer"] & {
  className?: string;
};

const socialIconMap: Record<FooterProps["social"][number]["icon"], ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music2,
};

export function Footer({ brand, columns, legal, social, copyright, className }: FooterProps) {
  return (
    <footer className={cn("bg-surface-2 pt-20", className)}>
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand column */}
          <div className="md:col-span-4">
            <div className="font-display text-3xl font-bold italic text-foreground">
              <span>{brand.name}</span>
              <span className="ml-1 text-[hsl(var(--accent))]">{brand.highlight}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {brand.description}
            </p>
            <div className="mt-3 h-0.5 w-10 bg-[hsl(var(--accent)/0.4)]" />
            <div className="mt-6 flex items-center gap-3">
              {social.map((item) => {
                const Icon = socialIconMap[item.icon] ?? Globe;
                return (
                  <Link
                    key={item.icon}
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300",
                      "hover:border-[hsl(var(--accent)/0.5)] hover:text-[hsl(var(--accent))]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid gap-8 sm:grid-cols-3 md:col-span-8">
            {columns.map((column) => (
              <div key={column.title} className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                  {column.title}
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="transition-colors duration-300 hover:text-[hsl(var(--accent))]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-border/30 py-6 text-sm text-muted-foreground/40 sm:flex sm:items-center sm:justify-between">
          <p>{copyright}</p>
          <div className="mt-4 flex flex-wrap gap-6 sm:mt-0">
            {legal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors duration-300 hover:text-[hsl(var(--accent))]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
