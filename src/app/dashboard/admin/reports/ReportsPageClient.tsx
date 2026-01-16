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
import {
  Activity,
  AlertCircle,
  BarChart3,
  DollarSign,
  Download,
  FileText,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";

type DateRange = "7d" | "30d" | "3m" | "year";

type PaymentMethod = "CARD" | "CASH" | "PIX" | "OTHER";

type PaymentBreakdown = {
  method: PaymentMethod;
  count: number;
  revenue: number;
  revenueShare: number;
  volumeShare: number;
  averageTicket: number;
};

type PaymentDrilldownEntry = {
  id: string;
  name: string | null;
  revenue: number;
  percentage: number;
};

type PaymentMethodDetails = {
  method: PaymentMethod;
  topServices: PaymentDrilldownEntry[];
  topBarbers: PaymentDrilldownEntry[];
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

type CohortMonth = {
  month: string;
  newClients: number;
  returningClients: number;
  retentionRate: number;
};

type LtvByBarber = {
  barberId: string;
  barberName: string | null;
  revenue: number;
  uniqueClients: number;
  ltv: number;
};

type LtvMetrics = {
  totalRevenue: number;
  uniqueClients: number;
  globalLtv: number;
  byBarber: LtvByBarber[];
};

type ServiceOption = {
  id: string;
  name: string;
  active: boolean;
};

type CapacityThresholds = {
  occupancy: number;
  noShow: number;
  cancel: number;
};

type CapacityItem = {
  id: string;
  name: string;
  usedSlots: number;
  availableSlots: number;
  occupancyRate: number;
  totalAppointments: number;
  noShowRate: number;
  cancelRate: number;
  alerts: {
    occupancy: boolean;
    noShow: boolean;
    cancel: boolean;
  };
};

type CapacityMetrics = {
  summary: {
    slotsUsed: number;
    slotsAvailable: number;
    occupancyRate: number;
    noShowRate: number;
    cancelRate: number;
    totalAppointments: number;
  };
  thresholds: CapacityThresholds;
  byBarber: CapacityItem[];
  byService: CapacityItem[];
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
  paymentMethodDetails: PaymentMethodDetails[];
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
  customerCohort: CohortMonth[];
  ltv: LtvMetrics;
  serviceOptions: ServiceOption[];
  capacity: CapacityMetrics;
};

const paymentLabels: Record<PaymentMethod, string> = {
  CARD: "Cartão",
  CASH: "Dinheiro",
  PIX: "PIX",
  OTHER: "Outro",
};

const paymentColors: Record<PaymentMethod, string> = {
  CARD: "#10b981",
  CASH: "#f59e0b",
  PIX: "#6366f1",
  OTHER: "#94a3b8",
};

const dateRangeLabels: Record<DateRange, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "3m": "Últimos 3 meses",
  year: "Último ano",
};

const capacityThresholdFallback: CapacityThresholds = {
  occupancy: 85,
  noShow: 10,
  cancel: 15,
};

const formatDelta = (value: number) => {
  if (!Number.isFinite(value)) {
    return "Sem histórico";
  }

  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}${Math.abs(value).toFixed(1)}% vs período anterior`;
};

const formatCurrency = (value: number) => `R$ ${Number(value || 0).toFixed(2)}`;

const formatPercent = (value: number) => `${Number(value || 0).toFixed(1)}%`;

interface ReportsPageClientProps {
  initialReports: ReportsData | null;
  initialDateRange: DateRange;
}

export function ReportsPageClient({ initialReports, initialDateRange }: ReportsPageClientProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>(initialDateRange);
  const [selectedService, setSelectedService] = React.useState<string>("all");
  const [reports, setReports] = React.useState<ReportsData | null>(initialReports);
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastFetchedKey, setLastFetchedKey] = React.useState<string | null>(
    initialReports ? `${initialDateRange}::all` : null,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<PaymentMethod | null>(
    initialReports?.paymentMethods?.[0]?.method ?? null,
  );
  const { subscribe } = useRealtime();

  const fetchReports = React.useCallback(
    async (force = false) => {
      const serviceParam = selectedService === "all" ? undefined : selectedService;
      const currentKey = `${dateRange}::${serviceParam ?? "all"}`;

      if (!force && reports && lastFetchedKey === currentKey) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await getReportsData(dateRange, serviceParam);
        if (result.success) {
          setReports(result.data as ReportsData);
          setLastFetchedKey(currentKey);
        }
      } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [dateRange, lastFetchedKey, reports, selectedService],
  );

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  React.useEffect(() => {
    if (reports?.paymentMethods?.length) {
      setSelectedPaymentMethod((current) => {
        if (current && reports.paymentMethods.some((item) => item.method === current)) {
          return current;
        }
        return reports.paymentMethods[0].method;
      });
    } else {
      setSelectedPaymentMethod(null);
    }
  }, [reports]);

  React.useEffect(() => {
    const unsubscribe = subscribe({
      events: ["appointment:changed", "review:updated", "analytics:updated"],
      handler: (event) => {
        if (
          event.type === "analytics:updated" &&
          !["revenue", "appointments", "reviews"].includes(event.payload.scope)
        ) {
          return;
        }
        fetchReports(true);
      },
      onFallback: () => fetchReports(true),
    });

    return unsubscribe;
  }, [fetchReports, subscribe]);

  const revenueDelta = reports ? formatDelta(reports.periodComparison.revenueChangePercent) : "";
  const appointmentsDelta = reports ? formatDelta(reports.periodComparison.appointmentsChangePercent) : "";
  const satisfactionRate = reports ? Math.min(100, Math.round((reports.averageRating / 5) * 100)) : 0;
  const averageDurationProgress = reports ? Math.min(100, Math.round((reports.averageDurationMinutes / 90) * 100)) : 0;
  const returnRate = reports?.returnRate ?? 0;
  const commissionValue = reports ? reports.monthlyRevenue * 0.15 : 0;
  const operationalCosts = reports ? reports.monthlyAppointments * 5 : 0;
  const netRevenue = reports ? reports.monthlyRevenue - commissionValue - operationalCosts : 0;
  const paymentMethods = reports?.paymentMethods ?? [];
  const paymentMethodDetails = reports?.paymentMethodDetails ?? [];
  const hasPaymentData = paymentMethods.length > 0;
  const topPaymentMethod = hasPaymentData ? paymentMethods[0] : null;
  const selectedPayment = paymentMethods.find((method) => method.method === selectedPaymentMethod) || null;
  const selectedPaymentDetails = paymentMethodDetails.find((detail) => detail.method === selectedPaymentMethod) || null;

  const serviceOptions = React.useMemo(
    () => [
      { value: "all", label: "Todos os serviços" },
      ...(reports?.serviceOptions?.map((service) => ({
        value: service.id,
        label: service.active ? service.name : `${service.name} (inativo)`,
      })) ?? []),
    ],
    [reports?.serviceOptions],
  );

  React.useEffect(() => {
    if (!serviceOptions.some((option) => option.value === selectedService)) {
      setSelectedService("all");
    }
  }, [selectedService, serviceOptions]);

  const selectedServiceLabel =
    serviceOptions.find((option) => option.value === selectedService)?.label || "Todos os serviços";

  const donutGradient = React.useMemo(() => {
    if (!hasPaymentData) {
      return "conic-gradient(#e5e7eb 0% 100%)";
    }

    let current = 0;
    const segments = paymentMethods.map((method) => {
      const start = current;
      const slice = Math.max(method.revenueShare, 0);
      const end = Math.min(100, start + slice);
      current = end;
      return `${paymentColors[method.method]} ${start}% ${end}%`;
    });

    if (current < 100) {
      segments.push(`#e5e7eb ${current}% 100%`);
    }

    return `conic-gradient(${segments.join(", ")})`;
  }, [hasPaymentData, paymentMethods]);

  const cohortData = reports?.customerCohort ?? [];
  const ltvData = reports?.ltv;
  const totalNewClients = cohortData.reduce((acc, bucket) => acc + bucket.newClients, 0);
  const totalReturningClients = cohortData.reduce((acc, bucket) => acc + bucket.returningClients, 0);
  const averageRetention =
    cohortData.length > 0
      ? Math.round(cohortData.reduce((acc, bucket) => acc + bucket.retentionRate, 0) / cohortData.length)
      : 0;

  const capacity = reports?.capacity;
  const capacityThresholds = capacity?.thresholds ?? capacityThresholdFallback;
  const capacitySummary = capacity?.summary;
  const capacityAlerts = {
    occupancy: (capacitySummary?.occupancyRate ?? 0) >= capacityThresholds.occupancy,
    noShow: (capacitySummary?.noShowRate ?? 0) >= capacityThresholds.noShow,
    cancel: (capacitySummary?.cancelRate ?? 0) >= capacityThresholds.cancel,
  };
  const hasCapacityData =
    (capacity?.byBarber?.length ?? 0) > 0 ||
    (capacity?.byService?.length ?? 0) > 0 ||
    (capacitySummary?.totalAppointments ?? 0) > 0;

  const handleExportPayments = React.useCallback(() => {
    if (!hasPaymentData) {
      return;
    }

    try {
      const rows: string[][] = [
        ["Relatório", "Receita por Método de Pagamento"],
        ["Período", dateRangeLabels[dateRange]],
        ["Serviço", selectedServiceLabel],
        ["Gerado em", new Date().toISOString()],
        [],
        ["Método", "Receita (R$)", "Transações", "Ticket médio (R$)", "Share receita (%)", "Share volume (%)"],
        ...paymentMethods.map((method) => [
          paymentLabels[method.method],
          method.revenue.toFixed(2),
          method.count.toString(),
          method.averageTicket.toFixed(2),
          method.revenueShare.toFixed(1),
          method.volumeShare.toString(),
        ]),
      ];

      paymentMethodDetails.forEach((detail) => {
        rows.push([], [`Detalhamento - ${paymentLabels[detail.method]}`], ["Top Serviços", "Receita (R$)", "%"]);
        detail.topServices.forEach((service) => {
          rows.push([service.name || "Serviço sem nome", service.revenue.toFixed(2), service.percentage.toString()]);
        });
        rows.push(["Top Barbeiros", "Receita (R$)", "%"]);
        detail.topBarbers.forEach((barber) => {
          rows.push([barber.name || "Sem nome", barber.revenue.toFixed(2), barber.percentage.toString()]);
        });
      });

      const csvContent = rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pagamentos-${dateRange}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar pagamentos:", error);
    }
  }, [dateRange, hasPaymentData, paymentMethods, paymentMethodDetails, selectedServiceLabel]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:max-w-xl">
            <FilterSelect
              value={dateRange}
              onChange={(value) => setDateRange(value as DateRange)}
              options={[
                { value: "7d", label: "Últimos 7 dias" },
                { value: "30d", label: "Últimos 30 dias" },
                { value: "3m", label: "Últimos 3 meses" },
                { value: "year", label: "Último ano" },
              ]}
              className="w-full"
              label="Período"
            />

            <FilterSelect
              value={selectedService}
              onChange={setSelectedService}
              options={serviceOptions}
              className="w-full"
              label="Serviço"
              showReset
              resetLabel="Todos"
              disabled={serviceOptions.length <= 1 || isLoading}
            />
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={handleExportPayments}
            disabled={isLoading || !hasPaymentData}
            variant={hasPaymentData ? "default" : "outline"}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Período e serviço alimentam KPIs, cohort mensal e LTV. Dados são atualizados automaticamente em tempo real.
        </p>
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto sm:h-10">
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
              <TabsTrigger value="customers" className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-0">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Clientes</span>
                <span className="sm:hidden">Clientes</span>
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
                    <CardTitle>Método em Destaque</CardTitle>
                    <p className="text-sm text-gray-600">Maior receita no período selecionado</p>
                  </CardHeader>
                  <CardContent>
                    {!hasPaymentData && <p className="text-sm text-gray-600">Sem dados de pagamento no período.</p>}
                    {hasPaymentData && topPaymentMethod && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: paymentColors[topPaymentMethod.method] }}
                            aria-hidden
                          />
                          <div>
                            <p className="font-semibold">{paymentLabels[topPaymentMethod.method]}</p>
                            <p className="text-xs text-gray-500">{topPaymentMethod.count} transações no período</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Receita</span>
                          <span className="font-bold text-green-600">{formatCurrency(topPaymentMethod.revenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ticket Médio</span>
                          <span className="font-bold">{formatCurrency(topPaymentMethod.averageTicket)}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Share de receita</span>
                            <span>{topPaymentMethod.revenueShare}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2"
                              style={{
                                width: `${topPaymentMethod.revenueShare}%`,
                                backgroundColor: paymentColors[topPaymentMethod.method],
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Share de volume</span>
                            <span>{topPaymentMethod.volumeShare}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-2 bg-indigo-500" style={{ width: `${topPaymentMethod.volumeShare}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Receita por Método de Pagamento
                    </CardTitle>
                    <p className="text-sm text-gray-600">Percentuais e valores absolutos por período</p>
                  </CardHeader>
                  <CardContent>
                    {!hasPaymentData && <p className="text-sm text-gray-600">Sem dados de pagamento no período.</p>}
                    {hasPaymentData && (
                      <div className="space-y-6">
                        <div className="flex flex-col xl:flex-row gap-6 items-center">
                          <div className="flex-1 flex items-center justify-center">
                            <div className="relative h-48 w-48">
                              <div className="h-full w-full rounded-full" style={{ background: donutGradient }} />
                              <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center text-center">
                                <p className="text-xs text-gray-500">Receita no período</p>
                                <p className="text-lg font-bold">{formatCurrency(reports?.monthlyRevenue || 0)}</p>
                                <p className="text-xs text-gray-500">{dateRangeLabels[dateRange]}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 space-y-4 w-full">
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                              {paymentMethods.map((method) => (
                                <div
                                  key={`${method.method}-stack`}
                                  className="h-3"
                                  style={{
                                    width: `${Math.max(method.revenueShare, 0)}%`,
                                    backgroundColor: paymentColors[method.method],
                                  }}
                                  title={`${paymentLabels[method.method]} - ${method.revenueShare}% da receita`}
                                />
                              ))}
                            </div>
                            <div className="space-y-3">
                              {paymentMethods.map((method) => (
                                <div className="flex items-center justify-between gap-3" key={method.method}>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="h-3 w-3 rounded-full"
                                      style={{ backgroundColor: paymentColors[method.method] }}
                                      aria-hidden
                                    />
                                    <div>
                                      <p className="font-medium">{paymentLabels[method.method]}</p>
                                      <p className="text-xs text-gray-500">
                                        {method.count} transações • {method.volumeShare}% do volume
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-green-600">{formatCurrency(method.revenue)}</p>
                                    <p className="text-xs text-gray-500">{method.revenueShare}% da receita</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-2">
                    <CardTitle>Detalhamento por Método</CardTitle>
                    <p className="text-sm text-gray-600">KPIs e drill-down por serviço/barbeiro</p>
                    {hasPaymentData && (
                      <div className="flex flex-wrap gap-2">
                        {paymentMethods.map((method) => (
                          <Button
                            key={`selector-${method.method}`}
                            size="sm"
                            variant={selectedPaymentMethod === method.method ? "default" : "outline"}
                            onClick={() => setSelectedPaymentMethod(method.method)}
                          >
                            {paymentLabels[method.method]}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!hasPaymentData && <p className="text-sm text-gray-600">Sem dados de pagamento para exibir.</p>}
                    {hasPaymentData && selectedPayment && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Receita</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(selectedPayment.revenue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ticket Médio</p>
                            <p className="text-lg font-bold">{formatCurrency(selectedPayment.averageTicket)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Transações</p>
                            <p className="text-lg font-bold">{selectedPayment.count}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Share receita / volume</p>
                            <p className="text-lg font-bold">
                              {selectedPayment.revenueShare}% / {selectedPayment.volumeShare}%
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">Top serviços</h4>
                              <Badge variant="outline" className="text-xs">
                                {selectedPaymentDetails?.topServices.length || 0} itens
                              </Badge>
                            </div>
                            {(!selectedPaymentDetails || selectedPaymentDetails.topServices.length === 0) && (
                              <p className="text-sm text-gray-600">Sem serviços neste método.</p>
                            )}
                            {selectedPaymentDetails?.topServices.map((service) => (
                              <div key={service.id} className="flex items-center justify-between text-sm">
                                <div className="flex flex-col">
                                  <span className="font-medium">{service.name}</span>
                                  <span className="text-xs text-gray-500">{service.percentage}% da receita</span>
                                </div>
                                <span className="font-semibold text-green-600">{formatCurrency(service.revenue)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">Top barbeiros</h4>
                              <Badge variant="outline" className="text-xs">
                                {selectedPaymentDetails?.topBarbers.length || 0} itens
                              </Badge>
                            </div>
                            {(!selectedPaymentDetails || selectedPaymentDetails.topBarbers.length === 0) && (
                              <p className="text-sm text-gray-600">Sem barbeiros neste método.</p>
                            )}
                            {selectedPaymentDetails?.topBarbers.map((barber) => (
                              <div key={barber.id} className="flex items-center justify-between text-sm">
                                <div className="flex flex-col">
                                  <span className="font-medium">{barber.name || "Sem nome"}</span>
                                  <span className="text-xs text-gray-500">{barber.percentage}% da receita</span>
                                </div>
                                <span className="font-semibold text-green-600">{formatCurrency(barber.revenue)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Capacidade Geral
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Ocupação baseada em slots de {capacitySummary?.slotsAvailable ?? 0} disponíveis no período.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!hasCapacityData && (
                      <p className="text-sm text-gray-600">Sem dados de capacidade para este período.</p>
                    )}
                    {hasCapacityData && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Ocupação</span>
                          <Badge variant={capacityAlerts.occupancy ? "destructive" : "secondary"}>
                            {capacityAlerts.occupancy ? "Alerta" : "Saudável"}
                          </Badge>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">
                          {formatPercent(capacitySummary?.occupancyRate ?? 0)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {capacitySummary?.slotsUsed ?? 0} / {capacitySummary?.slotsAvailable ?? 0} slots usados
                        </p>
                        <p className="text-xs text-gray-500">
                          {capacitySummary?.totalAppointments ?? 0} agendamentos considerados
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      No-show e Cancelamentos
                    </CardTitle>
                    <p className="text-sm text-gray-600">Taxas no período selecionado</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!hasCapacityData && (
                      <p className="text-sm text-gray-600">Nenhum agendamento para medir no-show/cancelamentos.</p>
                    )}
                    {hasCapacityData && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">No-show</span>
                          <Badge variant={capacityAlerts.noShow ? "destructive" : "outline"}>
                            {formatPercent(capacitySummary?.noShowRate ?? 0)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Cancelamentos</span>
                          <Badge variant={capacityAlerts.cancel ? "destructive" : "outline"}>
                            {formatPercent(capacitySummary?.cancelRate ?? 0)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Limites: no-show {capacityThresholds.noShow}% • cancelamentos {capacityThresholds.cancel}%
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      Controles de Capacidade
                    </CardTitle>
                    <p className="text-sm text-gray-600">Thresholds e indicadores rápidos</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Threshold de ocupação</span>
                      <Badge variant="outline">{capacityThresholds.occupancy}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Threshold de no-show</span>
                      <Badge variant="outline">{capacityThresholds.noShow}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Threshold de cancelamento</span>
                      <Badge variant="outline">{capacityThresholds.cancel}%</Badge>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={capacityAlerts.occupancy ? "destructive" : "secondary"}>
                        Capacidade {capacityAlerts.occupancy ? "no limite" : "ok"}
                      </Badge>
                      <Badge variant={capacityAlerts.noShow ? "destructive" : "secondary"}>
                        No-show {capacityAlerts.noShow ? "alto" : "controlado"}
                      </Badge>
                      <Badge variant={capacityAlerts.cancel ? "destructive" : "secondary"}>
                        Cancelamentos {capacityAlerts.cancel ? "altos" : "controlados"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Capacidade por Barbeiro</CardTitle>
                    <p className="text-sm text-gray-600">Ocupação e no-show por profissional</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!capacity?.byBarber?.length && (
                      <p className="text-sm text-gray-600">Nenhum barbeiro com agendamentos no período.</p>
                    )}
                    {capacity?.byBarber?.slice(0, 5).map((barber) => (
                      <div key={barber.id} className="space-y-1 border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{barber.name}</p>
                            <p className="text-xs text-gray-500">
                              {barber.usedSlots}/{barber.availableSlots} slots • {barber.totalAppointments} agendamentos
                            </p>
                          </div>
                          <Badge variant={barber.alerts.occupancy ? "destructive" : "outline"}>
                            {formatPercent(barber.occupancyRate)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={barber.alerts.noShow ? "destructive" : "secondary"}>
                            No-show {formatPercent(barber.noShowRate)}
                          </Badge>
                          <Badge variant={barber.alerts.cancel ? "destructive" : "secondary"}>
                            Cancel {formatPercent(barber.cancelRate)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Capacidade por Serviço</CardTitle>
                    <p className="text-sm text-gray-600">Participação de slots por serviço</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!capacity?.byService?.length && (
                      <p className="text-sm text-gray-600">Nenhum serviço agendado no período.</p>
                    )}
                    {capacity?.byService?.slice(0, 5).map((service) => (
                      <div key={service.id} className="space-y-1 border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-gray-500">
                              {service.usedSlots}/{service.availableSlots} slots • {service.totalAppointments}{" "}
                              agendamentos
                            </p>
                          </div>
                          <Badge variant={service.alerts.occupancy ? "destructive" : "outline"}>
                            {formatPercent(service.occupancyRate)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={service.alerts.noShow ? "destructive" : "secondary"}>
                            No-show {formatPercent(service.noShowRate)}
                          </Badge>
                          <Badge variant={service.alerts.cancel ? "destructive" : "secondary"}>
                            Cancel {formatPercent(service.cancelRate)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      LTV Global
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {selectedServiceLabel} • {dateRangeLabels[dateRange]}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(ltvData?.globalLtv || 0)}</p>
                    <p className="text-sm text-gray-600">
                      Clientes únicos: {ltvData?.uniqueClients ?? 0} | Receita:{" "}
                      {formatCurrency(ltvData?.totalRevenue || 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Retenção e Cohort</CardTitle>
                    <p className="text-sm text-gray-600">Novos vs recorrentes no período selecionado</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Novos</span>
                      <span className="font-semibold text-green-600">{totalNewClients}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Recorrentes</span>
                      <span className="font-semibold text-blue-600">{totalReturningClients}</span>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Retenção média</span>
                        <span className="text-sm font-medium">{averageRetention}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.min(averageRetention, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Receita por Cliente</CardTitle>
                    <p className="text-sm text-gray-600">Cobertura do serviço filtrado</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Receita do período</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {formatCurrency(ltvData?.totalRevenue || reports?.monthlyRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ticket médio (global)</span>
                      <span className="text-lg font-bold">{formatCurrency(ltvData?.globalLtv || 0)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cohort Mensal (Novos x Recorrentes)</CardTitle>
                    <p className="text-sm text-gray-600">
                      {selectedServiceLabel} • {dateRangeLabels[dateRange]}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cohortData.length === 0 && (
                      <p className="text-sm text-gray-600">Sem dados de clientes para o período/serviço selecionado.</p>
                    )}
                    {cohortData.length > 0 && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 text-xs font-medium text-gray-500">
                          <span>Mês</span>
                          <span>Novos</span>
                          <span>Recorrentes</span>
                          <span className="text-right">Retenção</span>
                        </div>
                        {cohortData.map((bucket) => (
                          <div key={bucket.month} className="grid grid-cols-4 items-center text-sm">
                            <span className="font-medium">{bucket.month}</span>
                            <span className="font-semibold text-green-600">{bucket.newClients}</span>
                            <span className="font-semibold text-blue-600">{bucket.returningClients}</span>
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 bg-emerald-500 rounded-full"
                                  style={{ width: `${Math.min(bucket.retentionRate, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{bucket.retentionRate}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>LTV por Barbeiro</CardTitle>
                    <p className="text-sm text-gray-600">Top 5 barbeiros por receita/cliente</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!ltvData?.byBarber?.length && (
                      <p className="text-sm text-gray-600">Sem dados de LTV por barbeiro para este filtro.</p>
                    )}
                    {ltvData?.byBarber?.slice(0, 5).map((barber) => (
                      <div key={barber.barberId} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{barber.barberName || "Sem nome"}</p>
                          <p className="text-xs text-gray-500">
                            {barber.uniqueClients} clientes • {formatCurrency(barber.revenue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-indigo-600">{formatCurrency(barber.ltv)}</p>
                          <p className="text-xs text-gray-500">LTV médio</p>
                        </div>
                      </div>
                    ))}
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
