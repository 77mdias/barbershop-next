import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ServicesPageClient } from "@/app/dashboard/admin/services/ServicesPageClient";
import { getServicesForAdmin } from "@/server/serviceAdminActions";

jest.mock("@/server/serviceAdminActions", () => ({
  getServicesForAdmin: jest.fn(),
}));

const mockGetServicesForAdmin = getServicesForAdmin as jest.MockedFunction<typeof getServicesForAdmin>;

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe("ServicesPageClient", () => {
  const initialServices = [
    {
      id: "svc-1",
      name: "Corte Moderno",
      description: "Corte com estilo",
      duration: 30,
      price: 50,
      active: true,
      _count: { appointments: 5 },
    },
    {
      id: "svc-2",
      name: "Barba Premium",
      description: "Barba completa",
      duration: 25,
      price: 35,
      active: false,
      _count: { appointments: 2 },
    },
  ];

  const initialPagination = {
    page: 1,
    limit: 20,
    total: 2,
    totalPages: 1,
  };

  const initialStats = {
    activeCount: 1,
    inactiveCount: 1,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockGetServicesForAdmin.mockResolvedValue({
      success: true,
      data: initialServices,
      pagination: initialPagination,
      stats: initialStats,
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders services and fetches data on mount", async () => {
    render(
      <ServicesPageClient
        initialServices={initialServices}
        initialPagination={initialPagination}
        initialStats={initialStats}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Corte Moderno")).toBeInTheDocument();
      expect(mockGetServicesForAdmin).toHaveBeenCalledTimes(1);
    });
  });

  it("applies status and search filters", async () => {
    render(
      <ServicesPageClient
        initialServices={initialServices}
        initialPagination={initialPagination}
        initialStats={initialStats}
      />,
    );

    const statusSelect = screen.getByRole("combobox");
    fireEvent.click(statusSelect);
    const inactiveOption = await screen.findAllByRole("option", { name: "Inativos" });
    fireEvent.click(inactiveOption[0]);

    await waitFor(() => {
      expect(mockGetServicesForAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          active: false,
          page: 1,
        }),
      );
    });

    const searchInput = screen.getByPlaceholderText(/buscar por nome/i);
    fireEvent.change(searchInput, { target: { value: "corte" } });

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockGetServicesForAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "corte",
        }),
      );
    });
  });
});
