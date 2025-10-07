"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  addDays, 
  isSameDay, 
  startOfDay, 
  isBefore, 
  formatDate,
  isToday
} from "@/lib/date-utils";

interface DatePickerProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

/**
 * Componente para selecionar data
 * 
 * Exibe um calendário horizontal com navegação por semana.
 * Permite seleção de data seguindo o design system da aplicação.
 */
export function DatePicker({
  selectedDate,
  onDateSelect,
  className,
  minDate = new Date(),
  maxDate = addDays(new Date(), 30),
  disabledDates = [],
}: DatePickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = startOfDay(new Date());
    return today;
  });

  // Gera array de 7 dias a partir do início da semana atual
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(currentWeekStart, i);
  });

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    
    // Verifica se é anterior a hoje
    if (isBefore(date, today)) return true;
    
    // Verifica se está fora do range permitido
    if (minDate && isBefore(date, startOfDay(minDate))) return true;
    if (maxDate && isBefore(maxDate, date)) return true;
    
    // Verifica se está na lista de datas desabilitadas
    return disabledDates.some(disabledDate => 
      isSameDay(date, disabledDate)
    );
  };

  const isDateSelected = (date: Date) => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  };

  const canGoPrevious = () => {
    const firstDayOfWeek = currentWeekStart;
    const today = startOfDay(new Date());
    return !isBefore(firstDayOfWeek, today);
  };

  const canGoNext = () => {
    const lastDayOfWeek = addDays(currentWeekStart, 6);
    return !isBefore(maxDate, lastDayOfWeek);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Selecione a Data
        </h3>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            disabled={!canGoPrevious()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            disabled={!canGoNext()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Header com mês/ano */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {formatDate(currentWeekStart, "MMMM 'de' yyyy")}
        </p>
      </div>

      {/* Grid de dias da semana */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          const isDateToday = isToday(date);
          
          return (
            <button
              key={index}
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "min-h-[80px] relative",
                
                // Estados base
                isDisabled
                  ? "border-border/50 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
                  : "border-border bg-card hover:bg-accent hover:border-primary/50 cursor-pointer",
                
                // Estado selecionado
                isSelected && !isDisabled && "border-primary bg-primary text-primary-foreground shadow-sm",
                
                // Hover (apenas se não estiver selecionado)
                !isSelected && !isDisabled && "hover:shadow-sm"
              )}
            >
              {/* Indicador de hoje */}
              {isDateToday && !isSelected && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              )}
              
              {/* Dia da semana */}
              <span className={cn(
                "text-xs font-medium mb-1",
                isSelected ? "text-primary-foreground" : "text-muted-foreground"
              )}>
                {formatDate(date, "EEE")}
              </span>
              
              {/* Número do dia */}
              <span className={cn(
                "text-lg font-semibold",
                isSelected 
                  ? "text-primary-foreground" 
                  : isDisabled 
                    ? "text-muted-foreground" 
                    : "text-foreground"
              )}>
                {formatDate(date, "dd")}
              </span>
              
              {/* Status */}
              <span className={cn(
                "text-xs mt-1",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {isDisabled 
                  ? "Indisponível" 
                  : isDateToday 
                    ? "Hoje" 
                    : "Disponível"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Informação adicional */}
      {selectedDate && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            ✓ Data selecionada: {formatDate(selectedDate, "EEEE, dd 'de' MMMM")}
          </p>
        </div>
      )}
    </div>
  );
}