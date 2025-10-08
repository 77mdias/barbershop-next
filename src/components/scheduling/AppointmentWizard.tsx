"use client";

import { useState } from "react";
import { ServiceSelector } from "./ServiceSelector";
import { BarberSelector } from "./BarberSelector";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, User, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Barber {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AppointmentFormData {
  serviceId?: string;
  barberId?: string;
  date?: Date;
  time?: string;
}

interface AppointmentWizardProps {
  onSubmit: (data: AppointmentFormData & { 
    service: Service;
    barber: Barber;
  }) => Promise<void>;
  className?: string;
}

/**
 * Wizard completo para agendamento
 * 
 * Integra todos os componentes de seleção (serviço, barbeiro, data, horário)
 * em um fluxo linear guiado. Valida cada etapa antes de permitir avançar.
 */
export function AppointmentWizard({
  onSubmit,
  className,
}: AppointmentWizardProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar se todas as etapas estão completas
  const isComplete = !!(
    formData.serviceId &&
    formData.barberId &&
    formData.date &&
    formData.time
  );

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setFormData(prev => ({ 
      ...prev, 
      serviceId: service.id,
      // Reset seleções posteriores se serviço mudou
      ...(prev.serviceId !== service.id ? {
        barberId: undefined,
        date: undefined,
        time: undefined
      } : {})
    }));
    setSelectedBarber(null);
  };

  const handleBarberSelect = (barber: Barber) => {
    setSelectedBarber(barber);
    setFormData(prev => ({ 
      ...prev, 
      barberId: barber.id,
      // Reset seleções posteriores se barbeiro mudou
      ...(prev.barberId !== barber.id ? {
        date: undefined,
        time: undefined
      } : {})
    }));
  };

  const handleDateSelect = (date: Date) => {
    setFormData(prev => ({ 
      ...prev, 
      date,
      // Reset horário se data mudou
      ...(prev.date?.getTime() !== date.getTime() ? {
        time: undefined
      } : {})
    }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
  };

  const handleSubmit = async () => {
    if (!isComplete || !selectedService || !selectedBarber) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        service: selectedService,
        barber: selectedBarber,
      } as AppointmentFormData & { service: Service; barber: Barber });
    } catch (error) {
      console.error('Erro ao agendar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full max-w-sm mt-16 mx-auto pb-6", className)}>
      {/* Header */}
      <div className="text-center mb-6 px-4">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Agendar Horário</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Complete as etapas abaixo para fazer seu agendamento
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="px-4 mb-8">
        <div className="relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
          
          {/* Progress line */}
          <div 
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-300 ease-out"
            style={{ 
              width: `${(Object.keys(formData).filter(key => (formData as any)[key]).length / 4) * 100}%` 
            }}
          />
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {[
              { key: 'serviceId', icon: Scissors, label: 'Serviço' },
              { key: 'barberId', icon: User, label: 'Barbeiro' },
              { key: 'date', icon: Calendar, label: 'Data' },
              { key: 'time', icon: Clock, label: 'Horário' },
            ].map((step, index) => {
                const isCompleted = !!(formData as any)[step.key];
                const isActive = !isCompleted && (index === 0 || !!(formData as any)[Object.keys(formData)[index - 1]]);
                
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-all duration-200 relative z-10",
                      isCompleted 
                        ? "border-primary bg-primary text-primary-foreground shadow-lg" 
                        : isActive
                          ? "border-white bg-black text-white shadow-md"
                          : "border-muted-foreground/30 text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center mt-2 max-w-[60px] leading-tight",
                      isCompleted 
                        ? "text-primary font-semibold" 
                        : isActive
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Step 1: Service Selection */}
      <div className="px-4 mb-6">
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Scissors className="w-4 h-4 text-primary" />
              Escolha o Serviço
            </h3>
          </div>
          <div className="p-4">
            <ServiceSelector
              selectedServiceId={formData.serviceId}
              onServiceSelect={handleServiceSelect}
            />
          </div>
        </div>
      </div>

      {/* Step 2: Barber Selection */}
      {formData.serviceId && (
        <div className="px-4 mb-6">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Escolha o Barbeiro
              </h3>
            </div>
            <div className="p-4">
              <BarberSelector
                selectedBarberId={formData.barberId}
                onBarberSelect={handleBarberSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Date Selection */}
      {formData.barberId && (
        <div className="px-4 mb-6">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Escolha a Data
              </h3>
            </div>
            <div className="p-4">
              <DatePicker
                selectedDate={formData.date}
                onDateSelect={handleDateSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Time Selection */}
      {formData.date && (
        <div className="px-4 mb-6">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Escolha o Horário
              </h3>
            </div>
            <div className="p-4">
              <TimePicker
                selectedTime={formData.time}
                onTimeSelect={handleTimeSelect}
                selectedDate={formData.date}
                selectedBarberId={formData.barberId}
                serviceDuration={selectedService?.duration}
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary and Submit */}
      {isComplete && selectedService && selectedBarber && (
        <div className="px-4">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 overflow-hidden">
            <div className="p-4 border-b border-primary/20">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Confirme seu Agendamento
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Service Info */}
              <div className="flex items-start justify-between p-3 bg-card/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Serviço</p>
                  <p className="font-semibold text-foreground">{selectedService.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedService.duration} min • R$ {Number(selectedService.price).toFixed(2)}
                  </p>
                </div>
                <Scissors className="w-5 h-5 text-primary mt-1" />
              </div>
              
              {/* Barber Info */}
              <div className="flex items-start justify-between p-3 bg-card/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Barbeiro</p>
                  <p className="font-semibold text-foreground">{selectedBarber.name || 'Barbeiro'}</p>
                </div>
                <User className="w-5 h-5 text-primary mt-1" />
              </div>
              
              {/* Date & Time Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-card/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Data</p>
                  <p className="font-semibold text-foreground text-sm">
                    {formData.date?.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.date?.toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </p>
                </div>
                
                <div className="p-3 bg-card/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Horário</p>
                  <p className="font-semibold text-foreground text-sm">{formData.time}</p>
                </div>
              </div>
              
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}