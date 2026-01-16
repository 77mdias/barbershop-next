import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReportsPageClient } from "@/app/dashboard/admin/reports/ReportsPageClient";
import { getReportsData } from "@/server/adminActions";

jest.mock("@/server/adminActions", () => ({
  getReportsData: jest.fn(),
}));

const mockGetReportsData = getReportsData as jest.MockedFunction<typeof getReportsData>;

describe("ReportsPageClient", () => {
  const initialReports = {
    totalRevenue: 1200,
    monthlyRevenue: 300,
    totalClients: 20,
    totalAppointments: 40,
    monthlyAppointments: 15,
    averageRating: 4.5,
    totalReviews: 12,
    topBarbers: [{ id: "1", name: "Carlos", totalReviews: 5, averageRating: 4.8, totalRevenue: 250 }],
    monthlyGrowth: [{ month: "Jan", revenue: 100, services: 4, progress: 50, growthRate: 0 }],
    paymentMethods: [
      { method: "CARD", count: 10, revenue: 180, revenueShare: 60, volumeShare: 62, averageTicket: 18 },
      { method: "PIX", count: 6, revenue: 120, revenueShare: 40, volumeShare: 38, averageTicket: 20 },
    ],
    paymentMethodDetails: [
      {
        method: "CARD",
        topServices: [
          { id: "svc1", name: "Corte", revenue: 90, percentage: 50 },
          { id: "svc2", name: "Barba", revenue: 90, percentage: 50 },
        ],
        topBarbers: [
          { id: "barb1", name: "João", revenue: 110, percentage: 61 },
          { id: "barb2", name: "Marcos", revenue: 70, percentage: 39 },
        ],
      },
      {
        method: "PIX",
        topServices: [{ id: "svc3", name: "Sombrancelha", revenue: 120, percentage: 100 }],
        topBarbers: [{ id: "barb3", name: "Ana", revenue: 120, percentage: 100 }],
      },
    ],
    busyHours: [{ label: "Manhã", range: "8h-12h", count: 2, percentage: 40 }],
    periodComparison: { revenueChangePercent: 12.5, appointmentsChangePercent: 10, newClients: 2 },
    todayRevenue: 25,
    weekRevenue: 200,
    averageTicket: 75,
    averageDurationMinutes: 45,
    returnRate: 60,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetReportsData.mockResolvedValue({
      success: true,
      data: initialReports,
    } as any);
  });

  it("renders KPIs with initial data", async () => {
    render(<ReportsPageClient initialReports={initialReports as any} initialDateRange="30d" />);

    expect(await screen.findByText(/R\$ 1200\.00/)).toBeInTheDocument();

    expect(screen.getByText(/4\.5\/5/)).toBeInTheDocument();
    expect(screen.getByText(/\+2 novos neste período/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Financeiro"));

    expect(screen.getByText("Receita por Método de Pagamento")).toBeInTheDocument();
    expect(screen.getAllByText("Cartão").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/R\$ 180\.00/)[0]).toBeInTheDocument();
    expect(screen.getByText("Corte")).toBeInTheDocument();
  });

  it("refetches when date range changes", async () => {
    render(<ReportsPageClient initialReports={initialReports as any} initialDateRange="30d" />);

    const dateSelect = screen.getByRole("combobox");
    fireEvent.click(dateSelect);
    fireEvent.click(screen.getByText("Últimos 7 dias"));

    await waitFor(() => {
      expect(mockGetReportsData).toHaveBeenCalledWith("7d");
    });
  });

  it("refetches when toggling back to the initial range", async () => {
    render(<ReportsPageClient initialReports={initialReports as any} initialDateRange="30d" />);

    const dateSelect = screen.getByRole("combobox");
    fireEvent.click(dateSelect);
    fireEvent.click(screen.getByText("Últimos 7 dias"));

    await waitFor(() => {
      expect(mockGetReportsData).toHaveBeenCalledWith("7d");
    });

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Últimos 30 dias"));

    await waitFor(() => {
      expect(mockGetReportsData).toHaveBeenCalledWith("30d");
    });

    expect(mockGetReportsData).toHaveBeenCalledTimes(2);
  });

  it("shows empty payment state when there is no breakdown", async () => {
    render(
      <ReportsPageClient
        initialReports={{ ...initialReports, paymentMethods: [], paymentMethodDetails: [] } as any}
        initialDateRange="30d"
      />,
    );

    fireEvent.click(screen.getByText("Financeiro"));

    expect(await screen.findAllByText(/Sem dados de pagamento/i)).not.toHaveLength(0);
  });
});
