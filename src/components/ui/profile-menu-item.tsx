"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ProfileMenuItemProps {
  /**
   * Ícone do menu item (elemento SVG ou React node)
   */
  icon: React.ReactNode;
  
  /**
   * Label/texto do menu item
   */
  label: string;
  
  /**
   * URL de navegação (quando usando Link do Next.js)
   */
  href?: string;
  
  /**
   * Função de clique customizada (quando não usar href)
   */
  onClick?: () => void;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
  
  /**
   * Se deve usar cursor pointer mesmo sem href/onClick
   */
  clickable?: boolean;
}

/**
 * Componente de item de menu para a página de perfil
 * 
 * Oferece suporte a navegação via Link do Next.js ou onClick customizado.
 * Mantém o design visual consistente com a estrutura original.
 */
export function ProfileMenuItem({
  icon,
  label,
  href,
  onClick,
  className,
  clickable = true,
}: ProfileMenuItemProps) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[--text] font-medium">{label}</span>
      </div>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </>
  );

  const baseClassName = cn(
    "flex items-center justify-between text-[var(--foreground)] p-4 rounded-lg border transition-all",
    "hover:transform hover:translate-x-1 hover:border-blue-100 hover:shadow-sm",
    "cursor-pointer",
    className
  );

  // Se tiver href, usar Link do Next.js
  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {content}
      </Link>
    );
  }

  // Se tiver onClick, usar div com clique
  if (onClick) {
    return (
      <div onClick={onClick} className={baseClassName}>
        {content}
      </div>
    );
  }

  // Caso contrário, apenas div sem interação
  return (
    <div className={cn(baseClassName, !clickable && "cursor-default")}>
      {content}
    </div>
  );
}