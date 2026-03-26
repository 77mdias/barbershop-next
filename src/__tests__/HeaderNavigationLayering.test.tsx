import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
    const { container } = render(<HeaderNavigation />);
    const header = container.querySelector("header");
    expect(header).toHaveAttribute("data-layout-contract", "ph6-rsp-001-header");
    expect(header).toHaveAttribute("data-layout-breakpoints", "390|768|1024|1440");

    const toggleButton = screen.getByRole("button", { name: /Abrir menu de navegação/i });
    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(toggleButton).toHaveAttribute("aria-haspopup", "dialog");

    const panel = document.getElementById("mobile-navigation-panel");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute("role", "dialog");
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

    const toggleButton = screen.getByRole("button", { name: /Abrir menu de navegação/i });
    fireEvent.click(toggleButton);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mobile-navigation-panel")).not.toBeInTheDocument();
  });

  test("closes mobile panel when backdrop is clicked", () => {
    const { container } = render(<HeaderNavigation />);

    const toggleButton = screen.getByRole("button", { name: /Abrir menu de navegação/i });
    fireEvent.click(toggleButton);

    const backdrop = container.querySelector("div.fixed[aria-hidden='true']");
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mobile-navigation-panel")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  test("renders all mobile navigation links with correct hrefs", () => {
    render(<HeaderNavigation />);

    const toggleButton = screen.getByRole("button", { name: /Abrir menu de navegação/i });
    fireEvent.click(toggleButton);

    const panel = document.getElementById("mobile-navigation-panel");
    expect(panel).toBeInTheDocument();

    const panelScope = within(panel!);
    const mobileOnlyLinks = [
      { label: "Preços", href: "/prices" },
      { label: "Suporte", href: "/support" },
    ];

    mobileOnlyLinks.forEach(({ label, href }) => {
      const link = panelScope.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
    });

    const sharedLinks = ["Início", "Galeria", "Comunidade", "Agendamento", "Avaliações"];
    sharedLinks.forEach((label) => {
      const links = screen.getAllByRole("link", { name: label });
      const mobileLink = links.find((l) => panel!.contains(l));
      expect(mobileLink).toBeDefined();
    });
  });

  test("mobile panel has proper dialog role and aria-modal", () => {
    render(<HeaderNavigation />);

    const toggleButton = screen.getByRole("button", { name: /Abrir menu de navegação/i });
    fireEvent.click(toggleButton);

    const panel = document.getElementById("mobile-navigation-panel");
    expect(panel).toHaveAttribute("role", "dialog");
    expect(panel).toHaveAttribute("aria-modal", "true");
    expect(panel).toHaveAttribute("aria-label", "Menu principal mobile");
  });

  test("shows unauthenticated user the sign-in link in mobile menu", () => {
    render(<HeaderNavigation />);

    const toggleButton = screen.getByRole("button", { name: /Abrir menu de navegação/i });
    fireEvent.click(toggleButton);

    const panel = document.getElementById("mobile-navigation-panel");
    const panelScope = within(panel!);
    const signinLink = panelScope.getByRole("link", { name: /Entrar/i });
    expect(signinLink).toHaveAttribute("href", "/auth/signin");
  });

  test("toggle button label changes based on menu state", () => {
    render(<HeaderNavigation />);

    const toggleButton = screen.getByRole("button", { name: /Abrir menu de navegação/i });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(toggleButton).toHaveAttribute("aria-controls", "mobile-navigation-panel");

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Fechar menu de navegação/i })).toBeInTheDocument();
  });
});
