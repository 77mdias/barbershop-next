import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

describe("LoadingSpinner", () => {
  test("renders with default props", () => {
    render(<LoadingSpinner />);

    // Check if spinner icon is present
    const spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  test("renders with custom text", () => {
    render(<LoadingSpinner text="Loading data..." />);

    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  test("renders without text when not provided", () => {
    render(<LoadingSpinner />);

    // Should not have any text element
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  test("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);

    const container = screen.getByRole("img", { hidden: true }).parentElement;
    expect(container).toHaveClass("custom-class");
  });

  test("renders different sizes", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toHaveClass("h-4", "w-4");

    rerender(<LoadingSpinner size="md" />);
    spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toHaveClass("h-6", "w-6");

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toHaveClass("h-8", "w-8");
  });
});
