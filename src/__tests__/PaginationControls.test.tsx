import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PaginationControls } from "@/components/admin/PaginationControls";

describe("PaginationControls", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: jest.fn(),
    totalItems: 200,
    itemsPerPage: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<PaginationControls {...defaultProps} />);

    expect(screen.getByText("Mostrando")).toBeInTheDocument();
    expect(screen.getByText("1-20")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("calculates correct item range", () => {
    render(<PaginationControls {...defaultProps} currentPage={2} />);

    expect(screen.getByText("21-40")).toBeInTheDocument();
  });

  it("handles last page item range correctly", () => {
    render(<PaginationControls {...defaultProps} currentPage={10} />);

    // Última página: 181-200
    expect(screen.getByText("181-200")).toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    render(<PaginationControls {...defaultProps} currentPage={1} />);

    const previousButton = screen.getByLabelText("Página anterior");
    expect(previousButton).toBeDisabled();
  });

  it("enables previous button when not on first page", () => {
    render(<PaginationControls {...defaultProps} currentPage={2} />);

    const previousButton = screen.getByLabelText("Página anterior");
    expect(previousButton).not.toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(<PaginationControls {...defaultProps} currentPage={10} />);

    const nextButton = screen.getByLabelText("Próxima página");
    expect(nextButton).toBeDisabled();
  });

  it("enables next button when not on last page", () => {
    render(<PaginationControls {...defaultProps} currentPage={1} />);

    const nextButton = screen.getByLabelText("Próxima página");
    expect(nextButton).not.toBeDisabled();
  });

  it("calls onPageChange with previous page when previous button clicked", () => {
    const onPageChange = jest.fn();
    render(
      <PaginationControls
        {...defaultProps}
        currentPage={5}
        onPageChange={onPageChange}
      />
    );

    const previousButton = screen.getByLabelText("Página anterior");
    fireEvent.click(previousButton);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("calls onPageChange with next page when next button clicked", () => {
    const onPageChange = jest.fn();
    render(
      <PaginationControls
        {...defaultProps}
        currentPage={5}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByLabelText("Próxima página");
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it("shows all page numbers when totalPages <= 7", () => {
    render(<PaginationControls {...defaultProps} totalPages={5} currentPage={3} />);

    // Deve mostrar todas as 5 páginas
    expect(screen.getByLabelText("Página 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 5")).toBeInTheDocument();
  });

  it("shows ellipsis for large page counts", () => {
    render(<PaginationControls {...defaultProps} currentPage={5} />);

    // Deve ter pelo menos um "..." no texto
    const ellipsis = screen.getAllByText("...");
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it("shows correct page numbers at the beginning", () => {
    render(<PaginationControls {...defaultProps} totalPages={10} currentPage={2} />);

    // Deve mostrar: 1 2 3 4 ... 10
    expect(screen.getByLabelText("Página 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 10")).toBeInTheDocument();
  });

  it("shows correct page numbers in the middle", () => {
    render(<PaginationControls {...defaultProps} totalPages={10} currentPage={5} />);

    // Deve mostrar: 1 ... 4 5 6 ... 10
    expect(screen.getByLabelText("Página 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 6")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 10")).toBeInTheDocument();
  });

  it("shows correct page numbers at the end", () => {
    render(<PaginationControls {...defaultProps} totalPages={10} currentPage={9} />);

    // Deve mostrar: 1 ... 7 8 9 10
    expect(screen.getByLabelText("Página 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 7")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 8")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 9")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 10")).toBeInTheDocument();
  });

  it("highlights current page", () => {
    render(<PaginationControls {...defaultProps} currentPage={5} />);

    const currentPageButton = screen.getByLabelText("Página 5");
    expect(currentPageButton).toHaveAttribute("aria-current", "page");
    expect(currentPageButton).toHaveClass("bg-blue-600");
  });

  it("calls onPageChange when page number is clicked", () => {
    const onPageChange = jest.fn();
    render(
      <PaginationControls
        {...defaultProps}
        currentPage={5}
        onPageChange={onPageChange}
      />
    );

    const page1Button = screen.getByLabelText("Página 1");
    fireEvent.click(page1Button);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("hides items count when showItemsCount is false", () => {
    render(<PaginationControls {...defaultProps} showItemsCount={false} />);

    expect(screen.queryByText("Mostrando")).not.toBeInTheDocument();
  });

  it("hides page numbers when showPageNumbers is false", () => {
    render(<PaginationControls {...defaultProps} showPageNumbers={false} />);

    expect(screen.queryByLabelText("Página 1")).not.toBeInTheDocument();
  });

  it("shows first/last buttons when showFirstLast is true", () => {
    render(<PaginationControls {...defaultProps} showFirstLast currentPage={5} />);

    expect(screen.getByLabelText("Primeira página")).toBeInTheDocument();
    expect(screen.getByLabelText("Última página")).toBeInTheDocument();
  });

  it("calls onPageChange with 1 when first page button clicked", () => {
    const onPageChange = jest.fn();
    render(
      <PaginationControls
        {...defaultProps}
        currentPage={5}
        onPageChange={onPageChange}
        showFirstLast
      />
    );

    const firstButton = screen.getByLabelText("Primeira página");
    fireEvent.click(firstButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange with totalPages when last page button clicked", () => {
    const onPageChange = jest.fn();
    render(
      <PaginationControls
        {...defaultProps}
        currentPage={5}
        onPageChange={onPageChange}
        showFirstLast
      />
    );

    const lastButton = screen.getByLabelText("Última página");
    fireEvent.click(lastButton);

    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it("uses singular 'item' when totalItems is 1", () => {
    render(<PaginationControls {...defaultProps} totalItems={1} itemsPerPage={1} />);

    expect(screen.getByText("item")).toBeInTheDocument();
    expect(screen.queryByText("itens")).not.toBeInTheDocument();
  });

  it("uses plural 'itens' when totalItems > 1", () => {
    render(<PaginationControls {...defaultProps} totalItems={200} />);

    expect(screen.getByText("itens")).toBeInTheDocument();
    expect(screen.queryByText(/^item$/)).not.toBeInTheDocument();
  });
});
