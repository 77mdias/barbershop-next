/**
 * Barber Dashboard Test Suite
 * Tests for /src/app/dashboard/barber/page.tsx
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
}));

jest.mock("@/server/dashboardActions", () => ({
  getBarberMetrics: jest.fn(),
}));

jest.mock("@/components/ReviewsList", () => ({
  ReviewsList: () => <div data-testid="reviews-list">Reviews List</div>,
}));

jest.mock("@/components/ReviewSection", () => ({
  ReviewSection: () => <div data-testid="review-section">Review Section</div>,
}));

jest.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Now import after mocks
import { render, screen } from "@testing-library/react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getBarberMetrics } from "@/server/dashboardActions";
import BarberDashboardPage from "@/app/dashboard/barber/page";

// Type mocks
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockGetBarberMetrics = getBarberMetrics as jest.MockedFunction<typeof getBarberMetrics>;

describe("BarberDashboardPage", () => {
  const mockBarberSession = {
    user: {
      id: "barber-123",
      email: "barber@test.com",
      name: "João Barbeiro",
      role: UserRole.BARBER,
    },
    expires: "2025-12-31",
  };

  const mockMetrics = {
    success: true,
    data: {
      averageRating: 4.5,
      totalReviews: 50,
      totalClients: 100,
      monthlyReviews: 15,
      monthlyClients: 30,
      monthlyRevenue: 1500,
      fiveStarReviews: 25,
      totalServices: 75,
      monthlyAverageRating: 4.8,
      ratingDistribution: [
        { rating: 5, count: 25, percentage: 50 },
        { rating: 4, count: 15, percentage: 30 },
        { rating: 3, count: 10, percentage: 20 },
      ],
      goals: {
        averageRating: {
          target: 4.5,
          current: 4.8,
          percentage: 100,
        },
        monthlyReviews: {
          target: 20,
          current: 15,
          percentage: 75,
        },
        monthlyClients: {
          target: 100,
          current: 30,
          percentage: 30,
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockBarberSession as any);
    mockGetBarberMetrics.mockResolvedValue(mockMetrics as any);
    // Prevent actual redirects in tests
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  describe("Autenticação e Autorização", () => {
    test("deve redirecionar para login se não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      await expect(async () => {
        await BarberDashboardPage();
      }).rejects.toThrow("NEXT_REDIRECT");

      expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
    });

    test("deve redirecionar CLIENT para dashboard geral", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockBarberSession,
        user: { ...mockBarberSession.user, role: UserRole.CLIENT },
      } as any);

      await expect(async () => {
        await BarberDashboardPage();
      }).rejects.toThrow("NEXT_REDIRECT");

      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    test("deve permitir BARBER acessar o dashboard", async () => {
      const result = await BarberDashboardPage();

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockGetBarberMetrics).toHaveBeenCalledWith("barber-123");
    });

    test("deve permitir ADMIN acessar o dashboard", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockBarberSession,
        user: { ...mockBarberSession.user, role: UserRole.ADMIN },
      } as any);

      const result = await BarberDashboardPage();

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockGetBarberMetrics).toHaveBeenCalled();
    });
  });

  describe("Renderização de Métricas", () => {
    test("deve renderizar header com título e badges", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("Dashboard do Barbeiro");
      expect(container.textContent).toContain("Gerencie seus atendimentos");
      expect(container.textContent).toContain("Barbeiro Ativo");
    });

    test("deve renderizar cards de métricas principais com dados corretos", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      // Verificar avaliação média
      expect(container.textContent).toContain("4.5");
      expect(container.textContent).toContain("Média Geral");

      // Verificar total de reviews
      expect(container.textContent).toContain("50");
      expect(container.textContent).toContain("Total de Reviews");

      // Verificar clientes atendidos
      expect(container.textContent).toContain("100");
      expect(container.textContent).toContain("Total Atendidos");
    });

    test("deve renderizar card de reviews 5 estrelas", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("25");
      expect(container.textContent).toContain("Reviews 5");
    });

    test("deve renderizar métricas mensais", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("50");
      expect(container.textContent).toContain("Total de Reviews");
      expect(container.textContent).toContain("4.8");
      expect(container.textContent).toContain("Média Este Mês");
    });

    test("deve renderizar receita mensal", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      // Receita é renderizada como R$ 1500.00 (sem ponto no milhar)
      expect(container.textContent).toContain("R$ 1500");
      expect(container.textContent).toContain("Este Mês");
    });

    test("deve renderizar goals com progresso", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      // Verificar que as metas e valores aparecem
      expect(container.textContent).toContain("4.8");
      expect(container.textContent).toContain("Média Este Mês");
      // Goals são renderizados em uma seção específica do dashboard
      expect(container.textContent).toContain("Excelência");
    });
  });

  describe("Renderização de Distribuição de Ratings", () => {
    test("deve renderizar distribuição de avaliações corretamente", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      // Verificar que as porcentagens aparecem no texto
      expect(container.textContent).toContain("50");
      expect(container.textContent).toContain("30");
      expect(container.textContent).toContain("20");
    });
  });

  describe("Tabs e Navegação", () => {
    test("deve renderizar tabs de navegação", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("Reviews");
      expect(container.textContent).toContain("Agendamentos");
      expect(container.textContent).toContain("Análise");
      expect(container.textContent).toContain("Performance");
    });

    test("deve renderizar ReviewsList na tab de Reviews", async () => {
      const result = await BarberDashboardPage();
      const { getByTestId } = render(result);

      expect(getByTestId("reviews-list")).toBeInTheDocument();
    });
  });

  describe("Estados de Erro e Edge Cases", () => {
    test("deve lidar com métricas não disponíveis graciosamente", async () => {
      mockGetBarberMetrics.mockResolvedValue({
        success: false,
        error: "Erro ao buscar métricas",
      } as any);

      const result = await BarberDashboardPage();
      const { container } = render(result);

      // Dashboard deve renderizar mesmo sem métricas
      expect(container.textContent).toContain("Dashboard do Barbeiro");
    });

    test("deve exibir valores padrão quando métricas são null", async () => {
      mockGetBarberMetrics.mockResolvedValue({
        success: true,
        data: null,
      } as any);

      const result = await BarberDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("Dashboard do Barbeiro");
    });

    test("deve renderizar com métricas zeradas", async () => {
      mockGetBarberMetrics.mockResolvedValue({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          totalClients: 0,
          monthlyReviews: 0,
          monthlyClients: 0,
          monthlyRevenue: 0,
          fiveStarReviews: 0,
          totalServices: 0,
          monthlyAverageRating: 0,
          ratingDistribution: [],
          goals: {
            averageRating: { target: 4.5, current: 0, percentage: 0 },
            monthlyReviews: { target: 20, current: 0, percentage: 0 },
            monthlyClients: { target: 100, current: 0, percentage: 0 },
          },
        },
      } as any);

      const result = await BarberDashboardPage();
      const { container } = render(result);

      expect(container.textContent).toContain("Dashboard do Barbeiro");
      expect(container.textContent).toContain("0");
    });
  });

  describe("Links e Ações", () => {
    test("deve ter link para dashboard geral", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      const links = container.querySelectorAll("a");
      const dashboardLink = Array.from(links).find((link) =>
        link.getAttribute("href")?.includes("/dashboard")
      );

      expect(dashboardLink).toBeTruthy();
    });
  });

  describe("Responsividade", () => {
    test("deve usar grid responsivo para cards de métricas", async () => {
      const result = await BarberDashboardPage();
      const { container } = render(result);

      // Verificar classes de grid responsivo
      const gridElement = container.querySelector(".grid");
      expect(gridElement?.className).toContain("grid-cols-1");
      expect(gridElement?.className).toContain("md:grid-cols-2");
      expect(gridElement?.className).toContain("lg:grid-cols-4");
    });
  });
});
