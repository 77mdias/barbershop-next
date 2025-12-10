import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAdminMetrics } from "@/server/dashboardActions";
import { getServicesForAdmin } from "@/server/serviceAdminActions";
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
  Scissors,
  Plus,
  Edit,
  Power,
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

  // Buscar serviços para a aba Serviços
  const servicesResult = await getServicesForAdmin({ limit: 10 });
  const services = servicesResult.success ? servicesResult.data : [];
  const totalServices = services.length;
  const activeServices = services.filter((s: any) => s.active).length;
  const inactiveServices = services.filter((s: any) => !s.active).length;

  return (
    <div className="container mt-20 sm:mt-16 mb-16 mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Administrativo */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                <span>Painel Administrativo</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                Gerencie toda a plataforma e monitore métricas globais
              </p>
            </div>
            <div className="flex justify-start sm:justify-end">
              <Badge variant="destructive" className="px-3 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Administrador
              </Badge>
            </div>
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
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1">
                <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Visão Geral</span>
                  <span className="sm:hidden">Visão</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Usuários</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Avaliações</span>
                  <span className="sm:hidden">Reviews</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Scissors className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Serviços</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Sistema</span>
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
                        <Link href="/dashboard/admin/users">
                          <Users className="w-4 h-4 mr-2" />
                          Gerenciar Usuários
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/dashboard/admin/barbers">
                          <UserCog className="w-4 h-4 mr-2" />
                          Gerenciar Barbeiros
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/dashboard/admin/reports">
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

              {/* Serviços */}
              <TabsContent value="services" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Card: Total de Serviços */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Serviços
                      </CardTitle>
                      <Scissors className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {totalServices}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        cadastrados na plataforma
                      </p>
                    </CardContent>
                  </Card>

                  {/* Card: Serviços Ativos */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Serviços Ativos
                      </CardTitle>
                      <Power className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {activeServices}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        disponíveis para agendamento
                      </p>
                    </CardContent>
                  </Card>

                  {/* Card: Serviços Inativos */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Serviços Inativos
                      </CardTitle>
                      <Power className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-muted-foreground">
                        {inactiveServices}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        temporariamente desativados
                      </p>
                    </CardContent>
                  </Card>

                  {/* Card: Ações Rápidas */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Gerenciamento
                      </CardTitle>
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        asChild
                        className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                        size="sm"
                      >
                        <Link href="/dashboard/admin/services">
                          <Scissors className="w-4 h-4 mr-2" />
                          Ver Todos
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Link href="/dashboard/admin/services/new">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Serviço
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de Serviços Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Serviços Recentes</CardTitle>
                    <CardDescription>
                      Últimos serviços cadastrados ou atualizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {services.slice(0, 5).map((service: any) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 rounded-full flex items-center justify-center">
                              <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{service.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {service.duration} min • R$ {Number(service.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={service.active ? "default" : "secondary"}
                              className={service.active ? "bg-green-500 dark:bg-green-600" : ""}
                            >
                              {service.active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/admin/services/${service.id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}

                      {services.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Scissors className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum serviço cadastrado ainda</p>
                          <Button asChild variant="outline" className="mt-4" size="sm">
                            <Link href="/dashboard/admin/services/new">
                              Criar primeiro serviço
                            </Link>
                          </Button>
                        </div>
                      )}
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