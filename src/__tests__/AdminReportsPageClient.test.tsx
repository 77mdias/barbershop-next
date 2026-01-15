import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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
    paymentMethods: [{ method: "CARD", count: 10, percentage: 60 }],
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
});
