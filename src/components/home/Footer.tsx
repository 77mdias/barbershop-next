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
    <footer className={cn("bg-surface-1 pt-20", className)}>
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="text-3xl font-extrabold text-foreground">
              <span>{brand.name}</span>
              <span className="ml-1 text-accent">{brand.highlight}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-fg-muted">
              {brand.description}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {social.map((item) => {
                const Icon = socialIconMap[item.icon] ?? Globe;
                return (
                  <Link
                    key={item.icon}
                    href={item.href}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-fg-muted transition hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-8 grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  {column.title}
                </h3>
                <ul className="space-y-2 text-sm text-fg-muted">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="transition hover:text-accent"
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
        <div className="mt-12 border-t border-border py-6 text-sm text-fg-subtle sm:flex sm:items-center sm:justify-between">
          <p>{copyright}</p>
          <div className="mt-4 flex flex-wrap gap-4 sm:mt-0">
            {legal.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-accent">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
