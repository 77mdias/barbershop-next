import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FilterSelect } from "@/components/admin/FilterSelect";
import type { FilterSelectOption } from "@/components/admin/FilterSelect";

const mockOptions: FilterSelectOption[] = [
  { value: "all", label: "Todos os usuários" },
  { value: "CLIENT", label: "Clientes" },
  { value: "BARBER", label: "Barbeiros" },
  { value: "ADMIN", label: "Administradores" },
];

describe("FilterSelect", () => {
  it("renders with default props", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect value="all" onChange={onChange} options={mockOptions} />
    );

    // Verifica se o trigger está presente
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders with label", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={mockOptions}
        label="Filtrar por role"
      />
    );

    expect(screen.getByText("Filtrar por role")).toBeInTheDocument();
  });

  it("calls onChange when value changes", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect value="all" onChange={onChange} options={mockOptions} />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Seleciona a opção "Clientes"
    const clientOption = screen.getByText("Clientes");
    fireEvent.click(clientOption);

    expect(onChange).toHaveBeenCalledWith("CLIENT");
  });

  it("shows reset button when showReset is true and value is not default", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect
        value="CLIENT"
        onChange={onChange}
        options={mockOptions}
        label="Filtrar por role"
        showReset
      />
    );

    // Deve ter botão de reset
    expect(screen.getByText("Limpar")).toBeInTheDocument();
  });

  it("hides reset button when value is 'all'", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={mockOptions}
        label="Filtrar por role"
        showReset
      />
    );

    // Não deve ter botão de reset
    expect(screen.queryByText("Limpar")).not.toBeInTheDocument();
  });

  it("resets to default value when reset button is clicked", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect
        value="CLIENT"
        onChange={onChange}
        options={mockOptions}
        label="Filtrar por role"
        showReset
      />
    );

    const resetButton = screen.getByText("Limpar");
    fireEvent.click(resetButton);

    // Deve ter sido chamado com 'all' (primeiro valor padrão)
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("uses custom reset label", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect
        value="CLIENT"
        onChange={onChange}
        options={mockOptions}
        label="Filtrar por role"
        showReset
        resetLabel="Resetar"
      />
    );

    expect(screen.getByText("Resetar")).toBeInTheDocument();
    expect(screen.queryByText("Limpar")).not.toBeInTheDocument();
  });

  it("disables select when disabled prop is true", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={mockOptions}
        disabled
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-disabled", "true");
  });

  it("renders disabled options", () => {
    const onChange = jest.fn();
    const optionsWithDisabled: FilterSelectOption[] = [
      ...mockOptions,
      { value: "SUPER_ADMIN", label: "Super Admin (indisponível)", disabled: true },
    ];

    render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={optionsWithDisabled}
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const disabledOption = screen.getByText("Super Admin (indisponível)");
    expect(disabledOption).toBeInTheDocument();
  });

  it("renders custom placeholder", () => {
    const onChange = jest.fn();
    render(
      <FilterSelect
        value=""
        onChange={onChange}
        options={mockOptions}
        placeholder="Selecione um filtro..."
      />
    );

    expect(screen.getByText("Selecione um filtro...")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const onChange = jest.fn();
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;

    render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={mockOptions}
        icon={<TestIcon />}
      />
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("resets to first option if no 'all' option exists", () => {
    const onChange = jest.fn();
    const optionsWithoutAll: FilterSelectOption[] = [
      { value: "CLIENT", label: "Clientes" },
      { value: "BARBER", label: "Barbeiros" },
    ];

    render(
      <FilterSelect
        value="CLIENT"
        onChange={onChange}
        options={optionsWithoutAll}
        showReset
      />
    );

    const resetButton = screen.getByText("Limpar");
    fireEvent.click(resetButton);

    // Deve resetar para o primeiro valor
    expect(onChange).toHaveBeenCalledWith("CLIENT");
  });
});
