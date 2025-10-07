"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { addMinutes, parseTime, formatDate } from "@/lib/date-utils";

interface TimeSlot {
  time: string; // "HH:mm" format
  available: boolean;
  reason?: string;
}

interface TimePickerProps {
  selectedTime?: string; // "HH:mm" format
  onTimeSelect: (time: string) => void;
  selectedDate?: Date;
  selectedBarberId?: string;
  serviceDuration?: number; // em minutos
  className?: string;
}

/**
 * Componente para seleção de horários
 * 
 * Exibe grid de horários disponíveis baseado na data e barbeiro selecionados.
 * Considera duração do serviço para verificar disponibilidade.
 * Segue o design system da aplicação.
 */
export function TimePicker({
  selectedTime,
  onTimeSelect,
  selectedDate,
  selectedBarberId,
  serviceDuration = 30,
  className,
}: TimePickerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Horários padrão de funcionamento
  const workingHours = {
    start: "09:00",
    end: "18:00",
    interval: 30, // minutos entre horários
  };

  // Gerar slots de horário
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startTime = parseTime(workingHours.start);
    const endTime = parseTime(workingHours.end);
    
    let currentTime = startTime;
    
    while (currentTime < endTime) {
      const timeStr = formatDate(currentTime, "HH:mm");
      
      // Mock logic - na implementação real, verificar disponibilidade via API
      const isAvailable = Math.random() > 0.3; // 70% dos horários disponíveis
      
      slots.push({
        time: timeStr,
        available: isAvailable,
        reason: !isAvailable ? "Horário ocupado" : undefined,
      });
      
      currentTime = addMinutes(currentTime, workingHours.interval);
    }
    
    return slots;
  };

  // Carregar horários disponíveis quando data/barbeiro mudam
  useEffect(() => {
    if (!selectedDate || !selectedBarberId) {
      setTimeSlots([]);
      return;
    }

    setLoading(true);
    
    // Simular delay de API
    const timer = setTimeout(() => {
      const slots = generateTimeSlots();
      setTimeSlots(slots);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedDate, selectedBarberId]);

  // Verificar se precisa mostrar mensagem de estado
  const shouldShowEmptyState = !selectedDate || !selectedBarberId;

  if (shouldShowEmptyState) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Selecione o Horário
        </h3>
        
        <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <User className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              Selecione primeiro a data e o barbeiro para ver os horários disponíveis
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Selecione o Horário
        </h3>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg border bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Selecione o Horário
        </h3>
        
        {selectedDate && (
          <p className="text-sm text-muted-foreground">
            {formatDate(selectedDate, "dd 'de' MMM")}
          </p>
        )}
      </div>

      {timeSlots.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum horário disponível para esta data
          </p>
        </div>
      ) : (
        <>
          {/* Grid de horários */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isAvailable = slot.available;
              
              return (
                <button
                  key={slot.time}
                  onClick={() => isAvailable && onTimeSelect(slot.time)}
                  disabled={!isAvailable}
                  title={slot.reason}
                  className={cn(
                    "h-12 rounded-lg border text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                    
                    // Estados base
                    isAvailable
                      ? "border-border bg-card hover:bg-accent hover:border-primary/50 cursor-pointer"
                      : "border-border/50 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60",
                    
                    // Estado selecionado
                    isSelected && isAvailable && [
                      "border-primary bg-primary text-primary-foreground",
                      "shadow-sm hover:bg-primary/90"
                    ],
                    
                    // Hover quando disponível e não selecionado
                    !isSelected && isAvailable && "hover:shadow-sm"
                  )}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>

          {/* Informações adicionais */}
          <div className="space-y-3">
            {selectedTime && (
              <div className="rounded-lg bg-primary/5 p-3">
                <p className="text-sm text-primary font-medium">
                  ✓ Horário selecionado: {selectedTime}
                </p>
                <p className="text-xs text-primary/70 mt-1">
                  Duração: {serviceDuration} minutos
                </p>
              </div>
            )}
            
            {/* Legenda */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded bg-primary" />
                Selecionado
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded bg-card border border-border" />
                Disponível
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded bg-muted" />
                Ocupado
              </span>
            </div>
            
            {/* Stats */}
            <div className="text-xs text-muted-foreground">
              {timeSlots.filter(slot => slot.available).length} de {timeSlots.length} horários disponíveis
            </div>
          </div>
        </>
      )}
    </div>
  );
}