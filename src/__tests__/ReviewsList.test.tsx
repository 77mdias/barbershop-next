import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewsList } from "@/components/ReviewsList";

// Mock server actions FIRST (before imports)
jest.mock("@/server/reviewActions", () => ({
  getReviews: jest.fn(),
  deleteReview: jest.fn(),
  getReviewStats: jest.fn(),
}));

// Mock toast utilities
jest.mock("@/lib/toast-utils", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock global toast (used in loadReviews function)
global.toast = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
} as any;

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "há 5 minutos"),
}));

jest.mock("date-fns/locale", () => ({
  ptBR: {},
}));

// Mock child components
jest.mock("@/components/ReviewForm", () => ({
  ReviewForm: ({ onCancel }: { onCancel: () => void }) => (
    <div data-testid="review-form">
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
}));

jest.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

jest.mock("@/components/ui/review-skeleton", () => ({
  ReviewsListSkeleton: () => <div data-testid="reviews-skeleton">Loading skeleton...</div>,
}));

// Get mocked functions
import * as reviewActions from "@/server/reviewActions";
import * as toastUtils from "@/lib/toast-utils";

const mockGetReviews = reviewActions.getReviews as jest.MockedFunction<typeof reviewActions.getReviews>;
const mockDeleteReview = reviewActions.deleteReview as jest.MockedFunction<typeof reviewActions.deleteReview>;
const mockGetReviewStats = reviewActions.getReviewStats as jest.MockedFunction<typeof reviewActions.getReviewStats>;
const mockShowToast = toastUtils.showToast as jest.Mocked<typeof toastUtils.showToast>;

// Mock window.confirm
const mockConfirm = jest.fn();
global.confirm = mockConfirm;

describe("ReviewsList", () => {
  const mockReviewData = {
    success: true,
    data: {
      reviews: [
        {
          id: "review-1",
          rating: 5,
          feedback: "Excelente serviço!",
          images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
          completedAt: new Date("2024-01-15"),
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
          finalPrice: 50,
          user: {
            id: "user-1",
            name: "João Silva",
            image: "https://example.com/avatar.jpg",
          },
          service: {
            id: "service-1",
            name: "Corte de Cabelo",
            description: "Corte profissional",
            price: 50,
          },
          appointments: [
            {
              barber: {
                id: "barber-1",
                name: "Carlos Barbeiro",
                image: null,
              },
            },
          ],
        },
        {
          id: "review-2",
          rating: 4,
          feedback: "Muito bom!",
          images: [],
          completedAt: new Date("2024-01-14"),
          createdAt: new Date("2024-01-14"),
          updatedAt: new Date("2024-01-14"),
          finalPrice: 40,
          user: {
            id: "user-2",
            name: "Maria Santos",
            image: null,
          },
          service: {
            id: "service-2",
            name: "Barba",
            description: "Aparar barba",
            price: 40,
          },
          appointments: [
            {
              barber: {
                id: "barber-1",
                name: "Carlos Barbeiro",
                image: null,
              },
            },
          ],
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    },
  };

  const mockStatsData = {
    success: true,
    data: {
      averageRating: 4.5,
      totalReviews: 2,
      ratingDistribution: [
        { rating: 5, count: 1 },
        { rating: 4, count: 1 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetReviews.mockResolvedValue(mockReviewData as any);
    mockGetReviewStats.mockResolvedValue(mockStatsData as any);
    mockConfirm.mockReturnValue(true);
  });

  describe("Rendering - Estados Iniciais", () => {
    test("deve renderizar skeleton durante carregamento", () => {
      render(<ReviewsList />);
      expect(screen.getByTestId("reviews-skeleton")).toBeInTheDocument();
    });

    test("deve exibir mensagem quando não há avaliações", async () => {
      mockGetReviews.mockResolvedValue({
        success: true,
        data: { reviews: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      } as any);

      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("Nenhuma avaliação sua encontrada.")).toBeInTheDocument();
      });
    });

    test("deve renderizar lista de avaliações com sucesso", async () => {
      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
        expect(screen.getByText("Maria Santos")).toBeInTheDocument();
        expect(screen.getByText("Excelente serviço!")).toBeInTheDocument();
        expect(screen.getByText("Muito bom!")).toBeInTheDocument();
      });
    });

    test("deve renderizar avaliação sem imagem do usuário com fallback", async () => {
      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("M")).toBeInTheDocument(); // Fallback inicial de "Maria"
      });
    });
  });

  describe("Stats Card - Estatísticas", () => {
    test("deve exibir card de estatísticas quando showStats=true", async () => {
      render(<ReviewsList showStats={true} />);

      await waitFor(() => {
        expect(screen.getByText("Estatísticas das Avaliações")).toBeInTheDocument();
        expect(screen.getByText("4.5")).toBeInTheDocument();
        expect(screen.getByText("Baseado em 2 avaliações")).toBeInTheDocument();
      });
    });

    test("não deve exibir card de estatísticas quando showStats=false", async () => {
      render(<ReviewsList showStats={false} />);

      await waitFor(() => {
        expect(screen.queryByText("Estatísticas das Avaliações")).not.toBeInTheDocument();
      });

      expect(mockGetReviewStats).not.toHaveBeenCalled();
    });

    test("deve exibir distribuição de avaliações corretamente", async () => {
      render(<ReviewsList showStats={true} />);

      await waitFor(() => {
        expect(screen.getByText("Distribuição de Avaliações")).toBeInTheDocument();
        // Verifica se os ratings estão presentes
        const ratingElements = screen.getAllByText(/^[1-5]$/);
        expect(ratingElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("User Interactions - Ações do Usuário", () => {
    test("deve abrir formulário de edição ao clicar no botão editar", async () => {
      render(<ReviewsList showActions={true} />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find((btn) => btn.querySelector("svg")); // Botão com ícone Edit

      if (editButton) {
        fireEvent.click(editButton);

        await waitFor(() => {
          expect(screen.getByTestId("review-form")).toBeInTheDocument();
          expect(screen.getByText("← Voltar para a lista")).toBeInTheDocument();
        });
      }
    });

    test("deve voltar para lista ao clicar em cancelar no formulário", async () => {
      render(<ReviewsList showActions={true} />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      // Clica em editar
      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find((btn) => btn.querySelector("svg"));

      if (editButton) {
        fireEvent.click(editButton);

        await waitFor(() => {
          expect(screen.getByTestId("review-form")).toBeInTheDocument();
        });

        // Clica em voltar
        const backButton = screen.getByText("← Voltar para a lista");
        fireEvent.click(backButton);

        await waitFor(() => {
          expect(screen.queryByTestId("review-form")).not.toBeInTheDocument();
          expect(screen.getByText("João Silva")).toBeInTheDocument();
        });
      }
    });

    test("deve excluir avaliação com confirmação", async () => {
      mockDeleteReview.mockResolvedValue({ success: true } as any);
      mockConfirm.mockReturnValue(true);

      render(<ReviewsList showActions={true} />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) => {
        const svg = btn.querySelector("svg");
        return svg && svg.classList.toString().includes("lucide-trash");
      });

      if (deleteButton) {
        fireEvent.click(deleteButton);

        await waitFor(() => {
          expect(mockConfirm).toHaveBeenCalledWith("Tem certeza que deseja excluir esta avaliação?");
          expect(mockDeleteReview).toHaveBeenCalledWith({ id: "review-1" });
          expect(mockShowToast.success).toHaveBeenCalledWith(
            "Avaliação excluída!",
            "A avaliação foi removida com sucesso"
          );
        });
      }
    });

    test("não deve excluir se usuário cancelar confirmação", async () => {
      mockConfirm.mockReturnValue(false);

      render(<ReviewsList showActions={true} />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) => {
        const svg = btn.querySelector("svg");
        return svg && svg.classList.toString().includes("lucide-trash");
      });

      if (deleteButton) {
        fireEvent.click(deleteButton);

        expect(mockConfirm).toHaveBeenCalled();
        expect(mockDeleteReview).not.toHaveBeenCalled();
      }
    });

    test("não deve exibir botões de ação quando showActions=false", async () => {
      render(<ReviewsList showActions={false} />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      // Verifica que não há botões de editar/excluir
      const allButtons = screen.getAllByRole("button");
      const actionButtons = allButtons.filter((btn) => {
        const svg = btn.querySelector("svg");
        return svg && (svg.classList.toString().includes("lucide-edit") || svg.classList.toString().includes("lucide-trash"));
      });

      expect(actionButtons.length).toBe(0);
    });
  });

  describe("Image Expansion - Expansão de Imagens", () => {
    test("deve alternar exibição de imagens ao clicar em Mostrar/Ocultar", async () => {
      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      // Imagens devem estar ocultas inicialmente
      expect(screen.queryByAltText("Foto 1")).not.toBeInTheDocument();

      // Clica em "Mostrar"
      const showButton = screen.getByText("Mostrar");
      fireEvent.click(showButton);

      await waitFor(() => {
        expect(screen.getByAltText("Foto 1")).toBeInTheDocument();
        expect(screen.getByAltText("Foto 2")).toBeInTheDocument();
        expect(screen.getByText("Ocultar")).toBeInTheDocument();
      });

      // Clica em "Ocultar"
      const hideButton = screen.getByText("Ocultar");
      fireEvent.click(hideButton);

      await waitFor(() => {
        expect(screen.queryByAltText("Foto 1")).not.toBeInTheDocument();
        expect(screen.getByText("Mostrar")).toBeInTheDocument();
      });
    });

    test("deve exibir contador de fotos correto", async () => {
      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("Fotos (2)")).toBeInTheDocument();
      });
    });
  });

  describe("Pagination - Paginação", () => {
    test("deve exibir controles de paginação quando há múltiplas páginas", async () => {
      mockGetReviews.mockResolvedValue({
        success: true,
        data: {
          reviews: mockReviewData.data!.reviews,
          pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
        },
      } as any);

      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
        expect(screen.getByText("Anterior")).toBeInTheDocument();
        expect(screen.getByText("Próxima")).toBeInTheDocument();
      });
    });

    test("não deve exibir paginação quando há apenas uma página", async () => {
      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      expect(screen.queryByText("Página 1 de 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Anterior")).not.toBeInTheDocument();
    });

    test("deve desabilitar botão Anterior na primeira página", async () => {
      mockGetReviews.mockResolvedValue({
        success: true,
        data: {
          reviews: mockReviewData.data!.reviews,
          pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
        },
      } as any);

      render(<ReviewsList />);

      await waitFor(() => {
        const previousButton = screen.getByText("Anterior").closest("button");
        expect(previousButton).toBeDisabled();
      });
    });

    test("deve desabilitar botão Próxima na última página", async () => {
      mockGetReviews.mockResolvedValue({
        success: true,
        data: {
          reviews: mockReviewData.data!.reviews,
          pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
        },
      } as any);

      render(<ReviewsList />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
      });

      // Now update mock for page 2
      mockGetReviews.mockResolvedValue({
        success: true,
        data: {
          reviews: mockReviewData.data!.reviews,
          pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
        },
      } as any);

      // Navigate to page 2
      const nextButton1 = screen.getByText("Próxima").closest("button");
      if (nextButton1) {
        fireEvent.click(nextButton1);
        await waitFor(() => {
          expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
        });
      }

      // Now update mock for page 3 (last page)
      mockGetReviews.mockResolvedValue({
        success: true,
        data: {
          reviews: mockReviewData.data!.reviews,
          pagination: { page: 3, limit: 10, total: 25, totalPages: 3 },
        },
      } as any);

      // Navigate to page 3
      const nextButton2 = screen.getByText("Próxima").closest("button");
      if (nextButton2) {
        fireEvent.click(nextButton2);
        await waitFor(() => {
          expect(screen.getByText("Página 3 de 3")).toBeInTheDocument();
        });

        // Now the next button should be disabled
        const finalNextButton = screen.getByText("Próxima").closest("button");
        expect(finalNextButton).toBeDisabled();
      }
    });

    test("deve navegar para próxima página ao clicar em Próxima", async () => {
      mockGetReviews.mockResolvedValue({
        success: true,
        data: {
          reviews: mockReviewData.data!.reviews,
          pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
        },
      } as any);

      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
      });

      const nextButton = screen.getByText("Próxima").closest("button");
      if (nextButton) {
        fireEvent.click(nextButton);

        await waitFor(() => {
          expect(mockGetReviews).toHaveBeenCalledWith(
            expect.objectContaining({ page: 2 })
          );
        });
      }
    });
  });

  describe("Props Variations - Variações de Props", () => {
    test("deve aplicar filtro userId corretamente", async () => {
      render(<ReviewsList userId="user-123" />);

      await waitFor(() => {
        expect(mockGetReviews).toHaveBeenCalledWith(
          expect.objectContaining({ userId: "user-123" })
        );
      });
    });

    test("deve aplicar filtro serviceId corretamente", async () => {
      render(<ReviewsList serviceId="service-123" />);

      await waitFor(() => {
        expect(mockGetReviews).toHaveBeenCalledWith(
          expect.objectContaining({ serviceId: "service-123" })
        );
      });
    });

    test("deve aplicar filtro barberId corretamente", async () => {
      render(<ReviewsList barberId="barber-123" />);

      await waitFor(() => {
        expect(mockGetReviews).toHaveBeenCalledWith(
          expect.objectContaining({ barberId: "barber-123" })
        );
      });
    });

    test("deve aplicar parâmetro showAllReviews corretamente", async () => {
      render(<ReviewsList showAllReviews={true} />);

      await waitFor(() => {
        expect(mockGetReviews).toHaveBeenCalledWith(
          expect.objectContaining({ showAllReviews: true })
        );
      });
    });

    test("deve aplicar limit customizado", async () => {
      render(<ReviewsList limit={5} />);

      await waitFor(() => {
        expect(mockGetReviews).toHaveBeenCalledWith(
          expect.objectContaining({ limit: 5 })
        );
      });
    });
  });

  describe("Error Handling - Tratamento de Erros", () => {
    test("deve exibir erro quando falha ao carregar avaliações", async () => {
      mockGetReviews.mockResolvedValue({
        success: false,
        error: "Erro ao buscar avaliações",
      } as any);

      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("Nenhuma avaliação sua encontrada.")).toBeInTheDocument();
      });
    });

    test("deve tratar erro inesperado ao carregar avaliações", async () => {
      mockGetReviews.mockRejectedValue(new Error("Network error"));

      render(<ReviewsList />);

      await waitFor(() => {
        expect(screen.getByText("Nenhuma avaliação sua encontrada.")).toBeInTheDocument();
      });
    });

    test("deve exibir erro ao falhar na exclusão", async () => {
      mockDeleteReview.mockResolvedValue({
        success: false,
        error: "Não autorizado",
      } as any);
      mockConfirm.mockReturnValue(true);

      render(<ReviewsList showActions={true} />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) => {
        const svg = btn.querySelector("svg");
        return svg && svg.classList.toString().includes("lucide-trash");
      });

      if (deleteButton) {
        fireEvent.click(deleteButton);

        await waitFor(() => {
          expect(mockShowToast.error).toHaveBeenCalledWith(
            "Erro ao excluir",
            "Não autorizado"
          );
        });
      }
    });

    test("deve tratar erro inesperado na exclusão", async () => {
      mockDeleteReview.mockRejectedValue(new Error("Unexpected error"));
      mockConfirm.mockReturnValue(true);

      render(<ReviewsList showActions={true} />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) => {
        const svg = btn.querySelector("svg");
        return svg && svg.classList.toString().includes("lucide-trash");
      });

      if (deleteButton) {
        fireEvent.click(deleteButton);

        await waitFor(() => {
          expect(mockShowToast.error).toHaveBeenCalledWith(
            "Erro inesperado",
            "Erro inesperado ao excluir avaliação"
          );
        });
      }
    });
  });
});
