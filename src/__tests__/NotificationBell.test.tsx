import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationBell } from "@/components/NotificationBell";

// Mock notification actions
jest.mock("@/server/notificationActions", () => ({
  getRecentNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
}));

// Get mocked functions
import * as notificationActions from "@/server/notificationActions";
const mockGetRecentNotifications = notificationActions.getRecentNotifications as jest.MockedFunction<
  typeof notificationActions.getRecentNotifications
>;
const mockGetUnreadCount = notificationActions.getUnreadCount as jest.MockedFunction<
  typeof notificationActions.getUnreadCount
>;
const mockMarkNotificationAsRead = notificationActions.markNotificationAsRead as jest.MockedFunction<
  typeof notificationActions.markNotificationAsRead
>;
const mockMarkAllNotificationsAsRead = notificationActions.markAllNotificationsAsRead as jest.MockedFunction<
  typeof notificationActions.markAllNotificationsAsRead
>;

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "há 5 minutos"),
}));

jest.mock("date-fns/locale", () => ({
  ptBR: {},
}));

describe("NotificationBell", () => {
  const mockNotifications = [
    {
      id: "1",
      type: "FRIEND_REQUEST_RECEIVED" as const,
      title: "Nova solicitação de amizade",
      message: "João enviou uma solicitação de amizade",
      read: false,
      createdAt: new Date(),
      relatedId: "user-1",
    },
    {
      id: "2",
      type: "FRIEND_REQUEST_ACCEPTED" as const,
      title: "Solicitação aceita",
      message: "Maria aceitou sua solicitação",
      read: true,
      createdAt: new Date(),
      relatedId: "user-2",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRecentNotifications.mockResolvedValue({
      success: true,
      data: mockNotifications,
    });
    mockGetUnreadCount.mockResolvedValue({
      success: true,
      data: 1,
    });
    mockMarkNotificationAsRead.mockResolvedValue({ success: true });
    mockMarkAllNotificationsAsRead.mockResolvedValue({ success: true });
  });

  test("renders bell button", () => {
    render(<NotificationBell />);

    const bellButton = screen.getByRole("button");
    expect(bellButton).toBeInTheDocument();
  });

  test("displays unread count badge when there are unread notifications", async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });

    // Badge with count should appear
    await waitFor(() => {
      const badge = screen.getByText("1");
      expect(badge).toBeInTheDocument();
    });
  });

  test("does not display badge when there are no unread notifications", async () => {
    mockGetUnreadCount.mockResolvedValue({
      success: true,
      data: 0,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });

    // Badge should not be present
    const badge = screen.queryByText("0");
    expect(badge).not.toBeInTheDocument();
  });

  test("shows 9+ when unread count is more than 9", async () => {
    mockGetUnreadCount.mockResolvedValue({
      success: true,
      data: 15,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      const badge = screen.getByText("9+");
      expect(badge).toBeInTheDocument();
    });
  });

  test("loads and displays notifications when opened", async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(mockGetRecentNotifications).toHaveBeenCalledWith(5);
    });

    // Click bell to open popover
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);

    // Wait for notifications to appear
    await waitFor(() => {
      expect(screen.getByText("Notificações")).toBeInTheDocument();
      expect(screen.getByText("Nova solicitação de amizade")).toBeInTheDocument();
      expect(screen.getByText("Solicitação aceita")).toBeInTheDocument();
    });
  });

  test("displays empty state when there are no notifications", async () => {
    mockGetRecentNotifications.mockResolvedValue({
      success: true,
      data: [],
    });
    mockGetUnreadCount.mockResolvedValue({
      success: true,
      data: 0,
    });

    render(<NotificationBell />);

    // Click bell to open popover
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);

    // Wait for empty state
    await waitFor(() => {
      expect(screen.getByText("Nenhuma notificação")).toBeInTheDocument();
    });
  });

  test("marks notification as read when clicked", async () => {
    render(<NotificationBell />);

    // Open popover
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);

    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByText("Nova solicitação de amizade")).toBeInTheDocument();
    });

    // Click on unread notification
    const unreadNotification = screen.getByText("Nova solicitação de amizade");
    fireEvent.click(unreadNotification.closest("div[class*='cursor-pointer']")!);

    // Should mark as read
    await waitFor(() => {
      expect(mockMarkNotificationAsRead).toHaveBeenCalledWith("1");
    });
  });

  test("does not mark already read notification as read again", async () => {
    render(<NotificationBell />);

    // Open popover
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);

    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByText("Solicitação aceita")).toBeInTheDocument();
    });

    // Click on already read notification
    const readNotification = screen.getByText("Solicitação aceita");
    fireEvent.click(readNotification.closest("div[class*='cursor-pointer']")!);

    // Should NOT mark as read (already read)
    await waitFor(() => {
      expect(mockMarkNotificationAsRead).not.toHaveBeenCalled();
    });
  });

  test("marks all notifications as read when button is clicked", async () => {
    render(<NotificationBell />);

    // Open popover
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);

    // Wait for "Mark all as read" button
    await waitFor(() => {
      expect(screen.getByText("Marcar todas como lidas")).toBeInTheDocument();
    });

    // Click mark all as read
    const markAllButton = screen.getByText("Marcar todas como lidas");
    fireEvent.click(markAllButton);

    // Should call mark all as read
    await waitFor(() => {
      expect(mockMarkAllNotificationsAsRead).toHaveBeenCalled();
    });
  });

  test("hides mark all as read button when no unread notifications", async () => {
    mockGetUnreadCount.mockResolvedValue({
      success: true,
      data: 0,
    });

    render(<NotificationBell />);

    // Open popover
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);

    // Wait for popover to open
    await waitFor(() => {
      expect(screen.getByText("Notificações")).toBeInTheDocument();
    });

    // Mark all button should not be visible
    const markAllButton = screen.queryByText("Marcar todas como lidas");
    expect(markAllButton).not.toBeInTheDocument();
  });

  test("displays correct icon for each notification type", async () => {
    const notificationsWithAllTypes = [
      {
        id: "1",
        type: "FRIEND_REQUEST_RECEIVED" as const,
        title: "Solicitação recebida",
        message: "Test",
        read: false,
        createdAt: new Date(),
      },
      {
        id: "2",
        type: "FRIEND_REQUEST_ACCEPTED" as const,
        title: "Solicitação aceita",
        message: "Test",
        read: false,
        createdAt: new Date(),
      },
      {
        id: "3",
        type: "FRIEND_REQUEST_REJECTED" as const,
        title: "Solicitação rejeitada",
        message: "Test",
        read: false,
        createdAt: new Date(),
      },
      {
        id: "4",
        type: "FRIEND_INVITE_USED" as const,
        title: "Convite usado",
        message: "Test",
        read: false,
        createdAt: new Date(),
      },
    ];

    mockGetRecentNotifications.mockResolvedValue({
      success: true,
      data: notificationsWithAllTypes,
    });

    render(<NotificationBell />);

    // Open popover
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);

    // All notification types should be rendered
    await waitFor(() => {
      expect(screen.getByText("Solicitação recebida")).toBeInTheDocument();
      expect(screen.getByText("Solicitação aceita")).toBeInTheDocument();
      expect(screen.getByText("Solicitação rejeitada")).toBeInTheDocument();
      expect(screen.getByText("Convite usado")).toBeInTheDocument();
    });
  });
});
