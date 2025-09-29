import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Variantes do componente Button
 * - default: botão principal com cor primária
 * - destructive: para ações destrutivas (deletar, cancelar)
 * - outline: botão com borda, fundo transparente
 * - secondary: botão secundário com cor neutra
 * - ghost: botão sem fundo, apenas texto
 * - link: estilo de link, sem bordas
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Componente Button reutilizável
 * 
 * @param variant - Estilo visual do botão (default, destructive, outline, etc.)
 * @param size - Tamanho do botão (default, sm, lg, icon)
 * @param asChild - Se true, renderiza como Slot para composição
 * @param className - Classes CSS adicionais
 * @param children - Conteúdo do botão
 * 
 * @example
 * ```tsx
 * <Button variant="default" size="lg">
 *   Agendar Horário
 * </Button>
 * 
 * <Button variant="outline" size="sm">
 *   Cancelar
 * </Button>
 * 
 * <Button variant="ghost" size="icon">
 *   <Search className="h-4 w-4" />
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }