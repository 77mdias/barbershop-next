"use client";

import { cn } from "@/lib/utils";

interface DemoBadgeProps {
  /**
   * Tamanho do badge
   */
  size?: "sm" | "md" | "lg";
  
  /**
   * Variante visual
   */
  variant?: "gradient" | "solid" | "outline";
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
  
  /**
   * Texto personalizado (padrão: "DEMO")
   */
  text?: string;
  
  /**
   * Mostrar ícone de circo
   */
  showIcon?: boolean;
}

/**
 * Badge para indicar modo de demonstração
 * 
 * Usado em componentes que simulam funcionalidades para vendas/demos
 */
export function DemoBadge({
  size = "md",
  variant = "gradient",
  className,
  text = "DEMO",
  showIcon = true,
}: DemoBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  const variantClasses = {
    gradient: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
    solid: "bg-blue-600 text-white",
    outline: "border-2 border-blue-500 text-blue-600 bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium shadow-sm",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {showIcon && <span>🎪</span>}
      <span>{text}</span>
    </div>
  );
}