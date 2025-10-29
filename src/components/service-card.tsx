"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "@/app/components.module.scss";

interface ServiceCardProps {
  /** Nome do serviço */
  name: string;
  /** Ícone do serviço (emoji ou componente) */
  icon: React.ReactNode;
  /** Se o serviço está ativo/selecionado */
  isActive?: boolean;
  /** Função chamada quando o card é clicado */
  onClick?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente ServiceCard
 *
 * Exibe um card de serviço com ícone e nome.
 * Baseado no design da imagem de referência com estado ativo.
 */
export function ServiceCard({
  name,
  icon,
  isActive = false,
  onClick,
  className,
}: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        "flex flex-col items-center bg-card justify-center p-3 sm:p-4 rounded-2xl transition-all duration-300",
        "min-w-[80px] sm:min-w-[90px] h-[80px] sm:h-[90px] gap-1 sm:gap-2",
        "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2",
        styles.serviceCard,

        // Estado inativo
        !isActive && [
          "hover:bg-gray-50 hover:border-gray-200",
          "shadow-sm hover:shadow-md",
        ],

        // Estado ativo
        isActive && [
          "shadow-lg shadow-primary-500/25",
          styles["serviceCard--active"],
        ],

        className
      )}
      aria-pressed={isActive}
      aria-label={`Select ${name} service`}
    >
      {/* Ícone do serviço */}
      <div
        className={cn(
          "text-xl sm:text-2xl transition-transform duration-300",
          styles.serviceCard__icon,
          isActive && "scale-110"
        )}
      >
        {icon}
      </div>

      {/* Nome do serviço */}
      <span
        className={cn(
          "text-xs sm:text-sm font-medium transition-colors duration-300",
          styles.serviceCard__name,
          isActive ? "text-[--all-black]" : "text-[--text]"
        )}
      >
        {name}
      </span>
    </button>
  );
}
