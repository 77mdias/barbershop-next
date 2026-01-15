import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBarbersForAdmin } from "@/server/adminActions";
import Link from "next/link";
import { ArrowLeft, Plus, UserCog } from "lucide-react";
import { BarbersPageClient } from "./BarbersPageClient";

export default async function AdminBarbersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar lista de barbeiros
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
    <div className="container mt-20 mb-16 mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Voltar ao Dashboard</span>
                  <span className="sm:hidden">Voltar</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <UserCog className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                  <span>Gerenciar Barbeiros</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                  Visualize e gerencie todos os barbeiros da plataforma
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/admin/barbers/new">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Promover a Barbeiro</span>
                <span className="sm:hidden">Promover</span>
              </Link>
            </Button>
          </div>
        </div>

        <BarbersPageClient
          initialBarbers={barbers}
          initialPagination={initialPagination}
          initialMetrics={initialMetrics}
        />
      </div>
    </div>
  );
}
