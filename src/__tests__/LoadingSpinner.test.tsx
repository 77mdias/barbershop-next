import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

describe("LoadingSpinner", () => {
  test("renders with default props", () => {
    const { container } = render(<LoadingSpinner />);

    // Check if spinner SVG is present
    const spinner = container.querySelector("svg");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });

  test("renders with custom text", () => {
    render(<LoadingSpinner text="Loading data..." />);

    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  test("renders without text when not provided", () => {
    const { container } = render(<LoadingSpinner />);

    // Should not have any text element
    const textElement = container.querySelector("p");
    expect(textElement).not.toBeInTheDocument();
  });

  test("applies custom className", () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  test("renders different sizes", () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = container.querySelector("svg");
    expect(spinner).toHaveClass("h-4", "w-4");

    rerender(<LoadingSpinner size="md" />);
    spinner = container.querySelector("svg");
    expect(spinner).toHaveClass("h-6", "w-6");

    rerender(<LoadingSpinner size="lg" />);
    spinner = container.querySelector("svg");
    expect(spinner).toHaveClass("h-8", "w-8");
  });
});
