import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BarbersPageClient } from "@/app/dashboard/admin/barbers/BarbersPageClient";
import { getBarbersForAdmin } from "@/server/adminActions";

jest.mock("@/server/adminActions", () => ({
  getBarbersForAdmin: jest.fn(),
}));

const mockGetBarbersForAdmin = getBarbersForAdmin as jest.MockedFunction<typeof getBarbersForAdmin>;

describe("BarbersPageClient", () => {
  const initialBarbers = [
    {
      id: "barber-1",
      name: "Carlos",
      email: "carlos@example.com",
      createdAt: new Date(),
      totalReviews: 10,
      averageRating: 4.6,
      totalAppointments: 25,
    },
    {
      id: "barber-2",
      name: "Diego",
      email: "diego@example.com",
      createdAt: new Date(),
      totalReviews: 5,
      averageRating: 4.1,
      totalAppointments: 8,
    },
  ];

  const initialPagination = {
    page: 1,
    limit: 20,
    total: 2,
    totalPages: 1,
  };

  const initialMetrics = {
    averageRating: 4.35,
    activeCount: 2,
    totalReviews: 15,
    topPerformer: "Carlos",
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockGetBarbersForAdmin.mockResolvedValue({
      success: true,
      data: initialBarbers,
      pagination: initialPagination,
      metrics: initialMetrics,
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders barbers and fetches data on mount", async () => {
    render(
      <BarbersPageClient
        initialBarbers={initialBarbers}
        initialPagination={initialPagination}
        initialMetrics={initialMetrics}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Carlos")).toBeInTheDocument();
      expect(mockGetBarbersForAdmin).toHaveBeenCalledTimes(1);
    });
  });

  it("filters by performance and search", async () => {
    render(
      <BarbersPageClient
        initialBarbers={initialBarbers}
        initialPagination={initialPagination}
        initialMetrics={initialMetrics}
      />,
    );

    const performanceSelect = screen.getAllByRole("combobox")[0];
    fireEvent.click(performanceSelect);
    const performanceOption = await screen.findByText("4.0 ★+");
    fireEvent.click(performanceOption);

    await waitFor(() => {
      expect(mockGetBarbersForAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          performanceMin: 4,
        }),
      );
    });

    const searchInput = screen.getByPlaceholderText(/buscar por nome ou email/i);
    fireEvent.change(searchInput, { target: { value: "diego" } });

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockGetBarbersForAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "diego",
        }),
      );
    });
  });
});
