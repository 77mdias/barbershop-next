/**
 * Admin Dashboard Test Suite
 * Tests for /src/app/dashboard/admin/page.tsx
 */

import { UserRole } from "@prisma/client";

// Mock dependencies FIRST
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/dashboard/admin",
}));

jest.mock("@/server/dashboardActions", () => ({
  getAdminMetrics: jest.fn(),
}));

jest.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Now import after mocks
import { render, screen } from "@testing-library/react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAdminMetrics } from "@/server/dashboardActions";
import AdminDashboardPage from "@/app/dashboard/admin/page";

// Type mocks
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockGetAdminMetrics = getAdminMetrics as jest.MockedFunction<typeof getAdminMetrics>;

describe("AdminDashboardPage", () => {
  const mockAdminSession = {
    user: {
      id: "admin-123",
      email: "admin@test.com",
      name: "Admin User",
      role: UserRole.ADMIN,
    },
    expires: "2025-12-31",
  };

  const mockMetrics = {
    success: true,
    data: {
      // Usuários
      totalUsers: 250,
      clientsCount: 200,
      barbersCount: 45,
      adminsCount: 5,
      activeUsers: 180,
      newUsersThisMonth: 25,
      activeBarbersCount: 40,

      // Reviews
      totalReviews: 1500,
      globalAverage: 4.6,
      monthlyReviews: 150,
      todayReviews: 12,
      fiveStarReviews: 750,
      pendingReviews: 50,
      ratingDistribution: [
        { rating: 5, _count: { rating: 750 } },
        { rating: 4, _count: { rating: 450 } },
        { rating: 3, _count: { rating: 200 } },
      ],

      // Atividade
      monthlyActivity: 350,
      monthlyAppointments: 280,

      // Financeiro
      totalRevenue: 15420.5,
      monthlyRevenue: 3890.75,
      paidServices: 127,

      // Top performers
      topBarbers: [
        { id: "barber-1", name: "João Barbeiro", totalReviews: 50, averageRating: 4.8 },
        { id: "barber-2", name: "Maria Cabelereira", totalReviews: 45, averageRating: 4.9 },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockAdminSession as any);
    mockGetAdminMetrics.mockResolvedValue(mockMetrics as any);
    // Prevent actual redirects in tests
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  describe("Autenticação e Autorização", () => {
    test("deve redirecionar para login se não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      await expect(async () => {
        await AdminDashboardPage();
      }).rejects.toThrow("NEXT_REDIRECT");

      expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
    });

    test("deve redirecionar CLIENT para dashboard geral", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockAdminSession,
        user: { ...mockAdminSession.user, role: UserRole.CLIENT },
      } as any);

      await expect(async () => {
        await AdminDashboardPage();
      }).rejects.toThrow("NEXT_REDIRECT");

      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    test("deve redirecionar BARBER para dashboard geral", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockAdminSession,
        user: { ...mockAdminSession.user, role: UserRole.BARBER },
      } as any);

      await expect(async () => {
        await AdminDashboardPage();
      }).rejects.toThrow("NEXT_REDIRECT");

      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    test("deve permitir ADMIN acessar o dashboard", async () => {
      const result = await AdminDashboardPage();

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockGetAdminMetrics).toHaveBeenCalled();
    });
  });

  describe("Renderização de Métricas", () => {
    test("deve renderizar header com título e badges", async () => {
      const result = await AdminDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("Painel Administrativo");
      expect(container.textContent).toContain("Gerencie toda a plataforma");
      expect(container.textContent).toContain("Administrador");
    });

    test("deve renderizar métricas de usuários", async () => {
      const result = await AdminDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("250");
      expect(container.textContent).toContain("Total de Usuários");
      expect(container.textContent).toContain("200");
      expect(container.textContent).toContain("Clientes");
      expect(container.textContent).toContain("45");
      expect(container.textContent).toContain("Barbeiros");
    });

    test("deve renderizar métricas de reviews", async () => {
      const result = await AdminDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("1500");
      expect(container.textContent).toContain("Sistema de Reviews");
      expect(container.textContent).toContain("4.6");
      expect(container.textContent).toContain("Média");
    });

    test("deve renderizar métricas de atividade", async () => {
      const result = await AdminDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("350");
      expect(container.textContent).toContain("280");
    });

    test("deve renderizar métricas financeiras", async () => {
      const result = await AdminDashboardPage();
      const { container } = render(result);

      // Verificar valores financeiros
      expect(container.textContent).toContain("15420");
      expect(container.textContent).toContain("3890");
    });

    test("deve renderizar top barbeiros", async () => {
      const result = await AdminDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("João Barbeiro");
      expect(container.textContent).toContain("Maria Cabelereira");
      expect(container.textContent).toContain("4.8");
      expect(container.textContent).toContain("4.9");
    });
  });

  describe("Tabs e Navegação", () => {
    test("deve renderizar tabs de navegação", async () => {
      const result = await AdminDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("Visão Geral");
      expect(container.textContent).toContain("Usuários");
      expect(container.textContent).toContain("Reviews");
      expect(container.textContent).toContain("Sistema");
    });
  });

  describe("Estados de Erro e Edge Cases", () => {
    test("deve lidar com métricas não disponíveis graciosamente", async () => {
      mockGetAdminMetrics.mockResolvedValue({
        success: false,
        error: "Erro ao buscar métricas",
      } as any);

      const result = await AdminDashboardPage();
      const { container } = render(result);

      // Dashboard deve renderizar mesmo sem métricas
      expect(container.textContent).toContain("Painel Administrativo");
    });

    test("deve exibir loading quando métricas são null", async () => {
      mockGetAdminMetrics.mockResolvedValue({
        success: true,
        data: null,
      } as any);

      const result = await AdminDashboardPage();
      const { container } = render(result);

      // Quando métricas são null, mostra loading
      expect(container.textContent).toContain("Loading");
    });

    test("deve renderizar com métricas zeradas", async () => {
      mockGetAdminMetrics.mockResolvedValue({
        success: true,
        data: {
          totalUsers: 0,
          clientsCount: 0,
          barbersCount: 0,
          adminsCount: 0,
          activeUsers: 0,
          newUsersThisMonth: 0,
          activeBarbersCount: 0,
          totalReviews: 0,
          globalAverage: 0,
          monthlyReviews: 0,
          todayReviews: 0,
          fiveStarReviews: 0,
          pendingReviews: 0,
          ratingDistribution: [],
          monthlyActivity: 0,
          monthlyAppointments: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          paidServices: 0,
          topBarbers: [],
        },
      } as any);

      const result = await AdminDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("Painel Administrativo");
      expect(container.textContent).toContain("0");
    });

    test("deve renderizar com distribuição de ratings vazia", async () => {
      mockGetAdminMetrics.mockResolvedValue({
        success: true,
        data: {
          ...mockMetrics.data,
          ratingDistribution: [],
        },
      } as any);

      const result = await AdminDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("Painel Administrativo");
    });

    test("deve renderizar sem top barbeiros", async () => {
      mockGetAdminMetrics.mockResolvedValue({
        success: true,
        data: {
          ...mockMetrics.data,
          topBarbers: [],
        },
      } as any);

      const result = await AdminDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("Painel Administrativo");
    });
  });

  describe("Links e Ações", () => {
    test("deve renderizar componentes interativos", async () => {
      const result = await AdminDashboardPage();
      const { container } = render(result);

      // Verifica que há elementos interativos (tabs, buttons, etc)
      expect(container.querySelectorAll("button").length).toBeGreaterThan(0);
    });
  });

  describe("Responsividade", () => {
    test("deve usar grid responsivo para cards de métricas", async () => {
      const result = await AdminDashboardPage();
      const { container } = render(result);

      // Verificar classes de grid responsivo
      const gridElements = container.querySelectorAll(".grid");
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });
});
