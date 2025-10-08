import { SchedulingClient } from "@/components/scheduling/SchedulingClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createAppointment } from "@/server/appointmentActions";

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

/**
 * Página principal de agendamento
 * 
 * Permite aos usuários autenticados criar novos agendamentos
 * através do wizard interativo. Integra com as server actions
 * para persistir os dados no banco.
 */
export default async function SchedulingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const handleAppointmentSubmit = async (data: AppointmentFormData & {
    service: Service;
    barber: Barber;
  }) => {
    "use server";
    
    try {
      if (!data.date || !data.time || !data.serviceId || !data.barberId) {
        throw new Error("Dados incompletos para agendamento");
      }

      // Combinar data e hora em um objeto Date
      const [hours, minutes] = data.time.split(':').map(Number);
      const appointmentDate = new Date(data.date);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const result = await createAppointment({
        serviceId: data.serviceId,
        barberId: data.barberId,
        date: appointmentDate,
        notes: `Agendamento de ${data.service.name} com ${data.barber.name || 'barbeiro'}`,
      });

      if (result.success) {
        // Agendamento criado com sucesso
        return;
      } else {
        throw new Error(result.error || "Erro ao criar agendamento");
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      throw error;
    }
  };

  return (
    <SchedulingClient onSubmit={handleAppointmentSubmit} />
  );
}