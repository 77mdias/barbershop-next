"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "@/app/components.module.scss"

interface NavigationItem {
  /** ID único do item */
  id: string
  /** Rótulo do item */
  label: string
  /** Ícone do item */
  icon: React.ReactNode
  /** URL de destino (opcional) */
  href?: string
}

interface BottomNavigationProps {
  /** Lista de itens de navegação */
  items: NavigationItem[]
  /** ID do item ativo */
  activeItem?: string
  /** Função chamada quando um item é clicado */
  onItemClick?: (itemId: string) => void
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Componente BottomNavigation
 * 
 * Navegação inferior com ícones e labels.
 * Baseado no design da imagem de referência.
 */
export function BottomNavigation({
  items,
  activeItem,
  onItemClick,
  className
}: BottomNavigationProps) {
  const handleItemClick = (item: NavigationItem) => {
    onItemClick?.(item.id)
    
    // Se tem href, navega para a URL
    if (item.href) {
      window.location.href = item.href
    }
  }

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 px-4 py-2 safe-area-pb",
      styles.bottomNav,
      className
    )}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive = activeItem === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                "min-w-[50px] sm:min-w-[60px] min-h-[50px] sm:min-h-[60px]",
                "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2",
                styles.bottomNav__item,
                isActive && styles["bottomNav__item--active"],
                !isActive && "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Ícone */}
              <div className={cn(
                "transition-all duration-200",
                styles.bottomNav__icon,
                isActive && "scale-110"
              )}>
                {item.icon}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-xs font-medium mt-0.5 sm:mt-1 transition-colors duration-200",
                styles.bottomNav__label,
                isActive ? "text-primary-600" : "text-gray-500"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}