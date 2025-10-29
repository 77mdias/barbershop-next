"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "@/app/components.module.scss";

interface SalonCardProps {
  /** Nome do salão */
  name: string;
  /** URL da imagem do salão */
  image: string;
  /** Avaliação do salão (0-5) */
  rating: number;
  /** Número de avaliações */
  reviewCount: number;
  /** Localização do salão */
  location: string;
  /** Distância do usuário */
  distance: string;
  /** Função chamada quando o card é clicado */
  onClick?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente SalonCard
 *
 * Exibe informações de um salão próximo com imagem, avaliação e localização.
 * Baseado no design da imagem de referência.
 */
export function SalonCard({
  name,
  image,
  rating,
  reviewCount,
  location,
  distance,
  onClick,
  className,
}: SalonCardProps) {
  // Função para renderizar as estrelas de avaliação
  const renderStars = (rating: number): React.ReactElement[] => {
    const stars: React.ReactElement[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }

    // Estrela pela metade
    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400"
          viewBox="0 0 24 24"
        >
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-star)"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      );
    }

    // Estrelas vazias
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200",
        "border border-gray-100",
        styles.salonCard,
        className
      )}
    >
      {/* Imagem do salão */}
      <div
        className={cn(
          "relative h-24 sm:h-32 overflow-hidden",
          styles.salonCard__image
        )}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback para imagem padrão
            e.currentTarget.src = "/images/salon-placeholder.jpg";
          }}
        />
      </div>

      {/* Informações do salão */}
      <div className="p-3 sm:p-4 bg-card">
        {/* Nome do salão */}
        <h3 className="font-semibold text-foreground mb-1 sm:mb-2 truncate text-sm sm:text-base">
          {name}
        </h3>

        {/* Avaliação */}
        <div
          className={cn(
            "flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2",
            styles.salonCard__rating
          )}
        >
          <div className="flex items-center">{renderStars(rating)}</div>
          <span className="text-xs sm:text-sm text-gray-600">
            {rating} ({reviewCount})
          </span>
        </div>

        {/* Localização e distância */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <span className="truncate">{location}</span>
          <span className="ml-2 font-medium">{distance}</span>
        </div>
      </div>
    </div>
  );
}
