"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import styles from "@/app/components.module.scss"

interface HeaderProps {
  userName?: string
  userImage?: string
  onFilterClick?: () => void
  className?: string
}

/**
 * Componente Header da aplicação
 * 
 * Exibe saudação personalizada, avatar do usuário e botão de filtro
 * baseado no design da imagem de referência
 */
export function Header({
  userName = "User",
  userImage,
  onFilterClick,
  className
}: HeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning!"
    if (hour < 18) return "Good afternoon!"
    return "Good evening!"
  }



  return (
    <header className={cn(
      "flex gap-4 align-center justify-between items-center w-full p-4 sm:p-6 text-black",
      styles.header,
      className
    )}>
      {/* Seção esquerda - Saudação e Avatar */}
      <div className="flex items-center gap-3">
        <div className={styles.avatar}>
          <Avatar 
            src={userImage}
            name={userName}
            size="md"
            alt={userName}
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm text-gray-700">
            Hello {userName}
          </span>
          <span className={cn(
            "text-base sm:text-lg font-semibold",
            styles.header__greeting
          )}>
            {getGreeting()}
          </span>
        </div>
      </div>

      {/* Seção direita - Botão de filtro */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onFilterClick}
        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 hover:scale-105"
      >
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
          />
        </svg>
      </Button>
    </header>
  )
}