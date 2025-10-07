import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserAppointments } from "@/server/appointmentActions";
import { AppointmentsList } from "@/components/scheduling/AppointmentsList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";

/**
 * Página de gerenciamento de agendamentos
 * 
 * Exibe lista de agendamentos do usuário com filtros,
 * opções de cancelamento e histórico completo.
 */
export default async function ManageAppointmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Buscar agendamentos do usuário
  const appointmentsResult = await getUserAppointments({
    page: 1,
    limit: 10,
    status: undefined, // Todos os status
  });

  const appointments = appointmentsResult.success ? appointmentsResult.data : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Meus Agendamentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus agendamentos e histórico de serviços
            </p>
          </div>
          
          <Button asChild size="lg">
            <Link href="/scheduling" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Link>
          </Button>
        </div>

        {/* Lista de agendamentos */}
        <AppointmentsList 
          initialAppointments={appointments?.appointments || []}
          totalCount={appointments?.pagination.total || 0}
          currentPage={appointments?.pagination.page || 1}
          totalPages={appointments?.pagination.totalPages || 1}
        />
      </div>
    </div>
  );
}