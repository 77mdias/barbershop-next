"use client";

//IMPORT DE DEPENDÊNCIAS
import { useState } from "react";
import { useAuthSafe } from "@/hooks/useAuthSafe";
import { ClientOnlyAuth } from "./ClientOnlyAuth";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { NotificationBell } from "@/components/NotificationBell";
import { ChatBell } from "@/components/ChatBell";
import { ThemeToggle } from "@/components/ThemeToggle";

import MenuNavigation from "./MenuNavigation";
import styles from "@/app/scss/components/CourseCard.module.scss";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthSafe();

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-[65px] border-b border-border bg-background/60 backdrop-blur-md px-4">
      {/* Desktop Layout */}
      <div className="container mx-auto hidden md:grid grid-cols-3 h-full items-center">
        {/* Logo - Coluna 1 */}
        <div className="flex items-center justify-start">
          <Link href="/" className="flex items-center">
            <Image
              src="/Valorant-Academy.png"
              alt="Valorant Academy BR"
              width={32}
              height={32}
            />
            <span className={`font-poppins ${styles.textLogo} text-[hsl(var(--foreground))] text-xl font-bold italic`}>
              Ne
              <span className="font-poppins text-xl font-extrabold italic text-pink-600">
                XT
              </span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Coluna 2 (Centro) */}
        <nav className="flex items-center lg:space-x-8 lg:text-md md:space-x-2 md:text-sm justify-center">
          <Link
            href="/"
            className="text-[14px] font-normal text-muted-foreground hover:text-foreground transition-colors"
          >
            Início
          </Link>
          <Link
            href="/gallery"
            className="text-[14px] font-normal text-muted-foreground hover:text-foreground transition-colors"
          >
            Galeria
          </Link>
          <Link
            href="/community"
            className="text-[14px] font-normal text-muted-foreground hover:text-foreground transition-colors"
          >
            Comunidade
          </Link>
          <Link
            href="/scheduling"
            className="text-[14px] font-normal text-muted-foreground hover:text-foreground transition-colors"
          >
            Agendamento
          </Link>
          <Link
              href="/reviews"
              className="text-[14px] font-normal text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Avaliações
          </Link>
          <ClientOnlyAuth>
            {user?.role === "ADMIN" && (
              <a
                href="/dashboard"
                className="text-[14px] font-normal text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </a>
            )}
          </ClientOnlyAuth>
        </nav>

        {/* Botões de Ação - Coluna 3 (Direita) */}
        <div className="flex items-center justify-end space-x-4">
          <ThemeToggle />
          
          {/* Chat e Notificações - só aparecem para usuários autenticados */}
          <ClientOnlyAuth>
            {isAuthenticated && (
              <>
                <ChatBell currentUserId={user?.id || ""} />
                <NotificationBell />
              </>
            )}
          </ClientOnlyAuth>

          {/* Menu de Navegação */}
          <MenuNavigation />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="container mx-auto flex md:hidden h-16 items-center justify-between px-4">
        {/* Logo Mobile */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/Valorant-Academy.png"
              alt="Valorant Academy BR"
              width={32}
              height={32}
            />
            <span className={`font-poppins ${styles.textLogo} text-[hsl(var(--foreground))] text-xl font-bold italic`}>
              Ne
              <span className="font-poppins text-xl font-extrabold italic text-pink-600">
                XT
              </span>
            </span>
          </Link>
        </div>

        {/* Botões de Ação Mobile */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {/* Chat e Notificações Mobile - só aparecem para usuários autenticados */}
          <ClientOnlyAuth>
            {isAuthenticated && (
              <>
                <ChatBell currentUserId={user?.id || ""} />
                <NotificationBell />
              </>
            )}
          </ClientOnlyAuth>

          {/* Botão de Menu Mobile */}
          <button
            className="p-2 text-[var(--primary)]"
            onClick={handleMenuToggle}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="glass-card md:hidden">
          <nav className="flex flex-col space-y-4 p-4">
            <Link
              href="/support"
              className={`${styles.linkText} py-2 text-[var(--text)]  transition-colors hover:text-[hsl(var(--soft-green))]`}
              onClick={() => setIsMenuOpen(false)}
            >
              Suporte
            </Link>
            <Link
              href="/community"
              className={`${styles.linkText} py-2 text-[var(--text)] transition-colors hover:text-[hsl(var(--soft-green))]`}
              onClick={() => setIsMenuOpen(false)}
            >
              Comunidade
            </Link>
            <Link
              href="/prices"
              className={`${styles.linkText} py-2 text-[var(--text)] transition-colors hover:text-[hsl(var(--soft-green))]`}
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </Link>
            <Link
              href="/reviews"
              className={`${styles.linkText} py-2 text-[var(--text)] transition-colors hover:text-[hsl(var(--soft-green))]`}
              onClick={() => setIsMenuOpen(false)}
            >
              Avaliações
            </Link>
            <ClientOnlyAuth>
              {user?.role === "ADMIN" && (
                <Link
                  href="/dashboard"
                    className={`${styles.linkText} py-2 text-[var(--text)] transition-colors hover:text-[hsl(var(--soft-green))]`}
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