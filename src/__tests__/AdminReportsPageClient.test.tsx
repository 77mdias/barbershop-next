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
    topBarbers: [{ id: "1", name: "Carlos", totalReviews: 5, averageRating: 4.8 }],
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

    expect(await screen.findByText(/1200\.00/)).toBeInTheDocument();

    expect(screen.getByText(/4\.5\/5/)).toBeInTheDocument();
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
