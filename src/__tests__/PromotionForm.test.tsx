import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import PromotionForm from "@/components/PromotionForm";

jest.mock("@/server/promotionAdminActions", () => ({
  createPromotion: jest.fn(),
  updatePromotion: jest.fn(),
}));

import * as promotionAdminActions from "@/server/promotionAdminActions";
const mockCreatePromotion = promotionAdminActions.createPromotion as jest.MockedFunction<
  typeof promotionAdminActions.createPromotion
>;
const mockUpdatePromotion = promotionAdminActions.updatePromotion as jest.MockedFunction<
  typeof promotionAdminActions.updatePromotion
>;

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from "sonner";
const mockToast = toast as jest.Mocked<typeof toast>;

const availableServices = [
  { id: "svc-1", name: "Corte", active: true },
  { id: "svc-2", name: "Barba", active: false },
];

describe("PromotionForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePromotion.mockResolvedValue({
      success: true,
      message: "Promoção criada com sucesso",
      data: { id: "promo-1" } as any,
    });
    mockUpdatePromotion.mockResolvedValue({
      success: true,
      message: "Promoção atualizada com sucesso",
      data: { id: "promo-1" } as any,
    });
  });

  test("renderiza campos principais do formulário", () => {
    render(<PromotionForm availableServices={availableServices} />);

    expect(screen.getByLabelText(/nome da promoção/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/início/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/término/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/promoção global/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/promoção ativa/i)).toBeInTheDocument();
  });

  test("cria promoção específica com serviços selecionados", async () => {
    render(<PromotionForm availableServices={availableServices} />);

    fireEvent.change(screen.getByLabelText(/nome da promoção/i), {
      target: { value: "Promoção Teste" },
    });
    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: "Descrição teste" },
    });
    fireEvent.change(screen.getByLabelText(/valor/i), {
      target: { value: "15", valueAsNumber: 15 },
    });
    fireEvent.change(screen.getByLabelText(/início/i), {
      target: { value: "2025-01-01", valueAsDate: new Date("2025-01-01") },
    });
    fireEvent.change(screen.getByLabelText(/término/i), {
      target: { value: "2025-01-31", valueAsDate: new Date("2025-01-31") },
    });
    fireEvent.change(screen.getByLabelText(/frequência mínima/i), {
      target: { value: "2", valueAsNumber: 2 },
    });

    const globalSwitch = screen.getByLabelText(/promoção global/i);
    fireEvent.click(globalSwitch);

    const firstService = screen.getByLabelText(/corte/i);
    fireEvent.click(firstService);

    const submitButton = screen.getByRole("button", { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreatePromotion).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Promoção Teste",
          description: "Descrição teste",
          type: "DISCOUNT_PERCENTAGE",
          value: 15,
          validFrom: new Date("2025-01-01"),
          validUntil: new Date("2025-01-31"),
          isGlobal: false,
          minFrequency: 2,
          active: true,
          serviceIds: ["svc-1"],
        })
      );
    });

    expect(mockToast.success).toHaveBeenCalledWith("Promoção criada com sucesso");
  });

  test("atualiza promoção existente", async () => {
    const initialData = {
      id: "promo-123",
      name: "Promoção Original",
      description: "Desc",
      type: "DISCOUNT_FIXED" as const,
      value: 50,
      validFrom: new Date("2025-02-01"),
      isGlobal: true,
      active: true,
    };

    render(<PromotionForm initialData={initialData} availableServices={availableServices} />);

    const nameInput = screen.getByLabelText(/nome da promoção/i);
    fireEvent.change(nameInput, { target: { value: "Promoção Atualizada" } });

    const valueInput = screen.getByLabelText(/valor/i);
    fireEvent.change(valueInput, { target: { value: "50", valueAsNumber: 50 } });

    const validFromInput = screen.getByLabelText(/início/i);
    fireEvent.change(validFromInput, { target: { value: "2025-02-01" } });

    const submitButton = screen.getByRole("button", { name: /atualizar/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockUpdatePromotion).toHaveBeenCalledWith(
        "promo-123",
        expect.objectContaining({
          name: "Promoção Atualizada",
          description: "Desc",
          type: "DISCOUNT_FIXED",
          value: 50,
          validFrom: new Date("2025-02-01"),
          isGlobal: true,
          active: true,
        })
      );
    });
  });

  test("mostra toast de erro quando server action falha", async () => {
    mockCreatePromotion.mockResolvedValue({ success: false, error: "Erro ao criar" });

    render(<PromotionForm availableServices={availableServices} />);

    fireEvent.change(screen.getByLabelText(/nome da promoção/i), {
      target: { value: "Falha" },
    });

    fireEvent.change(screen.getByLabelText(/valor/i), {
      target: { value: "10", valueAsNumber: 10 },
    });

    fireEvent.change(screen.getByLabelText(/início/i), {
      target: { value: "2025-01-01" },
    });

    const submitButton = screen.getByRole("button", { name: /criar/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Erro ao criar");
    });
  });
});
