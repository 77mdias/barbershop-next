import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilitário para combinar classes CSS de forma eficiente
 * - Usa clsx para condicionais e arrays
 * - Usa tailwind-merge para resolver conflitos de classes Tailwind
 * - Exemplo: cn("px-2 py-1", condition && "bg-blue-500", "px-4") → "py-1 bg-blue-500 px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata texto para exibição amigável
 * - Capitaliza primeira letra de cada palavra
 * - Remove underscores e hífens, substituindo por espaços
 */
export function formatDisplayText(text: string): string {
  return text
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Gera iniciais a partir de um nome completo
 * - Exemplo: "João Silva" → "JS"
 * - Máximo de 2 caracteres
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}