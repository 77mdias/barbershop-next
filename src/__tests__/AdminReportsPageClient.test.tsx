import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReportsPageClient } from "@/app/dashboard/admin/reports/ReportsPageClient";
import { getReportsData } from "@/server/adminActions";
import { toast } from "sonner";

jest.mock("@/server/adminActions", () => ({
  getReportsData: jest.fn(),
}));

const mockGetReportsData = getReportsData as jest.MockedFunction<typeof getReportsData>;
const toastMock = toast as unknown as jest.Mocked<typeof toast>;

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
    customerCohort: [{ month: "Jan 2026", newClients: 3, returningClients: 2, retentionRate: 40 }],
    ltv: {
      totalRevenue: 300,
      uniqueClients: 5,
      globalLtv: 60,
      byBarber: [{ barberId: "1", barberName: "Carlos", revenue: 200, uniqueClients: 3, ltv: 66.67 }],
    },
    serviceOptions: [
      { id: "svc1", name: "Corte", active: true },
      { id: "svc2", name: "Barba", active: false },
    ],
    capacity: {
      summary: {
        slotsUsed: 24,
        slotsAvailable: 30,
        occupancyRate: 80,
        noShowRate: 5,
        cancelRate: 8,
        totalAppointments: 20,
      },
      thresholds: {
        occupancy: 85,
        noShow: 10,
        cancel: 15,
      },
      byBarber: [
        {
          id: "barb1",
          name: "Carlos",
          usedSlots: 12,
          availableSlots: 15,
          occupancyRate: 80,
          totalAppointments: 10,
          noShowRate: 5,
          cancelRate: 5,
          alerts: { occupancy: false, noShow: false, cancel: false },
        },
        {
          id: "barb2",
          name: "Ana",
          usedSlots: 8,
          availableSlots: 15,
          occupancyRate: 53,
          totalAppointments: 6,
          noShowRate: 10,
          cancelRate: 16,
          alerts: { occupancy: false, noShow: true, cancel: true },
        },
      ],
      byService: [
        {
          id: "svc1",
          name: "Corte",
          usedSlots: 14,
          availableSlots: 30,
          occupancyRate: 46,
          totalAppointments: 12,
          noShowRate: 4,
          cancelRate: 8,
          alerts: { occupancy: false, noShow: false, cancel: false },
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.URL as any).createObjectURL = jest.fn(() => "blob:mock");
    (global.URL as any).revokeObjectURL = jest.fn();
    toastMock.success?.mockClear?.();
    toastMock.error?.mockClear?.();
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

    const customersTab = screen.getByRole("button", { name: /Clientes/i });
    fireEvent.click(customersTab);
    expect(screen.getByText("LTV Global")).toBeInTheDocument();
    expect(screen.getAllByText(/R\$ 60\.00/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Jan 2026/)).toBeInTheDocument();
  });

  it("refetches when date range changes", async () => {
    render(<ReportsPageClient initialReports={initialReports as any} initialDateRange="30d" />);

    const dateSelect = screen.getAllByRole("combobox")[0];
    fireEvent.click(dateSelect);
    fireEvent.click(screen.getByText("Últimos 7 dias"));

    await waitFor(() => {
      expect(mockGetReportsData).toHaveBeenCalledWith("7d", undefined);
    });
  });

  it("refetches when toggling back to the initial range", async () => {
    render(<ReportsPageClient initialReports={initialReports as any} initialDateRange="30d" />);

    const dateSelect = screen.getAllByRole("combobox")[0];
    fireEvent.click(dateSelect);
    fireEvent.click(screen.getByText("Últimos 7 dias"));

    await waitFor(() => {
      expect(mockGetReportsData).toHaveBeenCalledWith("7d", undefined);
    });

    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByText("Últimos 30 dias"));

    await waitFor(() => {
      expect(mockGetReportsData).toHaveBeenCalledWith("30d", undefined);
    });

    expect(mockGetReportsData).toHaveBeenCalledTimes(2);
  });

  it("refetches when service filter changes", async () => {
    render(<ReportsPageClient initialReports={initialReports as any} initialDateRange="30d" />);

    const serviceSelect = screen.getAllByRole("combobox")[1];
    fireEvent.click(serviceSelect);
    fireEvent.click(screen.getByText("Corte"));

    await waitFor(() => {
      expect(mockGetReportsData).toHaveBeenCalledWith("30d", "svc1");
    });
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

  it("renders capacity and no-show metrics", async () => {
    render(<ReportsPageClient initialReports={initialReports as any} initialDateRange="30d" />);

    fireEvent.click(screen.getByText("Performance"));

    expect(await screen.findByText("Capacidade Geral")).toBeInTheDocument();
    expect(screen.getByText(/24 \/ 30 slots usados/i)).toBeInTheDocument();
    expect(screen.getAllByText(/No-show 5\.0%/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/12\/15 slots/i)).toBeInTheDocument();
    expect(screen.getByText("Capacidade por Serviço")).toBeInTheDocument();
  });

  it("exporta pagamentos em CSV com filtros ativos e feedback", async () => {
    render(<ReportsPageClient initialReports={initialReports as any} initialDateRange="30d" />);

    fireEvent.click(screen.getByText("Exportar CSV"));

    await waitFor(() => {
      expect(toastMock.success).toHaveBeenCalledWith(
        "CSV de pagamentos gerado",
        expect.objectContaining({ description: expect.stringContaining("Últimos 30 dias") }),
      );
    });
  });
});
