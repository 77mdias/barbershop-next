import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBarbersForAdmin } from "@/server/adminActions";
import { PageHero } from "@/components/shared/PageHero";
import { BarbersPageClient } from "./BarbersPageClient";

export default async function AdminBarbersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const barbersResult = await getBarbersForAdmin({
    page: 1,
    limit: 20,
    sortBy: "name",
  });
  const barbers = barbersResult.success ? barbersResult.data : [];
  const initialPagination = barbersResult.success
    ? barbersResult.pagination
    : { page: 1, limit: 20, total: barbers.length, totalPages: 1 };
  const initialMetrics = barbersResult.success
    ? barbersResult.metrics
    : {
        averageRating: 0,
        activeCount: barbers.filter((barber: any) => barber.totalAppointments > 0).length,
        totalReviews: barbers.reduce((acc: number, barber: any) => acc + (barber.totalReviews || 0), 0),
        topPerformer: barbers[0]?.name || null,
      };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Gerenciar Barbeiros"
        subtitle="Visualize e gerencie todos os barbeiros da plataforma."
        actions={[
          { label: "Voltar ao Dashboard", href: "/dashboard/admin", variant: "outline" },
          { label: "Promover a Barbeiro", href: "/dashboard/admin/barbers/new", variant: "primary" },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <BarbersPageClient
            initialBarbers={barbers}
            initialPagination={initialPagination}
            initialMetrics={initialMetrics}
          />
        </div>
      </section>
    </main>
  );
}
