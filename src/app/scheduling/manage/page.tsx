import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAppointments } from "@/server/appointmentActions";
import { AppointmentsList } from "@/components/scheduling/AppointmentsList";
import { PageHero } from "@/components/shared/PageHero";

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

  const appointmentsResult = await getAppointments({
    page: 1,
    limit: 10,
    status: undefined,
  });

  const appointments = appointmentsResult.success ? appointmentsResult.data : null;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Agenda"
        title="Meus Agendamentos"
        subtitle="Visualize, gerencie e cancele seus horários marcados."
        actions={[{ label: "Novo Agendamento", href: "/scheduling" }]}
      />
      <section className="container mx-auto px-4 py-10">
        <AppointmentsList
          initialAppointments={appointments?.appointments || []}
          totalCount={appointments?.pagination.total || 0}
          currentPage={appointments?.pagination.page || 1}
          totalPages={appointments?.pagination.totalPages || 1}
        />
      </section>
    </main>
  );
}
