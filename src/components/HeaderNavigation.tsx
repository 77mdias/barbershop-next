"use client";

import { useState } from "react";
import { useAuthSafe } from "@/hooks/useAuthSafe";
import { ClientOnlyAuth } from "./ClientOnlyAuth";
import { Menu, X, Scissors } from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "@/components/NotificationBell";
import { ChatBell } from "@/components/ChatBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import MenuNavigation from "./MenuNavigation";

const desktopNavLinks = [
  { href: "/", label: "Início" },
  { href: "/gallery", label: "Galeria" },
  { href: "/community", label: "Comunidade" },
  { href: "/scheduling", label: "Agendamento" },
  { href: "/reviews", label: "Avaliações" },
];

const mobileNavLinks = [
  { href: "/", label: "Início" },
  { href: "/gallery", label: "Galeria" },
  { href: "/community", label: "Comunidade" },
  { href: "/scheduling", label: "Agendamento" },
  { href: "/reviews", label: "Avaliações" },
  { href: "/prices", label: "Preços" },
  { href: "/support", label: "Suporte" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthSafe();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-[65px] border-b border-white/[0.07] bg-background/75 backdrop-blur-xl shadow-[0_1px_24px_-4px_rgba(0,0,0,0.4)] dark:bg-[hsl(30_10%_5%/0.80)]">
      {/* Desktop Layout */}
      <div className="container mx-auto hidden h-full grid-cols-3 items-center px-4 md:grid">
        {/* Logo */}
        <div className="flex items-center justify-start">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.12)] text-accent">
              <Scissors className="h-4 w-4" />
            </span>
            <span className="font-display text-xl font-bold italic text-foreground">
              Barber<span className="text-accent">Kings</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex items-center justify-center gap-6">
          {desktopNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] font-normal text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <ClientOnlyAuth>
            {user?.role === "ADMIN" && (
              <a
                href="/dashboard"
                className="text-[14px] font-normal text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </a>
            )}
          </ClientOnlyAuth>
        </nav>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />
          <ClientOnlyAuth>
            {isAuthenticated && (
              <>
                <ChatBell currentUserId={user?.id || ""} />
                <NotificationBell />
              </>
            )}
          </ClientOnlyAuth>
          <MenuNavigation />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="container mx-auto flex h-full items-center justify-between px-4 md:hidden">
        {/* Logo Mobile */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.12)] text-accent">
            <Scissors className="h-3.5 w-3.5" />
          </span>
          <span className="font-display text-lg font-bold italic text-foreground">
            Barber<span className="text-accent">Kings</span>
          </span>
        </Link>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ClientOnlyAuth>
            {isAuthenticated && (
              <>
                <ChatBell currentUserId={user?.id || ""} />
                <NotificationBell />
              </>
            )}
          </ClientOnlyAuth>
          <button
            className="rounded-md p-2 text-accent transition-colors hover:bg-[hsl(var(--accent)/0.08)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-white/[0.07] bg-background/90 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col px-4 py-3">
            {mobileNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <ClientOnlyAuth>
              {user?.role === "ADMIN" && (
                <Link
                  href="/dashboard"
                  className="py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </ClientOnlyAuth>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
