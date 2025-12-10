import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Scissors } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ServiceFormWrapper from "@/components/ServiceFormWrapper";
import { getServiceByIdForAdmin } from "@/server/serviceAdminActions";

interface EditServicePageProps {
  params: {
    id: string;
  };
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const session = await getServerSession(authOptions);

  // Verificar autenticação
  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar serviço
  const result = await getServiceByIdForAdmin(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const service = result.data;

  return (
    <div className="container mt-20 mb-16 mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/admin/services">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Voltar para Serviços</span>
                <span className="sm:hidden">Voltar</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                <span>Editar Serviço</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                Atualize as informações do serviço
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas do Serviço */}
        {service._count && (
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Agendamentos
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {service._count.appointments || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Histórico
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {service._count.serviceHistory || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Promoções
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {service._count.promotionServices || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vouchers
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {service._count.vouchers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceFormWrapper
                initialData={{
                  id: service.id,
                  name: service.name,
                  description: service.description || "",
                  duration: service.duration,
                  price: Number(service.price),
                  active: service.active,
                }}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
