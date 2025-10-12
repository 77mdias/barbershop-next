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
    <header className="glass-card fixed left-0 right-0 top-0 z-50 ">
      {/* Desktop Layout */}
      <div className="container mx-auto hidden md:grid grid-cols-3 h-16 items-center px-4">
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
        <nav className="flex items-center space-x-8 justify-center">
          <Link
            href="/"
            className={`${styles.linkText} group relative text-[var(--text)] transition-colors duration-200 `}
          >
            Início
            <span
              className={`${styles.bgGradient} absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full`}
            ></span>
          </Link>
          <Link
            href="/gallery"
            className={`${styles.linkText} group relative text-[var(--text)] transition-colors duration-200 `}
          >
            Galeria
            <span
              className={`${styles.bgGradient} absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full`}
            ></span>
          </Link>
          <Link
            href="/community"
            className={`${styles.linkText} group relative text-[var(--text)] transition-colors duration-200 `}
          >
            Comunidade
            <span
              className={`${styles.bgGradient} absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full`}
            ></span>
          </Link>
          <Link
            href="/scheduling"
            className={`${styles.linkText} group relative text-[var(--text)] transition-colors duration-200 `}
          >
            Agendamento
            <span
              className={`${styles.bgGradient} absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full`}
            ></span>
          </Link>
          <Link
              href="/reviews"
              className={`${styles.linkText} group relative text-[var(--text)] transition-colors duration-200 `}
              onClick={() => setIsMenuOpen(false)}
            >
              Avaliações
          </Link>
          <ClientOnlyAuth>
            {user?.role === "ADMIN" && (
              <a
                href="/dashboard"
                className="group relative text-[var(--foreground)] transition-colors duration-200 hover:text-[var(--green-pastel)]"
              >
                Dashboard
                <span
                  className={`${styles.bgGradient} absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full`}
                ></span>
              </a>
            )}
          </ClientOnlyAuth>
        </nav>

        {/* Botões de Ação - Coluna 3 (Direita) */}
        <div className="flex items-center justify-end space-x-4">
          {/* Aqui podem ser adicionados botões de login, perfil, etc. */}
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

        {/* Botão de Menu Mobile */}
        <button
          className="p-2 text-[var(--primary)]"
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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