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
      {/* Header com gradiente suave */}
      <div className="text-center mb-8 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Agendar Horário
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Complete as etapas abaixo para fazer seu agendamento
        </p>
      </div>

      {/* Progress Indicator com design moderno */}
      <div className="px-4 mb-8">
        <div className="relative">
          {/* Background line com gradiente */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gradient-to-r from-muted via-muted to-muted rounded-full" />
          
          {/* Progress line com gradiente colorido */}
          <div 
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ 
              width: `${(Object.keys(formData).filter(key => (formData as any)[key]).length / 4) * 100}%` 
            }}
          />
          
          {/* Steps com design aprimorado */}
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
                      "w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 shadow-lg",
                      isCompleted 
                        ? "border-primary bg-gradient-to-br from-primary to-accent text-white shadow-primary/20" 
                        : isActive
                          ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 text-primary shadow-primary/10"
                          : "border-muted-foreground/30 bg-background text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center mt-3 max-w-[60px] leading-tight transition-colors duration-200",
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

      {/* Step 1: Service Selection com design aprimorado */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-sm overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-muted/50 to-muted/30">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Scissors className="w-4 h-4 text-primary" />
              </div>
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

      {/* Step 2: Barber Selection com design aprimorado */}
      {formData.serviceId && (
        <div className="px-4 mb-6 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-sm overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-muted/50 to-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <User className="w-4 h-4 text-accent" />
                </div>
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

      {/* Step 3: Date Selection com design aprimorado */}
      {formData.barberId && (
        <div className="px-4 mb-6 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-sm overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-muted/50 to-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-soft-blue/10">
                  <Calendar className="w-4 h-4 text-soft-blue" />
                </div>
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

      {/* Step 4: Time Selection com design aprimorado */}
      {formData.date && (
        <div className="px-4 mb-6 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-sm overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-muted/50 to-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-soft-orange/10">
                  <Clock className="w-4 h-4 text-soft-orange" />
                </div>
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

      {/* Summary and Submit com design elegante */}
      {isComplete && selectedService && selectedBarber && (
        <div className="px-4 animate-in slide-in-from-top-5 duration-500">
          <div className="bg-gradient-to-br from-success/5 via-primary/5 to-accent/5 rounded-xl border border-primary/20 overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="p-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-success/20">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                Confirme seu Agendamento
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Service Info com design melhorado */}
              <div className="flex items-start justify-between p-4 bg-gradient-to-r from-card/80 to-card/60 rounded-xl border border-border/30 shadow-sm">
                <div className="flex-1">
                  <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1.5">Serviço</p>
                  <p className="font-semibold text-foreground text-lg">{selectedService.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedService.duration} min • R$ {Number(selectedService.price).toFixed(2)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scissors className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              {/* Barber Info com design melhorado */}
              <div className="flex items-start justify-between p-4 bg-gradient-to-r from-card/80 to-card/60 rounded-xl border border-border/30 shadow-sm">
                <div className="flex-1">
                  <p className="text-xs font-medium text-accent uppercase tracking-wide mb-1.5">Barbeiro</p>
                  <p className="font-semibold text-foreground text-lg">{selectedBarber.name || 'Barbeiro'}</p>
                </div>
                <div className="p-2 rounded-lg bg-accent/10">
                  <User className="w-5 h-5 text-accent" />
                </div>
              </div>
              
              {/* Date & Time Info com design em grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-soft-blue/10 to-soft-blue/5 rounded-xl border border-soft-blue/20 shadow-sm">
                  <p className="text-xs font-medium text-soft-blue uppercase tracking-wide mb-1.5">Data</p>
                  <p className="font-semibold text-foreground text-sm">
                    {formData.date?.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.date?.toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-soft-orange/10 to-soft-orange/5 rounded-xl border border-soft-orange/20 shadow-sm">
                  <p className="text-xs font-medium text-soft-orange uppercase tracking-wide mb-1.5">Horário</p>
                  <p className="font-semibold text-foreground text-sm">{formData.time}</p>
                </div>
              </div>
              
              {/* Botão de confirmação com gradiente */}
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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