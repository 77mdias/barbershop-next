import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getPromotionByIdForAdmin } from "@/server/promotionAdminActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import PromotionFormWrapper from "@/components/PromotionFormWrapper";
import { ArrowLeft, Gift, Power, Target, Calendar } from "lucide-react";

interface EditPromotionPageProps {
  params: {
    id: string;
  };
}

export default async function EditPromotionPage({ params }: EditPromotionPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [promotionResult, services] = await Promise.all([
    getPromotionByIdForAdmin(params.id),
    db.service.findMany({
      select: { id: true, name: true, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!promotionResult.success || !promotionResult.data) {
    notFound();
  }

  const promotion = promotionResult.data;
  const initialData = {
    id: promotion.id,
    name: promotion.name,
    description: promotion.description || "",
    type: promotion.type,
    value: Number(promotion.value),
    validFrom: promotion.validFrom ? new Date(promotion.validFrom) : new Date(),
    validUntil: promotion.validUntil ? new Date(promotion.validUntil) : undefined,
    isGlobal: promotion.isGlobal,
    minFrequency: promotion.minFrequency ?? undefined,
    active: promotion.active,
    serviceIds: promotion.servicePromotions?.map((ps) => ps.serviceId) || [],
  };

  return (
    <div className="container mt-20 mb-16 mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/admin/promotions">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Voltar para Promoções</span>
                <span className="sm:hidden">Voltar</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                <span>Editar Promoção</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                Atualize as informações da promoção
              </p>
            </div>
          </div>
        </div>

        {promotion._count && (
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Agendamentos</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {promotion._count.appointments || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Serviços</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {promotion._count.servicePromotions || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Usuários</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {promotion._count.userPromotions || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Power className="w-5 h-5" />
                    {promotion.active ? "Ativa" : "Inativa"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informações da Promoção</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              <PromotionFormWrapper initialData={initialData} availableServices={services} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Criada em {promotion.createdAt ? new Date(promotion.createdAt).toLocaleDateString("pt-BR") : "--"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{promotion.isGlobal ? "Promoção global" : "Promoção específica"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}