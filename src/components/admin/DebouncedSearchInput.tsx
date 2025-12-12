"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DebouncedSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  onDebouncedChange?: (value: string) => void;
  isSearching?: boolean;
  showClearButton?: boolean;
}

/**
 * DebouncedSearchInput Component
 *
 * Input de busca com debouncing automático para evitar chamadas excessivas à API.
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState("");
 *
 * <DebouncedSearchInput
 *   value={search}
 *   onChange={setSearch}
 *   onDebouncedChange={async (value) => {
 *     await performSearch(value);
 *   }}
 *   placeholder="Buscar usuários..."
 *   delay={500}
 * />
 * ```
 *
 * @param value - Valor atual do input
 * @param onChange - Callback chamado imediatamente quando o usuário digita
 * @param onDebouncedChange - Callback chamado após o delay (para busca)
 * @param delay - Tempo de debounce em ms (padrão: 500ms)
 * @param isSearching - Estado de loading externo
 * @param showClearButton - Mostrar botão de limpar (padrão: true)
 */
export function DebouncedSearchInput({
  value,
  onChange,
  onDebouncedChange,
  delay = 500,
  isSearching = false,
  showClearButton = true,
  placeholder = "Buscar...",
  className,
  ...props
}: DebouncedSearchInputProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isLoading = isSearching || internalLoading;

  // Debounced effect
  React.useEffect(() => {
    if (!onDebouncedChange) return;

    // Não fazer busca para strings muito curtas
    if (value.length > 0 && value.length < 2) {
      setInternalLoading(false);
      return;
    }

    setInternalLoading(true);

    const timeoutId = setTimeout(() => {
      onDebouncedChange(value);
      setInternalLoading(false);
    }, delay);

    // Cleanup: cancela o timeout se o valor mudar antes do delay
    return () => {
      clearTimeout(timeoutId);
      setInternalLoading(false);
    };
  }, [value, delay, onDebouncedChange]);

  const handleClear = () => {
    onChange("");
    if (onDebouncedChange) {
      onDebouncedChange("");
    }
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />

      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-10 pr-10", className)}
        {...props}
      />

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
        {isLoading && (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        )}

        {showClearButton && value.length > 0 && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
