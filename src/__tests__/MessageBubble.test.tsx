import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/components/chat/MessageBubble";

// Mock date-fns
jest.mock("date-fns", () => ({
  format: jest.fn(() => "14:30"),
}));

jest.mock("date-fns/locale", () => ({
  ptBR: {},
}));

// Mock UserAvatar component
jest.mock("@/components/UserAvatar", () => ({
  UserAvatar: ({ name }: { name: string }) => (
    <div data-testid="user-avatar">{name}</div>
  ),
}));

describe("MessageBubble", () => {
  const defaultProps = {
    content: "Hello, this is a test message!",
    createdAt: new Date("2025-01-15T14:30:00"),
    isOwn: false,
    senderName: "João Silva",
    senderImage: "/avatar.jpg",
  };

  test("renders message content", () => {
    render(<MessageBubble {...defaultProps} />);

    expect(screen.getByText("Hello, this is a test message!")).toBeInTheDocument();
  });

  test("displays formatted timestamp", () => {
    render(<MessageBubble {...defaultProps} />);

    expect(screen.getByText("14:30")).toBeInTheDocument();
  });

  test("renders own message with correct styling", () => {
    const { container } = render(
      <MessageBubble {...defaultProps} isOwn={true} />
    );

    // Own messages should have blue background
    const bubble = container.querySelector(".bg-blue-600");
    expect(bubble).toBeInTheDocument();
  });

  test("renders received message with correct styling", () => {
    const { container } = render(
      <MessageBubble {...defaultProps} isOwn={false} />
    );

    // Received messages should have white background
    const bubble = container.querySelector(".bg-white");
    expect(bubble).toBeInTheDocument();
  });

  test("shows avatar for received messages", () => {
    render(<MessageBubble {...defaultProps} isOwn={false} />);

    const avatar = screen.getByTestId("user-avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent("João Silva");
  });

  test("does not show avatar for own messages", () => {
    render(<MessageBubble {...defaultProps} isOwn={true} />);

    const avatar = screen.queryByTestId("user-avatar");
    expect(avatar).not.toBeInTheDocument();
  });

  test("hides avatar when showAvatar is false", () => {
    render(
      <MessageBubble {...defaultProps} isOwn={false} showAvatar={false} />
    );

    const avatar = screen.queryByTestId("user-avatar");
    expect(avatar).not.toBeInTheDocument();
  });

  test("displays sender name for received messages", () => {
    render(<MessageBubble {...defaultProps} isOwn={false} />);

    // Sender name appears twice (avatar + name label)
    expect(screen.getAllByText("João Silva").length).toBeGreaterThan(0);
  });

  test("does not display sender name for own messages", () => {
    render(
      <MessageBubble
        {...defaultProps}
        isOwn={true}
        senderName="João Silva"
      />
    );

    // Sender name should not appear for own messages
    // (except in avatar which we already excluded)
    const senderNameElements = screen.queryAllByText("João Silva");
    expect(senderNameElements.length).toBe(0);
  });

  test("shows single checkmark for unread own messages", () => {
    const { container } = render(
      <MessageBubble {...defaultProps} isOwn={true} isRead={false} />
    );

    // Check for single checkmark icon
    const checkIcon = container.querySelector(".lucide-check");
    expect(checkIcon).toBeInTheDocument();
  });

  test("shows double checkmark for read own messages", () => {
    const { container } = render(
      <MessageBubble {...defaultProps} isOwn={true} isRead={true} />
    );

    // Check for double checkmark icon
    const checkCheckIcon = container.querySelector(".lucide-check-check");
    expect(checkCheckIcon).toBeInTheDocument();
  });

  test("does not show checkmarks for received messages", () => {
    const { container } = render(
      <MessageBubble {...defaultProps} isOwn={false} isRead={false} />
    );

    // No checkmarks should be present for received messages
    const checkIcon = container.querySelector(".lucide-check");
    const checkCheckIcon = container.querySelector(".lucide-check-check");
    expect(checkIcon).not.toBeInTheDocument();
    expect(checkCheckIcon).not.toBeInTheDocument();
  });

  test("handles string date format", () => {
    render(
      <MessageBubble
        {...defaultProps}
        createdAt="2025-01-15T14:30:00.000Z"
      />
    );

    // Should still display formatted time
    expect(screen.getByText("14:30")).toBeInTheDocument();
  });

  test("handles multiline content with whitespace", () => {
    const multilineContent = "First line\nSecond line\nThird line";
    const { container } = render(
      <MessageBubble {...defaultProps} content={multilineContent} />
    );

    // Should preserve whitespace with pre-wrap class
    const messageText = container.querySelector(".whitespace-pre-wrap");
    expect(messageText).toBeInTheDocument();
    // Check that all lines are present (whitespace may not be preserved exactly in DOM)
    expect(messageText).toHaveTextContent("First line");
    expect(messageText).toHaveTextContent("Second line");
    expect(messageText).toHaveTextContent("Third line");
  });

  test("renders with minimal props", () => {
    render(
      <MessageBubble
        content="Minimal message"
        createdAt={new Date()}
        isOwn={false}
      />
    );

    expect(screen.getByText("Minimal message")).toBeInTheDocument();
  });

  test("applies correct max-width classes", () => {
    const { container } = render(<MessageBubble {...defaultProps} />);

    const messageContainer = container.querySelector(".max-w-\\[85\\%\\]");
    expect(messageContainer).toBeInTheDocument();
  });
});
