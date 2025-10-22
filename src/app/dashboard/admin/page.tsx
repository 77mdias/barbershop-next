import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAdminMetrics } from "@/server/dashboardActions";
import Link from "next/link";
import {
  Users,
  BarChart3,
  Star,
  TrendingUp,
  Calendar,
  Shield,
  UserCog,
  Settings,
  Activity,
  DollarSign,
  Database,
  AlertTriangle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar métricas administrativas
  const metricsResult = await getAdminMetrics();
  const metrics = metricsResult.success ? metricsResult.data : null;

  return (
    <div className="container mt-12 mb-16 mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Administrativo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-600" />
                Painel Administrativo
              </h1>
              <p className="text-gray-600">
                Gerencie toda a plataforma e monitore métricas globais
              </p>
            </div>
            <Badge variant="destructive" className="px-3 py-1">
              <Shield className="w-4 h-4 mr-1" />
              Administrador
            </Badge>
          </div>
          <Separator />
        </div>

        {/* Loading State */}
        {!metrics && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {metrics && (
          <>
            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total de Usuários */}
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Total de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-blue-600">
                      {metrics.totalUsers}
                    </p>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <span>👥 Clientes: {metrics.clientsCount}</span>
                      <span>✂️ Barbeiros: {metrics.barbersCount}</span>
                      <span>🛡️ Admins: {metrics.adminsCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de Avaliações */}
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Sistema de Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-yellow-600">
                      {metrics.totalReviews}
                    </p>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <span>⭐ Média: {metrics.globalAverage}/5</span>
                      <span>📈 Este mês: {metrics.monthlyReviews}</span>
                      <span>🏆 5 estrelas: {metrics.fiveStarReviews}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Atividade do Mês */}
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Atividade Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-green-600">
                      {metrics.monthlyActivity}
                    </p>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <span>📅 Agendamentos: {metrics.monthlyAppointments}</span>
                      <span>⭐ Avaliações: {metrics.monthlyReviews}</span>
                      <span>👤 Novos usuários: {metrics.newUsersThisMonth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Receita Estimada */}
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                    Receita Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-purple-600">
                      R$ {(metrics.monthlyRevenue || 0).toFixed(2)}
                    </p>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <span>💰 Total acumulado: R$ {(metrics.totalRevenue || 0).toFixed(2)}</span>
                      <span>📊 Serviços pagos: {metrics.paidServices}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs de Gestão */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Avaliações
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Sistema
                </TabsTrigger>
              </TabsList>

              {/* Visão Geral */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Barbeiros */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Top Barbeiros (Avaliações)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics.topBarbers?.map((barber, index) => (
                          <div key={barber.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <div>
                                <p className="font-medium">{barber.name}</p>
                                <p className="text-sm text-gray-600">
                                  {barber.totalReviews} avaliações
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-yellow-600">
                                ⭐ {barber.averageRating}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Distribuição de Avaliações */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Distribuição de Avaliações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {metrics.ratingDistribution?.map((rating) => (
                          <div key={rating.rating} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {rating.rating} ⭐
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 ml-4">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full"
                                  style={{ 
                                    width: `${(rating._count.rating / metrics.totalReviews * 100)}%` 
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 min-w-[3rem] text-right">
                                {rating._count.rating}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Gestão de Usuários */}
              <TabsContent value="users" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Ações Rápidas de Usuários */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCog className="w-5 h-5" />
                        Ações Rápidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild className="w-full">
                        <Link href="/admin/users">
                          <Users className="w-4 h-4 mr-2" />
                          Gerenciar Usuários
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/barbers">
                          <UserCog className="w-4 h-4 mr-2" />
                          Gerenciar Barbeiros
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/reports">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Relatórios
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Estatísticas de Usuários */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Estatísticas Detalhadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Usuários Ativos (30 dias)</p>
                          <p className="text-2xl font-bold text-green-600">
                            {metrics.activeUsers}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Novos Usuários (mês)</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {metrics.newUsersThisMonth}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Taxa de Conversão</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Barbeiros Ativos</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {metrics.activeBarbersCount}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Sistema de Avaliações */}
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monitoramento de Avaliações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Avaliações Hoje</p>
                        <p className="text-2xl font-bold">{metrics.todayReviews}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Média Geral</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          ⭐ {metrics.globalAverage}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Reviews Pendentes</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {metrics.pendingReviews}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sistema */}
              <TabsContent value="system" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Status do Sistema
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Status da API</span>
                          <Badge variant="default" className="bg-green-500">
                            ✓ Online
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Banco de Dados</span>
                          <Badge variant="default" className="bg-green-500">
                            ✓ Conectado
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Uploads de Imagem</span>
                          <Badge variant="default" className="bg-green-500">
                            ✓ Funcionando
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Configurações Administrativas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/settings">
                          <Settings className="w-4 h-4 mr-2" />
                          Configurações Gerais
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/backup">
                          <Database className="w-4 h-4 mr-2" />
                          Backup & Restore
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/logs">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Logs do Sistema
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}