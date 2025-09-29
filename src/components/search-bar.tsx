"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "@/app/components.module.scss"

interface SearchBarProps {
  /** Placeholder do input de busca */
  placeholder?: string
  /** Valor atual da busca */
  value?: string
  /** Função chamada quando o valor muda */
  onChange?: (value: string) => void
  /** Função chamada quando o formulário é submetido */
  onSubmit?: (value: string) => void
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Componente SearchBar
 * 
 * Barra de busca com ícone e funcionalidade de pesquisa.
 * Baseado no design da imagem de referência.
 */
export function SearchBar({
  placeholder = "Search...",
  value = "",
  onChange,
  onSubmit,
  className
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(value)

  // Sincroniza valor interno com prop externa
  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(internalValue)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className={cn("relative", styles.searchBar)}>
        {/* Ícone de busca */}
        <div className={cn(
          "absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2",
          styles.searchBar__icon
        )}>
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input de busca */}
        <input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-2xl border border-gray-200",
            "bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base",
            "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent",
            "transition-all duration-200"
          )}
        />
      </div>
    </form>
  )
}