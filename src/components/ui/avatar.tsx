"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
// import { getInitials } from "@/lib/utils"
import styles from "@/app/components.module.scss";

interface AvatarProps {
  /** URL da imagem do avatar */
  src?: string;
  /** Nome completo para gerar iniciais como fallback */
  name?: string;
  /** Tamanho do avatar */
  size?: "sm" | "md" | "lg" | "xl";
  /** Classes CSS adicionais */
  className?: string;
  /** Texto alternativo para a imagem */
  alt?: string;
}

/**
 * Componente Avatar
 *
 * Exibe uma imagem de perfil com fallback para iniciais.
 * Usa Radix UI para acessibilidade.
 */
export function Avatar({
  src,
  name = "",
  size = "md",
  className,
  alt,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [src]);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  // const initials = getInitials(name)

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden",
        sizeClasses[size],
        styles.avatar,
        className
      )}
    >
      {src && !imageError ? (
        <>
          <img
            src={src}
            alt={alt || `Avatar de ${name}`}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
              <div className="w-1/2 h-1/2 bg-gray-300 rounded-full" />
            </div>
          )}
        </>
      ) : (
        <span className="font-medium text-gray-700 select-none">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
