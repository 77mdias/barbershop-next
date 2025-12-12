import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DebouncedSearchInput } from "@/components/admin/DebouncedSearchInput";

// Mock setTimeout/clearTimeout for faster tests
jest.useFakeTimers();

describe("DebouncedSearchInput", () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it("renders with default props", () => {
    const onChange = jest.fn();
    render(<DebouncedSearchInput value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Buscar...");
    expect(input).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    const onChange = jest.fn();
    render(
      <DebouncedSearchInput
        value=""
        onChange={onChange}
        placeholder="Buscar usuários..."
      />
    );

    expect(screen.getByPlaceholderText("Buscar usuários...")).toBeInTheDocument();
  });

  it("calls onChange immediately when user types", () => {
    const onChange = jest.fn();
    render(<DebouncedSearchInput value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test" } });

    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("calls onDebouncedChange after delay", async () => {
    const onChange = jest.fn();
    const onDebouncedChange = jest.fn();

    render(
      <DebouncedSearchInput
        value=""
        onChange={onChange}
        onDebouncedChange={onDebouncedChange}
        delay={500}
      />
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test" } });

    // Não deve ter sido chamado ainda
    expect(onDebouncedChange).not.toHaveBeenCalled();

    // Avança o timer
    jest.advanceTimersByTime(500);

    // Agora deve ter sido chamado
    await waitFor(() => {
      expect(onDebouncedChange).toHaveBeenCalledWith("test");
    });
  });

  it("cancels previous debounce when value changes quickly", async () => {
    const onChange = jest.fn();
    const onDebouncedChange = jest.fn();

    const { rerender } = render(
      <DebouncedSearchInput
        value=""
        onChange={onChange}
        onDebouncedChange={onDebouncedChange}
        delay={500}
      />
    );

    const input = screen.getByRole("textbox");

    // Primeira digitação
    fireEvent.change(input, { target: { value: "t" } });
    jest.advanceTimersByTime(200);

    // Segunda digitação antes do delay
    fireEvent.change(input, { target: { value: "te" } });
    jest.advanceTimersByTime(200);

    // Terceira digitação
    fireEvent.change(input, { target: { value: "tes" } });

    // Completa o delay
    jest.advanceTimersByTime(500);

    // Deve ter sido chamado apenas uma vez com o último valor
    await waitFor(() => {
      expect(onDebouncedChange).toHaveBeenCalledTimes(1);
      expect(onDebouncedChange).toHaveBeenCalledWith("tes");
    });
  });

  it("shows clear button when value is not empty", () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <DebouncedSearchInput value="" onChange={onChange} />
    );

    // Não deve ter botão de limpar
    expect(screen.queryByLabelText("Limpar busca")).not.toBeInTheDocument();

    // Atualiza com valor
    rerender(<DebouncedSearchInput value="test" onChange={onChange} />);

    // Deve ter botão de limpar
    expect(screen.getByLabelText("Limpar busca")).toBeInTheDocument();
  });

  it("clears input when clear button is clicked", () => {
    const onChange = jest.fn();
    const onDebouncedChange = jest.fn();

    render(
      <DebouncedSearchInput
        value="test"
        onChange={onChange}
        onDebouncedChange={onDebouncedChange}
      />
    );

    const clearButton = screen.getByLabelText("Limpar busca");
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith("");
    expect(onDebouncedChange).toHaveBeenCalledWith("");
  });

  it("hides clear button when showClearButton is false", () => {
    const onChange = jest.fn();
    render(
      <DebouncedSearchInput
        value="test"
        onChange={onChange}
        showClearButton={false}
      />
    );

    expect(screen.queryByLabelText("Limpar busca")).not.toBeInTheDocument();
  });

  it("shows loading spinner when isSearching is true", () => {
    const onChange = jest.fn();
    render(
      <DebouncedSearchInput
        value="test"
        onChange={onChange}
        isSearching={true}
      />
    );

    // Procura pelo spinner (Loader2 com classe animate-spin)
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("does not call onDebouncedChange for strings shorter than 2 characters", () => {
    const onChange = jest.fn();
    const onDebouncedChange = jest.fn();

    render(
      <DebouncedSearchInput
        value=""
        onChange={onChange}
        onDebouncedChange={onDebouncedChange}
        delay={500}
      />
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "a" } });

    jest.advanceTimersByTime(500);

    expect(onDebouncedChange).not.toHaveBeenCalled();
  });

  it("cleans up timeout on unmount", () => {
    const onChange = jest.fn();
    const onDebouncedChange = jest.fn();

    const { unmount } = render(
      <DebouncedSearchInput
        value=""
        onChange={onChange}
        onDebouncedChange={onDebouncedChange}
        delay={500}
      />
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test" } });

    // Desmonta antes do delay
    unmount();

    // Avança o timer
    jest.advanceTimersByTime(500);

    // Não deve ter sido chamado
    expect(onDebouncedChange).not.toHaveBeenCalled();
  });
});
