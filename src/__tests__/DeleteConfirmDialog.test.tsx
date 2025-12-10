import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

// Mock server actions
jest.mock("@/server/serviceAdminActions", () => ({
  deleteService: jest.fn(),
}));

// Get mocked functions
import * as serviceAdminActions from "@/server/serviceAdminActions";
const mockDeleteService = serviceAdminActions.deleteService as jest.MockedFunction<
  typeof serviceAdminActions.deleteService
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

describe("DeleteConfirmDialog", () => {
  const defaultProps = {
    trigger: <button>Delete</button>,
    serviceId: "service-123",
    serviceName: "Corte de Cabelo",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteService.mockResolvedValue({
      success: true,
      message: "Serviço deletado com sucesso",
      data: undefined,
    } as any);
  });

  test("renders trigger button", () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("opens dialog when trigger is clicked", async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
    });
  });

  test("displays service name in confirmation message", async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Corte de Cabelo/i)
      ).toBeInTheDocument();
    });
  });

  test("shows soft delete warning when service has history", async () => {
    render(<DeleteConfirmDialog {...defaultProps} hasHistory={true} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(
        screen.getByText(/será marcado como inativo/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Desativar Serviço/i)).toBeInTheDocument();
    });
  });

  test("shows hard delete warning when service has no history", async () => {
    render(<DeleteConfirmDialog {...defaultProps} hasHistory={false} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(
        screen.getByText(/deletado permanentemente/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Deletar Permanentemente/i)).toBeInTheDocument();
    });
  });

  test("calls deleteService when confirm button is clicked", async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /deletar permanentemente/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteService).toHaveBeenCalledWith("service-123");
    });
  });

  test("shows success toast on successful deletion", async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /deletar permanentemente/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Serviço deletado com sucesso"
      );
    });
  });

  test("shows error toast on deletion failure", async () => {
    mockDeleteService.mockResolvedValue({
      success: false,
      error: "Erro ao deletar serviço",
    });

    render(<DeleteConfirmDialog {...defaultProps} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /deletar permanentemente/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Erro ao deletar serviço");
    });
  });

  test("calls onSuccess callback after successful deletion", async () => {
    const onSuccess = jest.fn();
    render(<DeleteConfirmDialog {...defaultProps} onSuccess={onSuccess} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /deletar permanentemente/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  test("closes dialog when cancel button is clicked", async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText("Confirmar Exclusão")).not.toBeInTheDocument();
    });
  });

  test("shows loading state while deleting", async () => {
    mockDeleteService.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: "Serviço deletado",
                data: undefined,
              } as any),
            100
          )
        )
    );

    render(<DeleteConfirmDialog {...defaultProps} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /deletar permanentemente/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/deletando/i)).toBeInTheDocument();
    });
  });

  test("disables buttons while deleting", async () => {
    mockDeleteService.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: "Serviço deletado",
                data: undefined,
              } as any),
            100
          )
        )
    );

    render(<DeleteConfirmDialog {...defaultProps} />);

    const triggerButton = screen.getByText("Delete");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /deletar permanentemente/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      const cancelButton = screen.getByRole("button", { name: /cancelar/i });
      expect(cancelButton).toBeDisabled();
    });
  });
});
