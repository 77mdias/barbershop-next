import { render, screen } from "@testing-library/react";
import SignInPage from "@/app/auth/signin/page";

jest.mock("@/app/auth/signin/components/SignInForm", () => ({
  __esModule: true,
  default: () => <div data-testid="signin-form" />,
}));

describe("SignInPage", () => {
  test("applies semantic typography and spacing tokens in auth layout", () => {
    render(<SignInPage />);

    const heading = screen.getByRole("heading", { name: "Bem-vindo de volta" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("type-3d-title");

    const paragraph = screen.getByText(/Acesse sua conta para gerenciar agendamentos e avaliações/i);
    expect(paragraph).toHaveClass("type-3d-body");

    const rightColumn = heading.closest("div");
    expect(rightColumn).toHaveClass("rhythm-3d-stack-md");

    expect(screen.getByTestId("signin-form")).toBeInTheDocument();
  });
});
