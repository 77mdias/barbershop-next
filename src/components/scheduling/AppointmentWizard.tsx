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
  price: { toNumber(): number };
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
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Novo Agendamento</h1>
        <p className="text-muted-foreground">
          Selecione o serviço, barbeiro, data e horário para seu atendimento
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          {[
            { key: 'serviceId', icon: Scissors, label: 'Serviço' },
            { key: 'barberId', icon: User, label: 'Barbeiro' },
            { key: 'date', icon: Calendar, label: 'Data' },
            { key: 'time', icon: Clock, label: 'Horário' },
          ].map((step, index) => {
            const isCompleted = !!(formData as any)[step.key];
            const isActive = index === 0 || !!(formData as any)[Object.keys(formData)[index - 1]];
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                  isCompleted 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : isActive
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  isCompleted 
                    ? "text-primary" 
                    : isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
                {index < 3 && (
                  <div className="w-8 mx-4 h-px bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Passo 1: Escolha o Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceSelector
            selectedServiceId={formData.serviceId}
            onServiceSelect={handleServiceSelect}
          />
        </CardContent>
      </Card>

      {/* Step 2: Barber Selection */}
      {formData.serviceId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Passo 2: Escolha o Barbeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarberSelector
              selectedBarberId={formData.barberId}
              onBarberSelect={handleBarberSelect}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Date Selection */}
      {formData.barberId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Passo 3: Escolha a Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DatePicker
              selectedDate={formData.date}
              onDateSelect={handleDateSelect}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Time Selection */}
      {formData.date && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Passo 4: Escolha o Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimePicker
              selectedTime={formData.time}
              onTimeSelect={handleTimeSelect}
              selectedDate={formData.date}
              selectedBarberId={formData.barberId}
              serviceDuration={selectedService?.duration}
            />
          </CardContent>
        </Card>
      )}

      {/* Summary and Submit */}
      {isComplete && selectedService && selectedBarber && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Serviço</p>
                <p className="font-medium">{selectedService.name}</p>
                <p className="text-sm text-muted-foreground">
                  R$ {selectedService.price.toNumber().toFixed(2)} • {selectedService.duration} min
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Barbeiro</p>
                <p className="font-medium">{selectedBarber.name || 'Barbeiro'}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Data</p>
                <p className="font-medium">
                  {formData.date?.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Horário</p>
                <p className="font-medium">{formData.time}</p>
              </div>
            </div>
            
            <div className="border-t pt-4" />
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}