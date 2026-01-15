"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getReportsData } from "@/server/adminActions";
import { Activity, BarChart3, DollarSign, Download, FileText, Star, TrendingUp, Users } from "lucide-react";

type DateRange = "7d" | "30d" | "3m" | "year";

type PaymentMethod = "CARD" | "CASH" | "PIX" | "OTHER";

type PaymentBreakdown = {
  method: PaymentMethod;
  count: number;
  percentage: number;
};

type BusyHourMetric = {
  label: string;
  range: string;
  count: number;
  percentage: number;
};

type MonthlyGrowthEntry = {
  month: string;
  revenue: number;
  services: number;
  progress: number;
  growthRate: number;
};

type ReportBarber = {
  id: string;
  name: string | null;
  totalReviews: number;
  averageRating: number;
  totalRevenue: number;
};

type ReportsData = {
  totalRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  totalAppointments: number;
  monthlyAppointments: number;
  averageRating: number;
  totalReviews: number;
  topBarbers: ReportBarber[];
  monthlyGrowth: MonthlyGrowthEntry[];
  paymentMethods: PaymentBreakdown[];
  busyHours: BusyHourMetric[];
  periodComparison: {
    revenueChangePercent: number;
    appointmentsChangePercent: number;
    newClients: number;
  };
  todayRevenue: number;
  weekRevenue: number;
  averageTicket: number;
  averageDurationMinutes: number;
  returnRate: number;
};

const paymentLabels: Record<PaymentMethod, string> = {
  CARD: "Cartão",
  CASH: "Dinheiro",
  PIX: "PIX",
  OTHER: "Outro",
};

