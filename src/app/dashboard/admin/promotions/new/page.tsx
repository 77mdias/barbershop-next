import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import PromotionFormWrapper from "@/components/PromotionFormWrapper";
import { ArrowLeft, Gift } from "lucide-react";

export default async function NewPromotionPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const services = await db.service.findMany({
    select: {
      id: true,
      name: true,
      active: true,
    },
    orderBy: { name: "asc" },
  });

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
                <span>Nova Promoção</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                Preencha os dados para criar uma nova promoção
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Promoção</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              <PromotionFormWrapper availableServices={services} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}