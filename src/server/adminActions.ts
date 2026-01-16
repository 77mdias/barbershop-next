"use server";

import { AppointmentStatus, PaymentMethod, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { UserService } from "./services/userService";
import { logger } from "@/lib/logger";

const toNumber = (value: Prisma.Decimal | number | null | undefined) => (value ? Number(value) : 0);

type ReportDateRange = "7d" | "30d" | "3m" | "year";

const busyHourBuckets = [
  { label: "Manhã (8h-12h)", start: 8, end: 12 },
  { label: "Tarde (12h-18h)", start: 12, end: 18 },
  { label: "Noite (18h-22h)", start: 18, end: 22 },
];

const CAPACITY_CONFIG = {
  workdayStartHour: 9,
  workdayEndHour: 18,
  slotMinutes: 30,
  thresholds: {
    occupancy: 85, // alerta quando ocupação >= 85%
    noShow: 10, // alerta quando no-show >= 10%
    cancel: 15, // alerta quando cancelamentos >= 15%
  },
};

// Tipos para os dados retornados
interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

interface Barber extends User {
  totalReviews: number;
  averageRating: number | null;
  totalAppointments: number;
}

interface BarberMetrics {
  averageRating: number;
  activeCount: number;
  totalReviews: number;
  topPerformer: string | null;
}

type MonthlyGrowthEntry = {
  month: string;
  revenue: number;
  services: number;
  progress: number;
  growthRate: number;
};

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

type BusyHourMetric = {
  label: string;
  range: string;
  count: number;
  percentage: number;
};

type PeriodComparison = {
  revenueChangePercent: number;
  appointmentsChangePercent: number;
  newClients: number;
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

interface ReportsData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  totalAppointments: number;
  monthlyAppointments: number;
  averageRating: number;
  totalReviews: number;
  topBarbers: Array<{
    id: string;
    name: string | null;
    totalReviews: number;
    averageRating: number;
    totalRevenue: number;
  }>;
  monthlyGrowth: MonthlyGrowthEntry[];
  paymentMethods: PaymentBreakdown[];
  paymentMethodDetails: PaymentMethodDetails[];
  busyHours: BusyHourMetric[];
  periodComparison: PeriodComparison;
  todayRevenue: number;
  weekRevenue: number;
  averageTicket: number;
  averageDurationMinutes: number;
  returnRate: number;
  customerCohort: CohortMonth[];
  ltv: LtvMetrics;
  serviceOptions: ServiceOption[];
  capacity: CapacityMetrics;
}

function calculateBusyHours(appointments: Array<{ date: Date }>): BusyHourMetric[] {
  const counts = busyHourBuckets.map(() => 0);

  appointments.forEach(({ date }) => {
    const hour = date.getHours();
    const index = busyHourBuckets.findIndex((bucket) => hour >= bucket.start && hour < bucket.end);
    if (index >= 0) {
      counts[index] += 1;
    }
  });

  const total = counts.reduce((acc, current) => acc + current, 0);

  return busyHourBuckets.map((bucket, index) => ({
    label: bucket.label,
    range: `${bucket.start}h-${bucket.end}h`,
    count: counts[index],
    percentage: total > 0 ? Math.round((counts[index] / total) * 100) : 0,
  }));
}

async function getTopBarbersByRevenue(startDate?: Date, serviceId?: string) {
  const histories = await db.serviceHistory.findMany({
    where: {
      ...(startDate ? { completedAt: { gte: startDate } } : {}),
      appointments: { some: { barberId: { not: null } } },
      ...(serviceId ? { serviceId } : {}),
    },
    select: {
      finalPrice: true,
      rating: true,
      appointments: {
        select: { barberId: true },
      },
    },
  });

  const stats = new Map<string, { revenue: number; ratingSum: number; reviews: number }>();

  histories.forEach((history) => {
    const barberId = history.appointments[0]?.barberId;
    if (!barberId) return;

    const current = stats.get(barberId) || { revenue: 0, ratingSum: 0, reviews: 0 };

    current.revenue += toNumber(history.finalPrice);
    if (typeof history.rating === "number") {
      current.ratingSum += history.rating;
      current.reviews += 1;
    }

    stats.set(barberId, current);
  });

  if (stats.size === 0) {
    return [];
  }

  const barbers = await db.user.findMany({
    where: {
      id: { in: Array.from(stats.keys()) },
      role: "BARBER",
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return barbers
    .map((barber) => {
      const data = stats.get(barber.id);
      const averageRating = data && data.reviews > 0 ? Number((data.ratingSum / data.reviews).toFixed(1)) : 0;

      return {
        id: barber.id,
        name: barber.name || "Sem nome",
        totalReviews: data?.reviews ?? 0,
        averageRating,
        totalRevenue: Number((data?.revenue ?? 0).toFixed(2)),
      };
    })
    .filter((barber) => barber.totalRevenue > 0 || barber.totalReviews > 0)
    .sort((a, b) => {
      if (b.totalRevenue === a.totalRevenue) {
        return b.averageRating - a.averageRating;
      }
      return b.totalRevenue - a.totalRevenue;
    });
}

async function buildMonthlyGrowth(now: Date, serviceId?: string): Promise<MonthlyGrowthEntry[]> {
  const referenceStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const histories = await db.serviceHistory.findMany({
    where: {
      completedAt: { gte: referenceStart },
      ...(serviceId ? { serviceId } : {}),
    },
    select: { completedAt: true, finalPrice: true },
  });

  const months = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    return {
      key,
      label: date.toLocaleString("pt-BR", { month: "short" }),
    };
  });

  const aggregated = new Map<string, { revenue: number; services: number }>();

  histories.forEach((history) => {
    const key = `${history.completedAt.getFullYear()}-${history.completedAt.getMonth()}`;
    const current = aggregated.get(key) || { revenue: 0, services: 0 };

    current.revenue += toNumber(history.finalPrice);
    current.services += 1;

    aggregated.set(key, current);
  });

  const maxRevenue = Math.max(...months.map((month) => aggregated.get(month.key)?.revenue ?? 0), 0);

  return months.map((month, index) => {
    const data = aggregated.get(month.key) || { revenue: 0, services: 0 };
    const prevKey = index > 0 ? months[index - 1].key : null;
    const prevRevenue = prevKey ? (aggregated.get(prevKey)?.revenue ?? 0) : 0;
    const growthRate =
      prevRevenue > 0 ? ((data.revenue - prevRevenue) / prevRevenue) * 100 : data.revenue > 0 ? 100 : 0;

    const progress = maxRevenue > 0 ? Math.round((data.revenue / maxRevenue) * 100) : 0;

    return {
      month: month.label.charAt(0).toUpperCase() + month.label.slice(1),
      revenue: Number(data.revenue.toFixed(2)),
      services: data.services,
      progress,
      growthRate: Number(growthRate.toFixed(1)),
    };
  });
}

type PaymentAggregationBucket = {
  revenue: number;
  count: number;
  services: Map<string, { name: string; revenue: number }>;
  barbers: Map<string, { name: string | null; revenue: number }>;
};

async function buildPaymentMethodAnalytics(
  startDate: Date,
  serviceId?: string,
): Promise<{
  paymentMethods: PaymentBreakdown[];
  paymentMethodDetails: PaymentMethodDetails[];
}> {
  const histories = await db.serviceHistory.findMany({
    where: {
      completedAt: { gte: startDate },
      ...(serviceId ? { serviceId } : {}),
    },
    select: {
      finalPrice: true,
      paymentMethod: true,
      service: {
        select: { id: true, name: true },
      },
      appointments: {
        select: {
          barber: {
            select: { id: true, name: true },
          },
        },
        take: 1,
      },
    },
  });

  if (histories.length === 0) {
    return { paymentMethods: [], paymentMethodDetails: [] };
  }

  const totalRevenue = histories.reduce((acc, history) => acc + toNumber(history.finalPrice), 0);
  const totalTransactions = histories.length;
  const byMethod = new Map<PaymentMethod, PaymentAggregationBucket>();

  histories.forEach((history) => {
    const method = history.paymentMethod ?? PaymentMethod.OTHER;
    const price = toNumber(history.finalPrice);
    const current: PaymentAggregationBucket = byMethod.get(method) ?? {
      revenue: 0,
      count: 0,
      services: new Map(),
      barbers: new Map(),
    };

    current.revenue += price;
    current.count += 1;

    if (history.service) {
      const serviceBucket = current.services.get(history.service.id) ?? {
        name: history.service.name,
        revenue: 0,
      };
      serviceBucket.revenue += price;
      current.services.set(history.service.id, serviceBucket);
    }

    const barber = history.appointments[0]?.barber;
    if (barber) {
      const barberBucket = current.barbers.get(barber.id) ?? { name: barber.name, revenue: 0 };
      barberBucket.revenue += price;
      current.barbers.set(barber.id, barberBucket);
    }

    byMethod.set(method, current);
  });

  const paymentMethods = Array.from(byMethod.entries())
    .map(([method, data]) => {
      const revenueShare = totalRevenue > 0 ? Number(((data.revenue / totalRevenue) * 100).toFixed(1)) : 0;
      const volumeShare = totalTransactions > 0 ? Math.round((data.count / totalTransactions) * 100) : 0;

      return {
        method,
        count: data.count,
        revenue: Number(data.revenue.toFixed(2)),
        revenueShare,
        volumeShare,
        averageTicket: data.count > 0 ? Number((data.revenue / data.count).toFixed(2)) : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const paymentMethodDetails = paymentMethods.map(({ method, revenue }) => {
    const bucket = byMethod.get(method);

    const toEntries = <T extends { name: string | null; revenue: number }>(
      source: Map<string, T>,
    ): PaymentDrilldownEntry[] =>
      Array.from(source.entries())
        .map(([id, value]) => ({
          id,
          name: value.name,
          revenue: Number(value.revenue.toFixed(2)),
          percentage: revenue > 0 ? Math.round((value.revenue / revenue) * 100) : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return {
      method,
      topServices: toEntries(bucket?.services ?? new Map()),
      topBarbers: toEntries(bucket?.barbers ?? new Map()),
    };
  });

  return { paymentMethods, paymentMethodDetails };
}

async function getServiceOptions(): Promise<ServiceOption[]> {
  const services = await db.service.findMany({
    select: { id: true, name: true, active: true },
    orderBy: { name: "asc" },
  });

  return services.map((service) => ({
    id: service.id,
    name: service.name,
    active: service.active,
  }));
}

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const formatMonthLabel = (date: Date) => {
  const month = date.toLocaleString("pt-BR", { month: "short" });
  const safeMonth = month ? month.charAt(0).toUpperCase() + month.slice(1) : "";
  return `${safeMonth} ${date.getFullYear()}`;
};

async function buildCustomerCohort(startDate: Date, serviceId?: string): Promise<CohortMonth[]> {
  const histories = await db.serviceHistory.findMany({
    where: { completedAt: { gte: startDate }, ...(serviceId ? { serviceId } : {}) },
    select: { userId: true, completedAt: true },
  });

  if (histories.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(histories.map((history) => history.userId)));

  const firstServices = await db.serviceHistory.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, ...(serviceId ? { serviceId } : {}) },
    _min: { completedAt: true },
  });

  const firstServiceByUser = new Map<string, Date | null>(
    firstServices.map((entry) => [entry.userId, entry._min.completedAt]),
  );

  const monthBuckets = new Map<string, { newClients: Set<string>; returningClients: Set<string> }>();

  histories.forEach((history) => {
    const monthKey = getMonthKey(history.completedAt);
    const bucket = monthBuckets.get(monthKey) ?? { newClients: new Set<string>(), returningClients: new Set<string>() };
    const firstDate = firstServiceByUser.get(history.userId);
    const firstMonthKey = firstDate ? getMonthKey(firstDate) : monthKey;

    if (firstMonthKey === monthKey) {
      bucket.newClients.add(history.userId);
    } else {
      bucket.returningClients.add(history.userId);
    }

    monthBuckets.set(monthKey, bucket);
  });

  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const now = new Date();
  const months: Date[] = [];
  let cursor = startMonth;

  while (cursor <= now) {
    months.push(new Date(cursor));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return months.map((monthDate) => {
    const key = getMonthKey(monthDate);
    const bucket = monthBuckets.get(key) ?? { newClients: new Set<string>(), returningClients: new Set<string>() };
    const total = bucket.newClients.size + bucket.returningClients.size;
    const retentionRate = total > 0 ? Math.round((bucket.returningClients.size / total) * 100) : 0;

    return {
      month: formatMonthLabel(monthDate),
      newClients: bucket.newClients.size,
      returningClients: bucket.returningClients.size,
      retentionRate,
    };
  });
}

async function calculateLtvMetrics(startDate: Date, serviceId?: string): Promise<LtvMetrics> {
  const histories = await db.serviceHistory.findMany({
    where: { completedAt: { gte: startDate }, ...(serviceId ? { serviceId } : {}) },
    select: {
      userId: true,
      finalPrice: true,
      appointments: {
        select: {
          barberId: true,
          barber: { select: { id: true, name: true } },
        },
        take: 1,
      },
    },
  });

  if (histories.length === 0) {
    return {
      totalRevenue: 0,
      uniqueClients: 0,
      globalLtv: 0,
      byBarber: [],
    };
  }

  const totalRevenue = histories.reduce((acc, history) => acc + toNumber(history.finalPrice), 0);
  const uniqueClients = new Set(histories.map((history) => history.userId)).size;
  const globalLtv = uniqueClients > 0 ? Number((totalRevenue / uniqueClients).toFixed(2)) : 0;

  const barberStats = new Map<string, { name: string | null; revenue: number; clients: Set<string> }>();

  histories.forEach((history) => {
    const barberId = history.appointments[0]?.barberId;
    if (!barberId) return;

    const current = barberStats.get(barberId) ?? {
      name: history.appointments[0]?.barber?.name || null,
      revenue: 0,
      clients: new Set<string>(),
    };

    current.revenue += toNumber(history.finalPrice);
    current.clients.add(history.userId);

    barberStats.set(barberId, current);
  });

  const byBarber = Array.from(barberStats.entries())
    .map(([barberId, data]) => ({
      barberId,
      barberName: data.name,
      revenue: Number(data.revenue.toFixed(2)),
      uniqueClients: data.clients.size,
      ltv: data.clients.size > 0 ? Number((data.revenue / data.clients.size).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    uniqueClients,
    globalLtv,
    byBarber,
  };
}

type AppointmentForCapacity = {
  status: AppointmentStatus;
  barberId: string;
  serviceId: string;
  service: { duration: number; name: string };
  barber?: { name: string | null };
};

function buildCapacityMetrics({
  appointments,
  activeBarbers,
  daysInRange,
}: {
  appointments: AppointmentForCapacity[];
  activeBarbers: Array<{ id: string; name: string | null }>;
  daysInRange: number;
}): CapacityMetrics {
  const slotMinutes = CAPACITY_CONFIG.slotMinutes;
  const slotsPerDay = Math.max(
    1,
    Math.floor(((CAPACITY_CONFIG.workdayEndHour - CAPACITY_CONFIG.workdayStartHour) * 60) / slotMinutes),
  );
  const baseSlotsPerBarber = slotsPerDay * Math.max(1, daysInRange);

  const barberPool =
    activeBarbers.length > 0
      ? activeBarbers
      : Array.from(
          new Map(
            appointments.map((appointment) => [
              appointment.barberId,
              { id: appointment.barberId, name: appointment.barber?.name || "Barbeiro" },
            ]),
          ).values(),
        );

  type CapacityAccumulator = {
    id: string;
    name: string;
    usedSlots: number;
    availableSlots: number;
    totalAppointments: number;
    noShowCount: number;
    cancelCount: number;
  };

  const makeAccumulator = (id: string, name: string, availableSlots: number): CapacityAccumulator => ({
    id,
    name,
    availableSlots,
    usedSlots: 0,
    totalAppointments: 0,
    noShowCount: 0,
    cancelCount: 0,
  });

  const barberStats = new Map<string, CapacityAccumulator>();
  barberPool.forEach((barber) => {
    barberStats.set(barber.id, makeAccumulator(barber.id, barber.name || "Barbeiro", baseSlotsPerBarber));
  });

  const totalSlotsAvailable = baseSlotsPerBarber * Math.max(1, barberPool.length);

  const serviceStats = new Map<string, CapacityAccumulator>();

  let slotsUsed = 0;
  let totalNoShow = 0;
  let totalCancelled = 0;

  appointments.forEach((appointment) => {
    const slotsNeeded = Math.max(1, Math.ceil((appointment.service?.duration ?? slotMinutes) / slotMinutes));
    const isUsed = ![AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW].includes(appointment.status);

    const barberEntry =
      barberStats.get(appointment.barberId) ??
      makeAccumulator(appointment.barberId, appointment.barber?.name || "Barbeiro", baseSlotsPerBarber);

    const serviceEntry =
      serviceStats.get(appointment.serviceId) ??
      makeAccumulator(appointment.serviceId, appointment.service?.name || "Serviço", totalSlotsAvailable);

    barberEntry.totalAppointments += 1;
    serviceEntry.totalAppointments += 1;

    if (isUsed) {
      barberEntry.usedSlots += slotsNeeded;
      serviceEntry.usedSlots += slotsNeeded;
      slotsUsed += slotsNeeded;
    }

    if (appointment.status === AppointmentStatus.NO_SHOW) {
      barberEntry.noShowCount += 1;
      serviceEntry.noShowCount += 1;
      totalNoShow += 1;
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      barberEntry.cancelCount += 1;
      serviceEntry.cancelCount += 1;
      totalCancelled += 1;
    }

    barberStats.set(appointment.barberId, barberEntry);
    serviceStats.set(appointment.serviceId, serviceEntry);
  });

  const thresholds = CAPACITY_CONFIG.thresholds;

  const toCapacityItem = (entry: CapacityAccumulator): CapacityItem => {
    const occupancyRate =
      entry.availableSlots > 0 ? Math.min(100, Number(((entry.usedSlots / entry.availableSlots) * 100).toFixed(1))) : 0;
    const noShowRate =
      entry.totalAppointments > 0 ? Number(((entry.noShowCount / entry.totalAppointments) * 100).toFixed(1)) : 0;
    const cancelRate =
      entry.totalAppointments > 0 ? Number(((entry.cancelCount / entry.totalAppointments) * 100).toFixed(1)) : 0;

    return {
      id: entry.id,
      name: entry.name,
      usedSlots: entry.usedSlots,
      availableSlots: entry.availableSlots,
      occupancyRate,
      totalAppointments: entry.totalAppointments,
      noShowRate,
      cancelRate,
      alerts: {
        occupancy: occupancyRate >= thresholds.occupancy,
        noShow: noShowRate >= thresholds.noShow,
        cancel: cancelRate >= thresholds.cancel,
      },
    };
  };

  const byBarber = Array.from(barberStats.values())
    .map(toCapacityItem)
    .sort((a, b) => b.occupancyRate - a.occupancyRate || b.totalAppointments - a.totalAppointments);

  const byService = Array.from(serviceStats.values())
    .map(toCapacityItem)
    .sort((a, b) => b.usedSlots - a.usedSlots || b.totalAppointments - a.totalAppointments);

  const slotsAvailable = Math.max(totalSlotsAvailable, baseSlotsPerBarber);
  const occupancyRate = slotsAvailable > 0 ? Number(((slotsUsed / slotsAvailable) * 100).toFixed(1)) : 0;
  const totalAppointments = appointments.length;
  const noShowRate = totalAppointments > 0 ? Number(((totalNoShow / totalAppointments) * 100).toFixed(1)) : 0;
  const cancelRate = totalAppointments > 0 ? Number(((totalCancelled / totalAppointments) * 100).toFixed(1)) : 0;

  return {
    summary: {
      slotsUsed,
      slotsAvailable,
      occupancyRate,
      noShowRate,
      cancelRate,
      totalAppointments,
    },
    thresholds,
    byBarber,
    byService,
  };
}

/**
 * Buscar todos os usuários para o painel administrativo
 */
export async function getUsersForAdmin() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
        data: [],
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores",
        data: [],
      };
    }

    const result = await UserService.findMany({
      status: "ALL",
      includeDeleted: true,
      page: 1,
      limit: 200,
    });

    return {
      success: true,
      data: result.users,
    };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return {
      success: false,
      error: "Erro ao buscar usuários",
      data: [],
    };
  }
}

/**
 * Buscar todos os barbeiros com suas métricas
 *
 * @param filters - Filtros de busca, performance, ordenação e paginação
 * @param filters.search - Buscar por nome ou email
 * @param filters.performanceMin - Rating mínimo (1-5)
 * @param filters.sortBy - Ordenar por: "name" | "rating" | "appointments"
 * @param filters.page - Página atual (default: 1)
 * @param filters.limit - Itens por página (default: 20, max: 50)
 *
 * @returns Lista paginada de barbeiros com métricas agregadas
 */
export async function getBarbersForAdmin(filters?: {
  search?: string;
  performanceMin?: number;
  sortBy?: "name" | "rating" | "appointments";
  page?: number;
  limit?: number;
}) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores",
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    // Parâmetros de paginação
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(50, Math.max(1, filters?.limit || 20));
    const skip = (page - 1) * limit;

    // Construir filtros de busca
    const whereClause: any = {
      role: "BARBER",
      deletedAt: null,
    };

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Buscar barbeiros (sem paginação inicial para aplicar filtro de rating)
    const barbeiros = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        appointments: {
          select: {
            id: true,
            serviceHistory: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    // Processar dados dos barbeiros com métricas
    let barbersWithMetrics: Barber[] = barbeiros.map((barber) => {
      const allRatings = barber.appointments
        .map((apt) => apt.serviceHistory?.rating)
        .filter((rating): rating is number => rating !== null && rating !== undefined);

      return {
        id: barber.id,
        name: barber.name,
        email: barber.email,
        role: barber.role,
        createdAt: barber.createdAt,
        totalReviews: allRatings.length,
        averageRating:
          allRatings.length > 0
            ? Number((allRatings.reduce((acc, rating) => acc + rating, 0) / allRatings.length).toFixed(1))
            : null,
        totalAppointments: barber.appointments.length,
      };
    });

    // Aplicar filtro de performance mínima
    if (filters?.performanceMin !== undefined && filters.performanceMin > 0) {
      barbersWithMetrics = barbersWithMetrics.filter(
        (b) => b.averageRating !== null && b.averageRating >= filters.performanceMin!,
      );
    }

    // Ordenar
    const sortBy = filters?.sortBy || "name";
    barbersWithMetrics.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          // Barbeiros sem rating vão para o final
          if (a.averageRating === null && b.averageRating === null) return 0;
          if (a.averageRating === null) return 1;
          if (b.averageRating === null) return -1;
          return b.averageRating - a.averageRating; // Decrescente
        case "appointments":
          return b.totalAppointments - a.totalAppointments; // Decrescente
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    // Calcular paginação
    const total = barbersWithMetrics.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = barbersWithMetrics.slice(skip, skip + limit);

    const ratedBarbers = barbersWithMetrics.filter((b) => b.averageRating !== null);

    const averageRating =
      ratedBarbers.length > 0
        ? Number(
            (ratedBarbers.reduce((acc, barber) => acc + (barber.averageRating || 0), 0) / ratedBarbers.length).toFixed(
              2,
            ),
          )
        : 0;

    const activeCount = barbersWithMetrics.filter((b) => b.totalAppointments > 0).length;

    const topPerformer = barbersWithMetrics.reduce<Barber | null>((best, current) => {
      if (!best) return current;
      if (current.averageRating === null) return best;
      if (best.averageRating === null) return current;
      return current.averageRating > best.averageRating ? current : best;
    }, null);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      metrics: {
        averageRating,
        activeCount,
        totalReviews: barbersWithMetrics.reduce((acc, b) => acc + (b.totalReviews || 0), 0),
        topPerformer: topPerformer?.name || null,
      } satisfies BarberMetrics,
    };
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    return {
      success: false,
      error: "Erro ao buscar barbeiros",
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      metrics: {
        averageRating: 0,
        activeCount: 0,
        totalReviews: 0,
        topPerformer: null,
      },
    };
  }
}

/**
 * Buscar dados para relatórios
 *
 * @param dateRange - Período do relatório: "7d" | "30d" | "3m" | "year" (default: "30d")
 * @param serviceId - Filtro opcional por serviço para métricas e coortes
 */
export async function getReportsData(dateRange?: ReportDateRange, serviceId?: string) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
        data: null,
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores",
        data: null,
      };
    }

    // Calcular data de início baseado no range
    const now = new Date();
    let startDate: Date;

    switch (dateRange || "30d") {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    const normalizedNow = new Date(now);
    normalizedNow.setHours(0, 0, 0, 0);

    const daysInRange = Math.max(
      1,
      Math.round((normalizedNow.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );

    const periodLength = now.getTime() - startDate.getTime();
    const previousPeriodStart = new Date(startDate.getTime() - periodLength);

    const serviceOptions = await getServiceOptions();
    const selectedServiceId = serviceId && serviceOptions.some((option) => option.id === serviceId) ? serviceId : null;

    const appointmentBaseWhere = {
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      ...(selectedServiceId ? { serviceId: selectedServiceId } : {}),
    };

    const serviceHistoryBaseWhere = selectedServiceId ? { serviceId: selectedServiceId } : {};

    const activeBarbers = await db.user.findMany({
      where: { role: "BARBER", deletedAt: null, isActive: true },
      select: { id: true, name: true },
    });

    // Dados básicos (não filtrados por data)
    const totalClients = (
      await db.serviceHistory.findMany({
        where: serviceHistoryBaseWhere,
        distinct: ["userId"],
        select: { userId: true },
      })
    ).length;

    const totalAppointments = await db.appointment.count({
      where: appointmentBaseWhere,
    });

    // Agendamentos no período selecionado (com dados de duração)
    const periodAppointments = await db.appointment.findMany({
      where: {
        ...appointmentBaseWhere,
        date: { gte: startDate },
      },
      select: {
        date: true,
        service: {
          select: { duration: true },
        },
      },
    });

    const periodAppointmentsDetailed = await db.appointment.findMany({
      where: {
        ...(selectedServiceId ? { serviceId: selectedServiceId } : {}),
        date: { gte: startDate },
      },
      select: {
        status: true,
        barberId: true,
        serviceId: true,
        service: { select: { duration: true, name: true } },
        barber: { select: { name: true } },
      },
    });

    const monthlyAppointments = periodAppointments.length;

    const previousAppointments = await db.appointment.count({
      where: {
        ...appointmentBaseWhere,
        date: { gte: previousPeriodStart, lt: startDate },
      },
    });

    // Métricas de reviews e receita
    const ratingsAggregate = await db.serviceHistory.aggregate({
      where: { ...serviceHistoryBaseWhere, rating: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const totalRevenueData = await db.serviceHistory.aggregate({
      where: serviceHistoryBaseWhere,
      _sum: { finalPrice: true },
    });

    const periodRevenueData = await db.serviceHistory.aggregate({
      where: { ...serviceHistoryBaseWhere, completedAt: { gte: startDate } },
      _sum: { finalPrice: true },
      _count: { id: true },
    });

    const previousRevenueData = await db.serviceHistory.aggregate({
      where: {
        ...serviceHistoryBaseWhere,
        completedAt: { gte: previousPeriodStart, lt: startDate },
      },
      _sum: { finalPrice: true },
    });

    const periodRatings = await db.serviceHistory.aggregate({
      where: {
        ...serviceHistoryBaseWhere,
        completedAt: { gte: startDate },
        rating: { not: null },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const lastSevenDays = new Date();
    lastSevenDays.setDate(lastSevenDays.getDate() - 7);

    const todayRevenueData = await db.serviceHistory.aggregate({
      where: { ...serviceHistoryBaseWhere, completedAt: { gte: startOfToday } },
      _sum: { finalPrice: true },
    });

    const weekRevenueData = await db.serviceHistory.aggregate({
      where: { ...serviceHistoryBaseWhere, completedAt: { gte: lastSevenDays } },
      _sum: { finalPrice: true },
    });

    const { paymentMethods, paymentMethodDetails } = await buildPaymentMethodAnalytics(startDate, selectedServiceId);

    const customerCohort = await buildCustomerCohort(startDate, selectedServiceId);
    const newClientsInPeriod = customerCohort.reduce((acc, bucket) => acc + bucket.newClients, 0);
    const ltv = await calculateLtvMetrics(startDate, selectedServiceId);

    // Duração média dos atendimentos
    const averageDurationMinutes = (() => {
      const durations = periodAppointments
        .map((appointment) => appointment.service?.duration)
        .filter((duration): duration is number => typeof duration === "number");

      if (!durations.length) {
        return 0;
      }

      const total = durations.reduce((acc, duration) => acc + duration, 0);
      return Math.round(total / durations.length);
    })();

    // Taxa de retorno de clientes
    const returnRateGroup = await db.appointment.groupBy({
      by: ["userId"],
      where: {
        date: { gte: startDate },
        ...appointmentBaseWhere,
      },
      _count: { _all: true },
    });

    const returningClients = returnRateGroup.filter((entry) => entry._count._all > 1).length;
    const returnRate = returnRateGroup.length > 0 ? Math.round((returningClients / returnRateGroup.length) * 100) : 0;

    const busyHours = calculateBusyHours(periodAppointments);

    const monthlyGrowth = await buildMonthlyGrowth(now, selectedServiceId);

    const capacity = buildCapacityMetrics({
      appointments: periodAppointmentsDetailed as AppointmentForCapacity[],
      activeBarbers,
      daysInRange,
    });

    const periodRevenue = toNumber(periodRevenueData._sum.finalPrice);
    const previousRevenue = toNumber(previousRevenueData._sum.finalPrice);
    const revenueChangePercent =
      previousRevenue > 0 ? ((periodRevenue - previousRevenue) / previousRevenue) * 100 : periodRevenue > 0 ? 100 : 0;

    const appointmentsChangePercent =
      previousAppointments > 0
        ? ((monthlyAppointments - previousAppointments) / previousAppointments) * 100
        : monthlyAppointments > 0
          ? 100
          : 0;

    const averageTicket =
      (periodRevenueData._count?.id || 0) > 0
        ? Number((periodRevenue / (periodRevenueData._count?.id || 1)).toFixed(2))
        : 0;

    const topBarbers = (await getTopBarbersByRevenue(startDate, selectedServiceId)).slice(0, 10);

    const reportsData: ReportsData = {
      totalRevenue: toNumber(totalRevenueData._sum.finalPrice),
      monthlyRevenue: periodRevenue,
      totalClients,
      totalAppointments,
      monthlyAppointments,
      averageRating: Number((periodRatings._avg.rating ?? ratingsAggregate._avg.rating ?? 0).toFixed(1)),
      totalReviews: periodRatings._count.rating || ratingsAggregate._count.rating || 0,
      topBarbers: topBarbers.map((barber) => ({
        id: barber.id,
        name: barber.name,
        totalReviews: barber.totalReviews,
        averageRating: barber.averageRating,
        totalRevenue: barber.totalRevenue,
      })),
      monthlyGrowth,
      paymentMethods,
      paymentMethodDetails,
      busyHours,
      periodComparison: {
        revenueChangePercent: Number(revenueChangePercent.toFixed(1)),
        appointmentsChangePercent: Number(appointmentsChangePercent.toFixed(1)),
        newClients: newClientsInPeriod,
      },
      todayRevenue: toNumber(todayRevenueData._sum.finalPrice),
      weekRevenue: toNumber(weekRevenueData._sum.finalPrice),
      averageTicket,
      averageDurationMinutes,
      returnRate,
      customerCohort,
      ltv,
      capacity,
      serviceOptions,
    };

    return {
      success: true,
      data: reportsData,
    };
  } catch (error) {
    console.error("Erro ao buscar dados de relatórios:", error);
    return {
      success: false,
      error: "Erro ao buscar dados de relatórios",
      data: null,
    };
  }
}

/**
 * Atualizar role de um usuário
 */
export async function updateUserRole(userId: string, newRole: "CLIENT" | "BARBER" | "ADMIN") {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores podem alterar roles",
      };
    }

    const targetUser = await db.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Usuário não encontrado ou removido.",
      };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: newRole, updatedById: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    logger.info("User role updated", {
      actorId: session.user.id,
      userId,
      newRole,
    });

    revalidatePath("/dashboard/admin/users");

    return {
      success: true,
      data: updatedUser,
      message: `Usuário promovido para ${newRole} com sucesso!`,
    };
  } catch (error) {
    console.error("Erro ao atualizar role do usuário:", error);
    return {
      success: false,
      error: "Erro ao atualizar role do usuário",
    };
  }
}

/**
 * Buscar usuário específico por ID
 */
export async function getUserById(userId: string) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores",
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nickname: true,
        phone: true,
        image: true,
        isActive: true,
        deletedAt: true,
        deletedById: true,
        updatedById: true,
        createdAt: true,
        appointments: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            serviceHistory: {
              select: {
                rating: true,
                feedback: true,
                finalPrice: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return {
      success: false,
      error: "Erro ao buscar usuário",
    };
  }
}

/**
 * Deletar usuário (soft delete ou inativação)
 */
export async function deleteUser(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores podem inativar usuários",
      };
    }

    if (session.user.id === userId) {
      return {
        success: false,
        error: "Você não pode remover sua própria conta.",
      };
    }

    const user = await UserService.softDeleteUser(userId, session.user.id);

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado ou já removido.",
      };
    }

    logger.warn("User soft deleted via adminActions", {
      actorId: session.user.id,
      userId,
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${userId}`);

    return {
      success: true,
      message: "Usuário inativado com sucesso",
      data: user,
    };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return {
      success: false,
      error: "Erro ao inativar usuário",
    };
  }
}
