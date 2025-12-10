import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Scissors } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ServiceFormWrapper from "@/components/ServiceFormWrapper";

export default async function NewServicePage() {
  const session = await getServerSession(authOptions);

  // Verificar autenticação
  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

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
                <span>Novo Serviço</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                Preencha os dados para criar um novo serviço
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceFormWrapper />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
