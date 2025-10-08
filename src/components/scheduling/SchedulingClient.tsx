"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppointmentWizard } from "@/components/scheduling/AppointmentWizard";
import { toast } from "sonner";

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

interface SchedulingClientProps {
  onSubmit: (data: AppointmentFormData & {
    service: Service;
    barber: Barber;
  }) => Promise<void>;
}

/**
 * Componente cliente para agendamento
 * 
 * Wrapper client-side que lida com navegação e notificações
 * após o sucesso do agendamento.
 */
export function SchedulingClient({ onSubmit }: SchedulingClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AppointmentFormData & {
    service: Service;
    barber: Barber;
  }) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      
      toast.success("Agendamento realizado com sucesso!", {
        description: `${data.service.name} agendado para ${data.date?.toLocaleDateString('pt-BR')} às ${data.time}`,
      });

      // Redirecionar para a página de gerenciamento
      router.push("/scheduling/manage");
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error("Erro ao realizar agendamento", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
        <AppointmentWizard onSubmit={handleSubmit} />
  );
}