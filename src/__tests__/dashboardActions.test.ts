/**
 * Dashboard Actions Test Suite
 * Tests for all server actions in /src/server/dashboardActions.ts
 */

import { UserRole } from "@prisma/client";

// Unmock from global setup
jest.unmock("@/server/dashboardActions");

// Mock dependencies FIRST
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  db: {
    serviceHistory: {
      aggregate: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    appointment: {
      count: jest.fn(),
    },
  },
}));

// Now import after mocks
import {
  getBarberMetrics,
  getDashboardMetrics,
  getAdminMetrics,
} from "@/server/dashboardActions";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";

// Type mocks
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

type MockDb = {
  serviceHistory: {
    aggregate: jest.Mock;
    count: jest.Mock;
    findMany: jest.Mock;
    groupBy: jest.Mock;
  };
  user: {
    count: jest.Mock;
    groupBy: jest.Mock;
    findMany: jest.Mock;
  };
  appointment: {
    count: jest.Mock;
  };
};

const mockDb = db as unknown as MockDb;

describe("dashboardActions", () => {
  // Common test data
  const mockSession = {
    user: {
      id: "user-123",
      email: "user@test.com",
      name: "Test User",
      role: UserRole.CLIENT,
    },
    expires: "2025-12-31",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe("getBarberMetrics", () => {
    const barberId = "barber-123";

    test("deve calcular métricas do barbeiro com sucesso", async () => {
      // Setup session
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, id: barberId, role: UserRole.BARBER },
      } as any);

      // Mock aggregate calls
      mockDb.serviceHistory.aggregate
        .mockResolvedValueOnce({ _avg: { rating: 4.5 }, _count: { rating: 50 } } as any)
        .mockResolvedValueOnce({ _avg: { rating: 4.8 }, _count: { rating: 15 } } as any)
        .mockResolvedValueOnce({ _sum: { finalPrice: 1500 }, _count: 30 } as any);

      mockDb.serviceHistory.count.mockResolvedValue(10);
      mockDb.serviceHistory.findMany
        .mockResolvedValueOnce(Array(100).fill({ userId: "user-x" }) as any)
        .mockResolvedValueOnce(Array(30).fill({ userId: "user-y" }) as any);
      mockDb.serviceHistory.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 25 } },
        { rating: 4, _count: { rating: 15 } },
      ] as any);

      const result = await getBarberMetrics(barberId);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        averageRating: 4.5,
        totalReviews: 50,
        totalClients: 100,
        monthlyReviews: 15,
        monthlyClients: 30,
        monthlyRevenue: 1500,
        fiveStarReviews: 10,
        totalServices: 30,
      });
    });

    test("deve rejeitar se não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getBarberMetrics(barberId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuário não autenticado");
    });

    test("deve rejeitar se não é o barbeiro nem ADMIN", async () => {
      const result = await getBarberMetrics("other-barber-456");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Não autorizado");
    });

    test("deve permitir ADMIN ver métricas de qualquer barbeiro", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      mockDb.serviceHistory.aggregate
        .mockResolvedValueOnce({ _avg: { rating: 4.0 }, _count: { rating: 10 } } as any)
        .mockResolvedValueOnce({ _avg: { rating: 4.0 }, _count: { rating: 2 } } as any)
        .mockResolvedValueOnce({ _sum: { finalPrice: 100 }, _count: 5 } as any);
      mockDb.serviceHistory.count.mockResolvedValue(0);
      mockDb.serviceHistory.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockDb.serviceHistory.groupBy.mockResolvedValue([]);

      const result = await getBarberMetrics("other-barber-456");

      expect(result.success).toBe(true);
    });

    test("deve tratar erro inesperado", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      mockDb.serviceHistory.aggregate.mockRejectedValue(new Error("Database error"));

      const result = await getBarberMetrics(barberId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro interno do servidor");
    });
  });

  describe("getDashboardMetrics", () => {
    const userId = "user-123";

    test("deve retornar métricas de CLIENT corretamente", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.CLIENT },
      } as any);

      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _count: { rating: 10 },
        _avg: { rating: 4.5 },
      } as any);

      mockDb.serviceHistory.count.mockResolvedValue(5);

      const result = await getDashboardMetrics(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalReviews: 10,
        averageGiven: 4.5,
        monthlyServices: 5,
        userRole: "CLIENT",
      });

      expect(mockDb.serviceHistory.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            rating: { not: null },
          },
        })
      );
    });

    test("deve redirecionar para getBarberMetrics se role é BARBER", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, id: userId, role: UserRole.BARBER },
      } as any);

      // Mock calls for getBarberMetrics
      mockDb.serviceHistory.aggregate
        .mockResolvedValueOnce({ _avg: { rating: 4.5 }, _count: { rating: 50 } } as any)
        .mockResolvedValueOnce({ _avg: { rating: 4.8 }, _count: { rating: 15 } } as any)
        .mockResolvedValueOnce({ _sum: { finalPrice: 1500 }, _count: 30 } as any);
      mockDb.serviceHistory.count.mockResolvedValue(10);
      mockDb.serviceHistory.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockDb.serviceHistory.groupBy.mockResolvedValue([]);

      const result = await getDashboardMetrics(userId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("averageRating");
      expect(result.data).toHaveProperty("totalReviews");
    });

    test("deve retornar métricas globais para ADMIN", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _count: { rating: 100 },
        _avg: { rating: 4.7 },
      } as any);

      mockDb.user.count.mockResolvedValue(250);
      mockDb.serviceHistory.count.mockResolvedValue(50);

      const result = await getDashboardMetrics(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalReviews: 100,
        globalAverage: 4.7,
        totalUsers: 250,
        monthlyActivity: 50,
        userRole: "ADMIN",
      });
    });

    test("deve rejeitar se não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getDashboardMetrics(userId);

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toBe("Usuário não autenticado");
    });

    test("deve rejeitar se userId diferente e não ADMIN", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, id: "different-user-456", role: UserRole.CLIENT },
      } as any);

      const result = await getDashboardMetrics(userId);

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toBe("Não autorizado");
    });

    test("deve permitir ADMIN acessar dados de outros usuários", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, id: "admin-999", role: UserRole.ADMIN },
      } as any);

      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _count: { rating: 100 },
        _avg: { rating: 4.7 },
      } as any);
      mockDb.user.count.mockResolvedValue(250);
      mockDb.serviceHistory.count.mockResolvedValue(50);

      const result = await getDashboardMetrics("other-user-123");

      expect(result.success).toBe(true);
    });

    test("deve tratar erro inesperado", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.CLIENT },
      } as any);

      mockDb.serviceHistory.aggregate.mockRejectedValue(new Error("Database error"));

      const result = await getDashboardMetrics(userId);

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toBe("Erro interno do servidor");
    });
  });

  describe("getAdminMetrics", () => {
    test("deve retornar métricas administrativas completas", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      // Mock user groupBy
      mockDb.user.groupBy.mockResolvedValue([
        { role: UserRole.CLIENT, _count: { id: 100 } },
        { role: UserRole.BARBER, _count: { id: 10 } },
        { role: UserRole.ADMIN, _count: { id: 2 } },
      ] as any);

      // Mock user counts
      mockDb.user.count
        .mockResolvedValueOnce(112) // totalUsers
        .mockResolvedValueOnce(25) // newUsersThisMonth
        .mockResolvedValueOnce(80) // activeUsers
        .mockResolvedValueOnce(10); // activeBarbersCount

      // Mock serviceHistory aggregate
      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _count: { rating: 500 },
        _avg: { rating: 4.6 },
      } as any);

      // Mock serviceHistory counts
      mockDb.serviceHistory.count
        .mockResolvedValueOnce(150) // monthlyReviews
        .mockResolvedValueOnce(20) // todayReviews
        .mockResolvedValueOnce(200) // fiveStarReviews
        .mockResolvedValueOnce(300) // monthlyActivity
        .mockResolvedValueOnce(50); // pendingReviews

      // Mock appointment count
      mockDb.appointment.count.mockResolvedValue(180); // monthlyAppointments

      // Mock serviceHistory groupBy for rating distribution
      mockDb.serviceHistory.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 200 } },
        { rating: 4, _count: { rating: 150 } },
        { rating: 3, _count: { rating: 100 } },
      ] as any);

      // Mock top barbers
      mockDb.user.findMany.mockResolvedValue([
        { id: "barber-1", name: "João Barbeiro" },
        { id: "barber-2", name: "Maria Cabelereira" },
      ] as any);

      const result = await getAdminMetrics();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        // Usuários
        totalUsers: 112,
        clientsCount: 100,
        barbersCount: 10,
        adminsCount: 2,
        activeUsers: 80,
        newUsersThisMonth: 25,
        activeBarbersCount: 10,

        // Reviews
        totalReviews: 500,
        globalAverage: 4.6,
        monthlyReviews: 150,
        todayReviews: 20,
        fiveStarReviews: 200,
        pendingReviews: 50,

        // Atividade
        monthlyActivity: 300,
        monthlyAppointments: 180,

        // Financeiro (mocked values)
        totalRevenue: 15420.50,
        monthlyRevenue: 3890.75,
        paidServices: 127,
      });

      expect(result.data!.ratingDistribution).toHaveLength(3);
      expect(result.data!.topBarbers).toHaveLength(2);
    });

    test("deve rejeitar se não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getAdminMetrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuário não autenticado");
    });

    test("deve rejeitar se não é ADMIN", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.CLIENT },
      } as any);

      const result = await getAdminMetrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Não autorizado");
    });

    test("deve rejeitar BARBER tentando acessar métricas admin", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.BARBER },
      } as any);

      const result = await getAdminMetrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Não autorizado");
    });

    test("deve calcular contadores de usuários corretamente quando faltam roles", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      // Mock com apenas CLIENT role (sem BARBER/ADMIN)
      mockDb.user.groupBy.mockResolvedValue([
        { role: UserRole.CLIENT, _count: { id: 50 } },
      ] as any);

      mockDb.user.count.mockResolvedValue(50);
      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _count: { rating: 0 },
        _avg: { rating: null },
      } as any);
      mockDb.serviceHistory.count.mockResolvedValue(0);
      mockDb.appointment.count.mockResolvedValue(0);
      mockDb.serviceHistory.groupBy.mockResolvedValue([]);
      mockDb.user.findMany.mockResolvedValue([]);

      const result = await getAdminMetrics();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (!result.data) {
        throw new Error("Expected admin metrics data");
      }
      expect(result.data.clientsCount).toBe(50);
      expect(result.data.barbersCount).toBe(0);
      expect(result.data.adminsCount).toBe(0);
    });

    test("deve lidar com ratings nulos corretamente", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      mockDb.user.groupBy.mockResolvedValue([]);
      mockDb.user.count.mockResolvedValue(0);
      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _count: { rating: 0 },
        _avg: { rating: null }, // No ratings yet
      } as any);
      mockDb.serviceHistory.count.mockResolvedValue(0);
      mockDb.appointment.count.mockResolvedValue(0);
      mockDb.serviceHistory.groupBy.mockResolvedValue([]);
      mockDb.user.findMany.mockResolvedValue([]);

      const result = await getAdminMetrics();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (!result.data) {
        throw new Error("Expected admin metrics data");
      }
      expect(result.data.globalAverage).toBe(0);
      expect(result.data.totalReviews).toBe(0);
    });

    test("deve tratar erro inesperado", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      mockDb.user.groupBy.mockRejectedValue(new Error("Database connection failed"));

      const result = await getAdminMetrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro interno do servidor");
    });
  });
});