const formatDelta = (value: number) => {
  if (!Number.isFinite(value)) {
    return "Sem histórico";
  }

  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}${Math.abs(value).toFixed(1)}% vs período anterior`;
};

const formatCurrency = (value: number) => `R$ ${Number(value || 0).toFixed(2)}`;

interface ReportsPageClientProps {
  initialReports: ReportsData | null;
  initialDateRange: DateRange;
}

export function ReportsPageClient({ initialReports, initialDateRange }: ReportsPageClientProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>(initialDateRange);
  const [reports, setReports] = React.useState<ReportsData | null>(initialReports);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (dateRange === initialDateRange && initialReports) {
      return;
    }

    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const result = await getReportsData(dateRange);
        if (result.success) {
          setReports(result.data as ReportsData);
        }
      } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [dateRange, initialDateRange, initialReports]);

  const revenueDelta = reports ? formatDelta(reports.periodComparison.revenueChangePercent) : "";
  const appointmentsDelta = reports ? formatDelta(reports.periodComparison.appointmentsChangePercent) : "";
  const satisfactionRate = reports ? Math.min(100, Math.round((reports.averageRating / 5) * 100)) : 0;
  const averageDurationProgress = reports ? Math.min(100, Math.round((reports.averageDurationMinutes / 90) * 100)) : 0;
  const returnRate = reports?.returnRate ?? 0;
  const commissionValue = reports ? reports.monthlyRevenue * 0.15 : 0;
  const operationalCosts = reports ? reports.monthlyAppointments * 5 : 0;
  const netRevenue = reports ? reports.monthlyRevenue - commissionValue - operationalCosts : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <FilterSelect
          value={dateRange}
          onChange={(value) => setDateRange(value as DateRange)}
          options={[
            { value: "7d", label: "Últimos 7 dias" },
            { value: "30d", label: "Últimos 30 dias" },
            { value: "3m", label: "Últimos 3 meses" },
            { value: "year", label: "Último ano" },
          ]}
          className="w-full sm:w-[200px]"
          label="Período"
        />

        <Button className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && !reports && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-600">Nenhum dado disponível para o período.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && reports && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(reports.totalRevenue)}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">{revenueDelta}</span>
                  </div>
                  <p className="text-sm text-gray-600">Período selecionado: {formatCurrency(reports.monthlyRevenue)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Total Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-blue-600">{reports.totalClients || 0}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600">
                      +{reports.periodComparison.newClients} novos neste período
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Satisfação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-yellow-600">{reports.averageRating || "0.0"}/5</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-yellow-600">{reports.totalReviews || 0} avaliações</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-orange-600">{reports.totalAppointments || 0}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600">{appointmentsDelta}</span>
                  </div>
                  <p className="text-sm text-gray-600">Período: {reports.monthlyAppointments || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10">
              <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-0">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Visão Geral</span>
                <span className="sm:hidden">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-0">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Financeiro</span>
                <span className="sm:hidden">$$$</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-0">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Performance</span>
                <span className="sm:hidden">Perf.</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-0">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
                <span className="sm:hidden">Export</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Crescimento Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.monthlyGrowth.length === 0 && (
                        <p className="text-sm text-gray-600">Sem histórico recente.</p>
                      )}
                      {reports.monthlyGrowth.map((entry) => (
                        <div className="flex items-center justify-between" key={entry.month}>
                          <span className="text-sm">{entry.month}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${entry.progress}%` }} />
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium block">{formatCurrency(entry.revenue)}</span>
                              <span className="text-xs text-gray-500">{entry.services} serviços</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Top Barbeiros (Receita)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.topBarbers?.slice(0, 5).map((barber, index) => (
                        <div key={barber.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{barber.name}</p>
                              <p className="text-sm text-gray-600">{barber.totalReviews} avaliações</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(barber.totalRevenue)}</p>
                            <p className="text-sm text-gray-600">⭐ {barber.averageRating}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Receita por Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Hoje</span>
                        <span className="font-bold">{formatCurrency(reports.todayRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Esta Semana</span>
                        <span className="font-bold">{formatCurrency(reports.weekRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Este Período</span>
                        <span className="font-bold">{formatCurrency(reports.monthlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ticket Médio</span>
                        <span className="font-bold">{formatCurrency(reports.averageTicket)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Total Acumulado</span>
                        <span className="font-bold text-green-600">{formatCurrency(reports.totalRevenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Custos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Receita Bruta (período)</span>
                        <span className="font-bold text-green-600">{formatCurrency(reports.monthlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comissões (-15%)</span>
                        <span className="font-bold text-red-600">-{formatCurrency(commissionValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Custos Operacionais</span>
                        <span className="font-bold text-red-600">-{formatCurrency(operationalCosts)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Lucro Líquido</span>
                        <span className="font-bold text-blue-600">{formatCurrency(netRevenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Métodos de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reports.paymentMethods.length === 0 && (
                        <p className="text-sm text-gray-600">Sem dados de pagamento no período.</p>
                      )}
                      {reports.paymentMethods.map((method) => (
                        <div className="flex items-center justify-between" key={method.method}>
                          <span>{paymentLabels[method.method]}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${method.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm">{method.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Satisfação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Taxa de Satisfação Geral</span>
                          <span className="text-sm font-medium">{satisfactionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${satisfactionRate}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Tempo Médio de Atendimento</span>
                          <span className="text-sm font-medium">{reports.averageDurationMinutes || 0} min</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${averageDurationProgress}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Taxa de Retorno</span>
                          <span className="text-sm font-medium">{returnRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${returnRate}%` }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Horários Mais Movimentados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reports.busyHours.length === 0 && (
                        <p className="text-sm text-gray-600">Sem agendamentos neste período.</p>
                      )}
                      {reports.busyHours.map((slot) => (
                        <div className="flex items-center justify-between" key={slot.range}>
                          <span>{slot.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${slot.percentage}%` }} />
                            </div>
                            <span className="text-sm">{slot.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Relatório Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">Receitas, despesas e análise de custos</p>
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Relatório de Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">Lista completa de clientes e histórico</p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Excel
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Relatório de Avaliações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">Todas as avaliações e feedbacks</p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
