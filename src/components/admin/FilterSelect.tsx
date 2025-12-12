"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  placeholder?: string;
  label?: string;
  showReset?: boolean;
  resetLabel?: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * FilterSelect Component
 *
 * Componente de dropdown para filtros com suporte a reset e label.
 *
 * @example
 * ```tsx
 * const [role, setRole] = useState("all");
 *
 * <FilterSelect
 *   value={role}
 *   onChange={setRole}
 *   options={[
 *     { value: "all", label: "Todos os usuários" },
 *     { value: "CLIENT", label: "Clientes" },
 *     { value: "BARBER", label: "Barbeiros" },
 *     { value: "ADMIN", label: "Administradores" },
 *   ]}
 *   label="Filtrar por role"
 *   showReset
 * />
 * ```
 *
 * @param value - Valor atual do filtro
 * @param onChange - Callback quando o valor muda
 * @param options - Array de opções do dropdown
 * @param placeholder - Placeholder quando nenhum valor selecionado
 * @param label - Label opcional acima do select
 * @param showReset - Mostrar botão de reset (padrão: false)
 * @param resetLabel - Label do botão de reset (padrão: "Limpar")
 */
export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  label,
  showReset = false,
  resetLabel = "Limpar",
  className,
  disabled = false,
  icon,
}: FilterSelectProps) {
  const hasValue = value && value !== "all" && value !== "";

  const handleReset = () => {
    const defaultOption = options.find((opt) => opt.value === "all" || opt.value === "");
    if (defaultOption) {
      onChange(defaultOption.value);
    } else {
      onChange(options[0]?.value || "");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          {showReset && hasValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-auto py-1 px-2 text-xs text-gray-600 hover:text-gray-900"
            >
              <X className="w-3 h-3 mr-1" />
              {resetLabel}
            </Button>
          )}
        </div>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
            {icon}
          </div>
        )}

        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className={cn(icon && "pl-10")}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.icon && (
                  <span className="mr-2 inline-flex">{option.icon}</span>
                )}
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!label && showReset && hasValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-auto py-1 px-2 text-xs text-gray-600 hover:text-gray-900"
        >
          <X className="w-3 h-3 mr-1" />
          {resetLabel}
        </Button>
      )}
    </div>
  );
}
