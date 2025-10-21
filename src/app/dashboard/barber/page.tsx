import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsList } from "@/components/ReviewsList";
import { ReviewSection } from "@/components/ReviewSection";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getBarberMetrics } from "@/server/dashboardActions";
import Link from "next/link";
import {
  Scissors,
  Star,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Clock,
  DollarSign,
  Award,
} from "lucide-react";

export default async function BarberDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é barbeiro
  if (session.user.role !== "BARBER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar métricas reais do barbeiro
  const metricsResult = await getBarberMetrics(session.user.id);
  const metrics = metricsResult.success ? metricsResult.data : null;

  return (
    <div className="container mt-12 mb-16 mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Scissors className="w-8 h-8" />
                Dashboard do Barbeiro
              </h1>
              <p className="text-gray-600">
                Gerencie seus atendimentos, reviews e performance
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="default" className="px-3 py-1">
                Barbeiro Ativo
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard Geral</Link>
              </Button>
            </div>
          </div>
          <Separator />
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Agendamentos Hoje */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-gray-600">Agendamentos</p>
                <Badge variant="secondary" className="text-xs">
                  📅 {new Date().toLocaleDateString("pt-BR")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Avaliação Média */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <StarIcon className="w-4 h-4" />
                Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {metrics?.averageRating?.toFixed(1) || "0.0"}
                </p>
                <p className="text-xs text-gray-600">Média Geral</p>
                <Badge variant="secondary" className="text-xs">
                  ⭐ Este Mês
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Total de Clientes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {metrics?.totalClients || 0}
                </p>
                <p className="text-xs text-gray-600">Total Atendidos</p>
                <Badge variant="secondary" className="text-xs">
                  👥 Este Mês
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSignIcon className="w-4 h-4" />
                Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  R$ {metrics?.monthlyRevenue?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-gray-600">Este Mês</p>
                <Badge variant="secondary" className="text-xs">
                  💰 Estimativa
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 gap-1 h-auto p-1">
            <TabsTrigger
              value="reviews"
              className="flex items-center gap-2 py-3"
            >
              <StarIcon className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2 py-3"
            >
              <CalendarIcon className="w-4 h-4" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 py-3"
            >
              <BarChart3Icon className="w-4 h-4" />
              Análises
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2 py-3"
            >
              <TrendingUpIcon className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Tab de Reviews */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Estatísticas de Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-blue-600" />
                    <p className="text-3xl font-bold">
                      {metrics?.totalReviews || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total de Reviews</p>
                    <Badge variant="outline">📝 Todas</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Star className="w-8 h-8 mx-auto text-yellow-600" />
                    <p className="text-3xl font-bold">
                      {metrics?.fiveStarReviews || 0}
                    </p>
                    <p className="text-sm text-gray-600">Reviews 5 ⭐</p>
                    <Badge variant="outline">🏆 Excelência</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <TrendingUp className="w-8 h-8 mx-auto text-green-600" />
                    <p className="text-3xl font-bold">
                      {metrics?.monthlyAverageRating?.toFixed(1) || "0.0"}
                    </p>
                    <p className="text-sm text-gray-600">Média Este Mês</p>
                    <Badge variant="outline">📊 Tendência</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Reviews do Barbeiro */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquareIcon className="w-6 h-6" />
                    Suas Reviews Recentes
                  </CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/reviews?view=barber">Ver Todas</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <LoadingSpinner
                      text="Carregando reviews..."
                      className="py-8"
                    />
                  }
                >
                  <ReviewsList
                    barberId={session.user.id}
                    showStats={true}
                    showActions={true}
                    limit={5}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Agendamentos */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6" />
                  Próximos Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>
                    Integração com sistema de agendamentos em desenvolvimento
                  </p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link href="/scheduling">Ver Agendamentos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Análises */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gráfico de Reviews por Mês */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3Icon className="w-6 h-6" />
                    Reviews por Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Gráficos de análise em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição de Notas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StarIcon className="w-6 h-6" />
                    Distribuição de Notas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm w-4">{star}</span>
                        <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">--</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab de Performance */}
          <TabsContent value="performance" className="space-y-6">
            {/* Badges de Conquistas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AwardIcon className="w-6 h-6" />
                  Conquistas e Metas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <AwardIcon className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                    <p className="font-semibold text-yellow-800">Top Rated</p>
                    <p className="text-xs text-yellow-600">
                      Média 4.5+ por 3 meses
                    </p>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <UsersIcon className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <p className="font-semibold text-blue-800">
                      Client Favorite
                    </p>
                    <p className="text-xs text-blue-600">
                      50+ clientes atendidos
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <MessageSquareIcon className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="font-semibold text-green-800">
                      Review Master
                    </p>
                    <p className="text-xs text-green-600">
                      100+ reviews recebidas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metas mensais */}
            <Card>
              <CardHeader>
                <CardTitle>Metas do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avaliação Média (Meta: 4.5)</span>
                      <span>
                        {metrics?.goals?.averageRating?.current?.toFixed(1) ||
                          "0.0"}{" "}
                        / 4.5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            metrics?.goals?.averageRating?.percentage || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reviews Recebidas (Meta: 20)</span>
                      <span>
                        {metrics?.goals?.monthlyReviews?.current || 0} / 20
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            metrics?.goals?.monthlyReviews?.percentage || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Clientes Atendidos (Meta: 100)</span>
                      <span>
                        {metrics?.goals?.monthlyClients?.current || 0} / 100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${
                            metrics?.goals?.monthlyClients?.percentage || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">
                🚀 Dashboard Profissional do Barbeiro
              </h3>
              <p className="text-sm text-gray-600">
                Gerencie reviews, acompanhe performance e melhore seus serviços
              </p>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span>• Reviews Management</span>
                <span>• Performance Analytics</span>
                <span>• Client Insights</span>
                <span>• Goal Tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
