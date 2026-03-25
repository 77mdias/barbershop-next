import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HeaderNavigation from "@/components/HeaderNavigation";

jest.mock("@/hooks/useAuthSafe", () => ({
  useAuthSafe: () => ({
    isAuthenticated: false,
    user: null,
  }),
}));

jest.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

jest.mock("@/components/NotificationBell", () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

jest.mock("@/components/ChatBell", () => ({
  ChatBell: () => <div data-testid="chat-bell" />,
}));

jest.mock("@/components/MenuNavigation", () => ({
  __esModule: true,
  default: () => <div data-testid="menu-navigation" />,
}));

describe("HeaderNavigation layering", () => {
  test("opens mobile panel with backdrop and locks body scroll", () => {
    render(<HeaderNavigation />);

    const toggleButton = screen.getByRole("button", { name: /Toggle menu/i });
    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    const panel = document.getElementById("mobile-navigation-panel");
    expect(panel).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    const panelLink = panel?.querySelector("a[href='/']") as HTMLAnchorElement | null;
    expect(panelLink).toBeInTheDocument();

    if (panelLink) {
      fireEvent.click(panelLink);
    }

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });

  test("closes mobile panel on Escape", () => {
    render(<HeaderNavigation />);

    const toggleButton = screen.getByRole("button", { name: /Toggle menu/i });
    fireEvent.click(toggleButton);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mobile-navigation-panel")).not.toBeInTheDocument();
  });
});
