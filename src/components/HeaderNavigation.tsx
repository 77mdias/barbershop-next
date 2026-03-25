"use client";

import { useEffect, useState } from "react";
import { useAuthSafe } from "@/hooks/useAuthSafe";
import { ClientOnlyAuth } from "./ClientOnlyAuth";
import { Menu, X, Scissors, UserCircle, LogIn } from "lucide-react";
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

const navInteractiveClassName =
  "rounded-md px-2 py-1 text-[14px] font-normal text-muted-foreground transition-all duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]";
const mobileNavInteractiveClassName =
  "rounded-md py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthSafe();

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed left-0 right-0 top-0 z-[var(--layer-header)] h-[65px] border-b border-white/[0.07] bg-background/75 backdrop-blur-xl shadow-[0_1px_24px_-4px_rgba(0,0,0,0.4)] dark:bg-[hsl(30_10%_5%/0.80)]">
      {/* Desktop Layout */}
      <div className="container mx-auto hidden h-full grid-cols-3 items-center px-4 md:grid">
        {/* Logo */}
        <div className="flex items-center justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
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
              className={navInteractiveClassName}
            >
              {link.label}
            </Link>
          ))}
          <ClientOnlyAuth>
            {user?.role === "ADMIN" && (
              <a
                href="/dashboard"
                className={navInteractiveClassName}
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
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
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
            className="rounded-md p-2 text-accent transition-all duration-200 hover:bg-[hsl(var(--accent)/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-panel"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-[65px] z-[var(--layer-overlay)] bg-black/55 md:hidden"
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            id="mobile-navigation-panel"
            className="fixed inset-x-0 bottom-0 top-[65px] z-[var(--layer-mobile-menu)] overflow-y-auto border-t border-white/[0.07] bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col px-4 py-3">
              {mobileNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={mobileNavInteractiveClassName}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <ClientOnlyAuth>
                {user?.role === "ADMIN" && (
                  <Link
                    href="/dashboard"
                    className={mobileNavInteractiveClassName}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
              </ClientOnlyAuth>

              {/* Profile / Auth separator */}
              <div className="my-1 border-t border-white/[0.07]" />

              <ClientOnlyAuth>
                {isAuthenticated ? (
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 rounded-md py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="h-4 w-4 shrink-0 text-accent" />
                    {user?.name ? user.name : "Meu Perfil"}
                  </Link>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-2.5 rounded-md py-2.5 text-sm font-medium text-accent transition-all duration-200 hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4 shrink-0" />
                    Entrar
                  </Link>
                )}
              </ClientOnlyAuth>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
