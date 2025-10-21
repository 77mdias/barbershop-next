import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  test("renders with default classes", () => {
    const { container } = render(<Skeleton />);
    const skeletonElement = container.firstChild as HTMLElement;

    expect(skeletonElement).toHaveClass("animate-pulse");
    expect(skeletonElement).toHaveClass("rounded-md");
    expect(skeletonElement).toHaveClass("bg-muted");
  });

  test("applies custom className", () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    const skeletonElement = container.firstChild as HTMLElement;

    expect(skeletonElement).toHaveClass("custom-skeleton");
    expect(skeletonElement).toHaveClass("animate-pulse");
  });

  test("passes through other props", () => {
    const { container } = render(<Skeleton data-testid="skeleton-test" />);
    const skeletonElement = container.firstChild as HTMLElement;

    expect(skeletonElement).toHaveAttribute("data-testid", "skeleton-test");
  });
});
