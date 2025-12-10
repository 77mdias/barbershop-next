"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  email?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base", 
  lg: "w-16 h-16 text-lg",
  xl: "w-20 h-20 text-xl"
};

/**
 * Componente UserAvatar
 * 
 * Exibe a imagem do usuário com fallback para iniciais ou ícone
 * Padroniza a exibição de avatares em toda a aplicação
 */
export function UserAvatar({
  src,
  alt,
  name,
  email,
  size = "md",
  className,
  fallbackClassName,
  showFallback = true,
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  
  // Resetar erro quando a src mudar
  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const displayName = name || email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();
  
  const shouldShowImage = src && !imageError;

  return (
    <div className={cn(
      "relative inline-block rounded-full overflow-hidden ",
      sizeClasses[size],
      className
    )}>
      {shouldShowImage ? (
        <img
          src={`${src}?t=${Date.now()}`}
          alt={alt || displayName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : showFallback ? (
        <div className={cn(
          "w-full h-full flex items-center justify-center text-white font-bold",
          fallbackClassName
        )}>
          {name || email ? initials : <User className="w-1/2 h-1/2" />}
        </div>
      ) : null}
    </div>
  );
}