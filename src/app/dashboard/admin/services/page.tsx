import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getServicesForAdmin } from "@/server/serviceAdminActions";
import Link from "next/link";
import { ArrowLeft, Plus, Scissors } from "lucide-react";
import { ServicesPageClient } from "./ServicesPageClient";

export default async function AdminServicesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar lista de serviços
  const servicesResult = await getServicesForAdmin({
    page: 1,
    limit: 20,
  });

  const services = servicesResult.success ? servicesResult.data : [];
  const initialPagination = servicesResult.success
    ? servicesResult.pagination
    : { page: 1, limit: 20, total: services.length, totalPages: 1 };
  const initialStats = servicesResult.success
    ? servicesResult.stats
    : {
        activeCount: services.filter((service: any) => service.active).length,
        inactiveCount: services.filter((service: any) => !service.active).length,
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
                  <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <span>Gerenciar Serviços</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                  Crie, edite e gerencie todos os serviços da barbearia
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
              <Link href="/dashboard/admin/services/new">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Novo Serviço</span>
                <span className="sm:hidden">Novo</span>
              </Link>
            </Button>
          </div>
        </div>
        <ServicesPageClient
          initialServices={services}
          initialPagination={initialPagination}
          initialStats={initialStats}
        />
      </div>
    </div>
  );
}
