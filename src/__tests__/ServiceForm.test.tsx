import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ServiceForm from "@/components/ServiceForm";

// Mock server actions
jest.mock("@/server/serviceAdminActions", () => ({
  createService: jest.fn(),
  updateService: jest.fn(),
}));

// Get mocked functions
import * as serviceAdminActions from "@/server/serviceAdminActions";
const mockCreateService = serviceAdminActions.createService as jest.MockedFunction<
  typeof serviceAdminActions.createService
>;
const mockUpdateService = serviceAdminActions.updateService as jest.MockedFunction<
  typeof serviceAdminActions.updateService
>;

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Get mocked toast
import { toast } from "sonner";
const mockToast = toast as jest.Mocked<typeof toast>;

describe("ServiceForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateService.mockResolvedValue({
      success: true,
      message: "Serviço criado com sucesso",
      data: {
        id: "service-123",
        name: "Teste",
        description: null,
        duration: 30,
        price: 40,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    });
  });

  test("renders service form with all fields", () => {
    render(<ServiceForm />);

    expect(screen.getByLabelText(/nome do serviço/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duração/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/serviço ativo/i)).toBeInTheDocument();
  });

  test("allows user to fill in all fields", async () => {
    render(<ServiceForm />);

    const nameInput = screen.getByLabelText(/nome do serviço/i);
    const descriptionInput = screen.getByLabelText(/descrição/i);
    const durationInput = screen.getByLabelText(/duração/i);
    const priceInput = screen.getByLabelText(/preço/i);

    fireEvent.change(nameInput, { target: { value: "Corte de Cabelo" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Corte moderno e estiloso" },
    });
    fireEvent.change(durationInput, { target: { value: "30" } });
    fireEvent.change(priceInput, { target: { value: "50.00" } });

    expect(nameInput).toHaveValue("Corte de Cabelo");
    expect(descriptionInput).toHaveValue("Corte moderno e estiloso");
    expect(durationInput).toHaveValue(30);
    expect(priceInput).toHaveValue(50);
  });

  test("submits form with correct data when creating new service", async () => {
    render(<ServiceForm />);

    const nameInput = screen.getByLabelText(/nome do serviço/i);
    const durationInput = screen.getByLabelText(/duração/i);
    const priceInput = screen.getByLabelText(/preço/i);

    fireEvent.change(nameInput, { target: { value: "Barba" } });
    fireEvent.change(durationInput, { target: { value: "20" } });
    fireEvent.change(priceInput, { target: { value: "30.00" } });

    const submitButton = screen.getByRole("button", { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateService).toHaveBeenCalledWith({
        name: "Barba",
        description: "",
        duration: 20,
        price: 30,
        active: true,
      });
    });
  });

  test("submits form with correct data when updating existing service", async () => {
    const initialData = {
      id: "service-123",
      name: "Corte de Cabelo",
      description: "Corte tradicional",
      duration: 30,
      price: 50,
      active: true,
    };

    mockUpdateService.mockResolvedValue({
      success: true,
      message: "Serviço atualizado com sucesso",
      data: {
        id: "service-123",
        name: "Corte Premium",
        description: "Corte tradicional",
        duration: 30,
        price: 50,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    });

    render(<ServiceForm initialData={initialData} />);

    const nameInput = screen.getByLabelText(/nome do serviço/i);
    fireEvent.change(nameInput, { target: { value: "Corte Premium" } });

    const submitButton = screen.getByRole("button", { name: /atualizar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateService).toHaveBeenCalledWith("service-123", {
        name: "Corte Premium",
        description: "Corte tradicional",
        duration: 30,
        price: 50,
        active: true,
      });
    });
  });

  test("shows success toast on successful submission", async () => {
    render(<ServiceForm />);

    const nameInput = screen.getByLabelText(/nome do serviço/i);
    const durationInput = screen.getByLabelText(/duração/i);
    const priceInput = screen.getByLabelText(/preço/i);

    fireEvent.change(nameInput, { target: { value: "Teste" } });
    fireEvent.change(durationInput, { target: { value: "30" } });
    fireEvent.change(priceInput, { target: { value: "40" } });

    const submitButton = screen.getByRole("button", { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Serviço criado com sucesso"
      );
    });
  });

  test("shows error toast on submission failure", async () => {
    mockCreateService.mockResolvedValue({
      success: false,
      error: "Nome do serviço já existe",
    });

    render(<ServiceForm />);

    const nameInput = screen.getByLabelText(/nome do serviço/i);
    const durationInput = screen.getByLabelText(/duração/i);
    const priceInput = screen.getByLabelText(/preço/i);

    fireEvent.change(nameInput, { target: { value: "Teste" } });
    fireEvent.change(durationInput, { target: { value: "30" } });
    fireEvent.change(priceInput, { target: { value: "40" } });

    const submitButton = screen.getByRole("button", { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Nome do serviço já existe");
    });
  });

  test("calls onSuccess callback after successful submission", async () => {
    const onSuccess = jest.fn();
    render(<ServiceForm onSuccess={onSuccess} />);

    const nameInput = screen.getByLabelText(/nome do serviço/i);
    const durationInput = screen.getByLabelText(/duração/i);
    const priceInput = screen.getByLabelText(/preço/i);

    fireEvent.change(nameInput, { target: { value: "Teste" } });
    fireEvent.change(durationInput, { target: { value: "30" } });
    fireEvent.change(priceInput, { target: { value: "40" } });

    const submitButton = screen.getByRole("button", { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  test("calls onCancel callback when cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(<ServiceForm onCancel={onCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  test("disables form inputs while submitting", async () => {
    mockCreateService.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: "Serviço criado com sucesso",
                data: {
                  id: "service-123",
                  name: "Teste",
                  description: null,
                  duration: 30,
                  price: 40,
                  active: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as any,
              }),
            100
          )
        )
    );

    render(<ServiceForm />);

    const nameInput = screen.getByLabelText(/nome do serviço/i);
    const durationInput = screen.getByLabelText(/duração/i);
    const priceInput = screen.getByLabelText(/preço/i);

    fireEvent.change(nameInput, { target: { value: "Teste" } });
    fireEvent.change(durationInput, { target: { value: "30" } });
    fireEvent.change(priceInput, { target: { value: "40" } });

    const submitButton = screen.getByRole("button", { name: /criar/i });
    fireEvent.click(submitButton);

    // Check if button shows loading state
    await waitFor(() => {
      expect(screen.getByText(/salvando/i)).toBeInTheDocument();
    });
  });

  test("toggles active status with switch", () => {
    render(<ServiceForm />);

    const activeSwitch = screen.getByRole("switch");
    expect(activeSwitch).toBeChecked(); // Default is true

    fireEvent.click(activeSwitch);
    expect(activeSwitch).not.toBeChecked();

    fireEvent.click(activeSwitch);
    expect(activeSwitch).toBeChecked();
  });
});
