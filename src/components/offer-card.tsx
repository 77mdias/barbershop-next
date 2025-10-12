"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "@/app/components.module.scss"

interface OfferCardProps {
  /** Título da oferta */
  title: string
  /** Desconto oferecido */
  discount: string
  /** Período da oferta */
  period: string
  /** Imagem de fundo (opcional) */
  backgroundImage?: string
  /** Função chamada quando o botão é clicado */
  onGetOffer?: () => void
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Componente OfferCard
 * 
 * Exibe uma oferta especial com desconto e período.
 * Baseado no design da imagem de referência.
 */
export function OfferCard({
  title,
  discount,
  period,
  backgroundImage,
  onGetOffer,
  className
}: OfferCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 sm:p-6",
        "text-white shadow-lg",
        styles.offerCard,
        className
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {/* Overlay para melhor legibilidade */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      {/* Conteúdo */}
      <div className={cn("relative flex items-center justify-between", styles.offerCard__content)}>
        {/* Informações da oferta */}
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold mb-1">{title}</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{discount}</p>
          <p className="text-xs sm:text-sm opacity-90">{period}</p>
        </div>

        {/* Botão de ação */}
        <button
          onClick={onGetOffer}
          className={cn(
            "ml-3 sm:ml-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full",
            "text-white font-medium text-xs sm:text-sm",
            "focus:outline-none focus:ring-2 focus:ring-white/50",
            "flex items-center gap-1 sm:gap-2",
            styles.offerCard__button
          )}
        >
          Get Offer Now
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
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
        </button>
      </div>
    </div>
  )
}