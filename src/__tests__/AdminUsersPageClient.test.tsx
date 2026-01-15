import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UsersPageClient } from "@/app/dashboard/admin/users/UsersPageClient";
import { getUsers } from "@/server/userActions";

jest.mock("@/server/userActions", () => ({
  getUsers: jest.fn(),
}));

const mockGetUsers = getUsers as jest.MockedFunction<typeof getUsers>;

describe("UsersPageClient", () => {
  const initialUsers = [
    {
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      role: "ADMIN",
      createdAt: new Date(),
      deletedAt: null,
      isActive: true,
    },
    {
      id: "user-2",
      name: "Bob",
      email: "bob@example.com",
      role: "BARBER",
      createdAt: new Date(),
      deletedAt: null,
      isActive: true,
    },
  ];

  const initialPagination = {
    page: 1,
    limit: 20,
    total: 2,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockGetUsers.mockResolvedValue({
      success: true,
      data: { users: initialUsers, pagination: initialPagination },
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders initial users and fetches on mount", async () => {
    render(<UsersPageClient initialUsers={initialUsers} initialPagination={initialPagination} />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(mockGetUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("applies search and role filters", async () => {
    render(<UsersPageClient initialUsers={initialUsers} initialPagination={initialPagination} />);

    const searchInput = screen.getByPlaceholderText(/buscar por nome ou email/i);
    fireEvent.change(searchInput, { target: { value: "admin" } });

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockGetUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "admin",
          page: 1,
          role: undefined,
          status: "ALL",
        }),
      );
    });

    const roleSelect = screen.getAllByRole("combobox")[0];
    fireEvent.click(roleSelect);
    fireEvent.click(screen.getByText("Barbeiros"));

    await waitFor(() => {
      expect(mockGetUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "BARBER",
          page: 1,
        }),
      );
    });
  });
});
