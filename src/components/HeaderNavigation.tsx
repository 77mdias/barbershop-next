"use client";

//IMPORT DE DEPENDÊNCIAS
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  const { isAuthenticated, user } = useAuth();

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
          </Link>
          <span className={`font-poppins ${styles.textLogo} text-[hsl(var(--foreground))] text-xl font-bold italic`}>
            Ne
            <span className="font-poppins text-xl font-extrabold italic text-pink-600">
              XT
            </span>
          </span>
        </div>

        {/* Desktop Navigation - Coluna 2 (Centro) */}
        <nav className="flex items-center space-x-8 justify-center">
          <a
            href="/support"
            className={`${styles.linkText} group relative text-primary-50 transition-colors duration-200 hover:text-[var(--green-pastel)]`}
          >
            Suporte
            <span
              className={`${styles.bgGradient} absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full`}
            ></span>
          </a>
          <a
            href="/community"
            className={`${styles.linkText} group relative text-primary-50 transition-colors duration-200 hover:text-[var(--green-pastel)]`}
          >
            Comunidade
            <span
              className={`${styles.bgGradient} absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full`}
            ></span>
          </a>
          <a
            href="/prices"
            className={`${styles.linkText} group relative text-primary-50 transition-colors duration-200 hover:text-[var(--green-pastel)]`}
          >
            Preços
            <span
              className={`${styles.bgGradient} absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full`}
            ></span>
          </a>
          {user?.role === "ADMIN" && (
            <a
              href="/dashboard"
              className="group relative text-primary-50 transition-colors duration-200 hover:text-[var(--green-pastel)]"
            >
              Dashboard
              <span
                className={`${styles.bgGradient} absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full`}
              ></span>
            </a>
          )}
        </nav>

        {/* Botões de Ação - Coluna 3 (Direita) */}
        <div className="flex items-center justify-end space-x-4">
          {/* Aqui podem ser adicionados botões de login, perfil, etc. */}
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
            {user?.role === "ADMIN" && (
              <Link
                href="/dashboard"
                  className={`${styles.linkText} py-2 text-[var(--text)] transition-colors hover:text-[hsl(var(--soft-green))]`}
                  onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;