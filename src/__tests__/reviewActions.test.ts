/**
 * Review Actions Test Suite
 * Tests for all server actions in /src/server/reviewActions.ts
 */

import { UserRole } from "@prisma/client";

// Unmock reviewActions from global setup to actually test it
jest.unmock("@/server/reviewActions");

// Mock dependencies FIRST (before any imports)
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  db: {
    serviceHistory: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/serializers", () => ({
  serializeReviewsResult: jest.fn((data) => data),
  serializeServiceHistory: jest.fn((data) => data),
}));

jest.mock("@/schemas/reviewSchemas", () => {
  const actual = jest.requireActual("@/schemas/reviewSchemas");
  return {
    ...actual,
    createReviewSchema: {
      parse: jest.fn((data) => data),
    },
    updateReviewSchema: {
      parse: jest.fn((data) => data),
    },
    deleteReviewSchema: {
      parse: jest.fn((data) => data),
    },
    getReviewsSchema: {
      parse: jest.fn((data) => data),
    },
  };
});

// Now import after mocks
import {
  createReview,
  updateReview,
  getPublicReviews,
  getReviews,
  deleteReview,
  getReviewStats,
  getBarberMetrics,
} from "@/server/reviewActions";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Type mocks
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDb = db as jest.Mocked<typeof db>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;

describe("reviewActions", () => {
  // Common test data
  const mockSession = {
    user: {
      id: "user-123",
      email: "user@test.com",
      name: "Test User",
      role: UserRole.CLIENT,
    },
    expires: "2025-12-31",
  };

  const mockServiceHistory = {
    id: "service-history-123",
    userId: "user-123",
    serviceId: "service-123",
    rating: null,
    feedback: null,
    images: [],
    completedAt: new Date("2024-01-15"),
    finalPrice: 50,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    appointments: [
      {
        id: "appt-1",
        barberId: "barber-123",
        barber: {
          id: "barber-123",
          name: "Barber Test",
          image: null,
        },
      },
    ],
    service: {
      id: "service-123",
      name: "Corte de Cabelo",
      description: "Corte profissional",
      price: 50,
      duration: 30,
      isActive: true,
    },
    user: {
      id: "user-123",
      name: "Test User",
      image: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe("createReview", () => {
    const validInput = {
      serviceHistoryId: "service-history-123",
      rating: 5,
      feedback: "Excelente serviço!",
      images: ["https://example.com/image1.jpg"],
    };

    test("deve criar avaliação com sucesso", async () => {
      mockDb.serviceHistory.findFirst.mockResolvedValue(mockServiceHistory as any);
      mockDb.serviceHistory.update.mockResolvedValue({
        ...mockServiceHistory,
        rating: 5,
        feedback: "Excelente serviço!",
        images: ["https://example.com/image1.jpg"],
      } as any);

      const result = await createReview(validInput);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Avaliação criada com sucesso!");
      expect(mockDb.serviceHistory.update).toHaveBeenCalledWith({
        where: { id: validInput.serviceHistoryId },
        data: expect.objectContaining({
          rating: 5,
          feedback: "Excelente serviço!",
          images: { set: ["https://example.com/image1.jpg"] },
        }),
        include: expect.any(Object),
      });
      expect(mockRevalidatePath).toHaveBeenCalledTimes(3);
    });

    test("deve rejeitar se usuário não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await createReview(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuário não autenticado");
      expect(mockDb.serviceHistory.findFirst).not.toHaveBeenCalled();
    });

    test("deve rejeitar se ServiceHistory não pertence ao usuário", async () => {
      mockDb.serviceHistory.findFirst.mockResolvedValue(null);

      const result = await createReview(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Histórico de serviço não encontrado ou não autorizado");
    });

    test("deve rejeitar se serviço já foi avaliado", async () => {
      mockDb.serviceHistory.findFirst.mockResolvedValue({
        ...mockServiceHistory,
        rating: 4,
      } as any);

      const result = await createReview(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Este serviço já foi avaliado");
    });

    test("deve criar avaliação sem imagens", async () => {
      const inputWithoutImages = {
        serviceHistoryId: "service-history-123",
        rating: 5,
        feedback: "Ótimo!",
        images: [],
      };

      mockDb.serviceHistory.findFirst.mockResolvedValue(mockServiceHistory as any);
      mockDb.serviceHistory.update.mockResolvedValue({
        ...mockServiceHistory,
        rating: 5,
        feedback: "Ótimo!",
      } as any);

      const result = await createReview(inputWithoutImages);

      expect(result.success).toBe(true);
      expect(mockDb.serviceHistory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            images: expect.anything(),
          }),
        })
      );
    });

    test("deve tratar erro de validação Zod", async () => {
      // Make the schema.parse throw a validation error
      const { createReviewSchema } = require("@/schemas/reviewSchemas");
      createReviewSchema.parse.mockImplementationOnce(() => {
        throw new Error("Expected number to be less than or equal to 5");
      });

      const invalidInput = {
        serviceHistoryId: "service-history-123",
        rating: 6, // Invalid: rating > 5
        feedback: "Test",
      };

      const result = await createReview(invalidInput as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Erro de validação");
    });

    test("deve tratar erro inesperado", async () => {
      mockDb.serviceHistory.findFirst.mockRejectedValue(new Error("Database error"));

      const result = await createReview(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  describe("updateReview", () => {
    const validUpdateInput = {
      id: "service-history-123",
      rating: 4,
      feedback: "Atualizado!",
      images: ["https://example.com/new-image.jpg"],
    };

    test("deve atualizar avaliação com sucesso", async () => {
      const existingReview = {
        ...mockServiceHistory,
        rating: 3,
        feedback: "Original",
        images: [],
      };

      mockDb.serviceHistory.findFirst.mockResolvedValue(existingReview as any);
      mockDb.serviceHistory.update.mockResolvedValue({
        ...existingReview,
        ...validUpdateInput,
      } as any);

      const result = await updateReview(validUpdateInput);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Avaliação atualizada com sucesso!");
      expect(mockDb.serviceHistory.update).toHaveBeenCalled();
    });

    test("deve rejeitar se usuário não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await updateReview(validUpdateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuário não autenticado");
    });

    test("deve rejeitar se avaliação não encontrada", async () => {
      mockDb.serviceHistory.findFirst.mockResolvedValue(null);

      const result = await updateReview(validUpdateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Avaliação não encontrada ou não autorizada");
    });

    test("deve rejeitar se avaliação não existe (rating null)", async () => {
      // When rating is null, findFirst returns null due to WHERE clause: rating: { not: null }
      mockDb.serviceHistory.findFirst.mockResolvedValue(null);

      const result = await updateReview(validUpdateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Avaliação não encontrada ou não autorizada");
    });

    test("deve atualizar apenas rating", async () => {
      const partialUpdate = {
        id: "service-history-123",
        rating: 5,
      };

      const existingReview = {
        ...mockServiceHistory,
        rating: 4,
        feedback: "Original feedback",
      };

      mockDb.serviceHistory.findFirst.mockResolvedValue(existingReview as any);
      mockDb.serviceHistory.update.mockResolvedValue({
        ...existingReview,
        rating: 5,
      } as any);

      const result = await updateReview(partialUpdate);

      expect(result.success).toBe(true);
    });
  });

  describe("getPublicReviews", () => {
    const mockPublicReviews = [
      {
        ...mockServiceHistory,
        rating: 5,
        feedback: "Muito bom!",
      },
      {
        ...mockServiceHistory,
        id: "service-history-456",
        rating: 4,
        feedback: "Bom serviço",
      },
    ];

    test("deve retornar avaliações públicas sem autenticação", async () => {
      mockGetServerSession.mockResolvedValue(null);
      mockDb.serviceHistory.findMany.mockResolvedValue(mockPublicReviews as any);

      const result = await getPublicReviews(6);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            rating: { not: null },
            feedback: { not: null },
          },
          take: 6,
        })
      );
    });

    test("deve aplicar limite customizado", async () => {
      mockGetServerSession.mockResolvedValue(null);
      mockDb.serviceHistory.findMany.mockResolvedValue([mockPublicReviews[0]] as any);

      await getPublicReviews(3);

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 3 })
      );
    });

    test("deve retornar array vazio se não houver avaliações", async () => {
      mockGetServerSession.mockResolvedValue(null);
      mockDb.serviceHistory.findMany.mockResolvedValue([]);

      const result = await getPublicReviews();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe("getReviews", () => {
    const mockReviews = [
      {
        ...mockServiceHistory,
        rating: 5,
        feedback: "Ótimo!",
      },
      {
        ...mockServiceHistory,
        id: "service-history-456",
        rating: 4,
        feedback: "Bom!",
      },
    ];

    test("deve retornar avaliações do cliente com filtro de role", async () => {
      mockDb.serviceHistory.findMany.mockResolvedValue(mockReviews as any);
      mockDb.serviceHistory.count.mockResolvedValue(2);

      const result = await getReviews({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.reviews).toHaveLength(2);
      expect(result.data?.pagination).toEqual({
        currentPage: 1,
        limit: 10,
        totalCount: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    test("deve aplicar filtro userId", async () => {
      mockDb.serviceHistory.findMany.mockResolvedValue([]);
      mockDb.serviceHistory.count.mockResolvedValue(0);

      await getReviews({ userId: "user-456" });

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: "user-456" }),
        })
      );
    });

    test("deve aplicar filtro serviceId", async () => {
      mockDb.serviceHistory.findMany.mockResolvedValue([]);
      mockDb.serviceHistory.count.mockResolvedValue(0);

      await getReviews({ serviceId: "service-456" });

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ serviceId: "service-456" }),
        })
      );
    });

    test("deve aplicar filtro barberId (via appointments)", async () => {
      mockDb.serviceHistory.findMany.mockResolvedValue([]);
      mockDb.serviceHistory.count.mockResolvedValue(0);

      await getReviews({ barberId: "barber-456" });

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            appointments: { some: { barberId: "barber-456" } },
          }),
        })
      );
    });

    test("deve aplicar filtro de rating", async () => {
      mockDb.serviceHistory.findMany.mockResolvedValue([]);
      mockDb.serviceHistory.count.mockResolvedValue(0);

      await getReviews({ rating: 5 });

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ rating: 5 }),
        })
      );
    });

    test("deve filtrar por role CLIENT (apenas próprias avaliações)", async () => {
      mockDb.serviceHistory.findMany.mockResolvedValue([]);
      mockDb.serviceHistory.count.mockResolvedValue(0);

      await getReviews({});

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: "user-123" }),
        })
      );
    });

    test("deve permitir BARBER ver suas avaliações", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.BARBER },
      } as any);

      mockDb.serviceHistory.findMany.mockResolvedValue([]);
      mockDb.serviceHistory.count.mockResolvedValue(0);

      await getReviews({});

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            appointments: { some: { barberId: mockSession.user.id } },
          }),
        })
      );
    });

    test("deve permitir ADMIN ver todas avaliações", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      mockDb.serviceHistory.findMany.mockResolvedValue([]);
      mockDb.serviceHistory.count.mockResolvedValue(0);

      await getReviews({});

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rating: { not: null } },
        })
      );
    });

    test("deve respeitar showAllReviews override", async () => {
      mockDb.serviceHistory.findMany.mockResolvedValue([]);
      mockDb.serviceHistory.count.mockResolvedValue(0);

      await getReviews({ showAllReviews: true });

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rating: { not: null } },
        })
      );
    });

    test("deve paginar corretamente", async () => {
      mockDb.serviceHistory.findMany.mockResolvedValue([mockReviews[0]] as any);
      mockDb.serviceHistory.count.mockResolvedValue(25);

      const result = await getReviews({ page: 2, limit: 10 });

      expect(mockDb.serviceHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
      expect(result.data?.pagination).toEqual({
        currentPage: 2,
        limit: 10,
        totalCount: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    test("deve rejeitar se não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getReviews({});

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuário não autenticado");
    });
  });

  describe("deleteReview", () => {
    const deleteInput = { id: "service-history-123" };

    test("deve excluir avaliação (soft delete) com sucesso", async () => {
      const existingReview = {
        ...mockServiceHistory,
        rating: 5,
        feedback: "Ótimo!",
        images: ["image.jpg"],
      };

      mockDb.serviceHistory.findFirst.mockResolvedValue(existingReview as any);
      mockDb.serviceHistory.update.mockResolvedValue({
        ...existingReview,
        rating: null,
        feedback: null,
        images: [],
      } as any);

      const result = await deleteReview(deleteInput);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Avaliação removida com sucesso!");
      expect(mockDb.serviceHistory.update).toHaveBeenCalledWith({
        where: { id: deleteInput.id },
        data: expect.objectContaining({
          rating: null,
          feedback: null,
          updatedAt: expect.any(Date),
        }),
      });
      expect(mockRevalidatePath).toHaveBeenCalled();
    });

    test("deve permitir ADMIN excluir qualquer avaliação", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      const otherUserReview = {
        ...mockServiceHistory,
        userId: "other-user-456",
        rating: 5,
      };

      mockDb.serviceHistory.findFirst.mockResolvedValue(otherUserReview as any);
      mockDb.serviceHistory.update.mockResolvedValue({
        ...otherUserReview,
        rating: null,
        feedback: null,
        images: [],
      } as any);

      const result = await deleteReview(deleteInput);

      expect(result.success).toBe(true);
    });

    test("deve rejeitar se não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await deleteReview(deleteInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuário não autenticado");
    });

    test("deve rejeitar se avaliação não encontrada", async () => {
      mockDb.serviceHistory.findFirst.mockResolvedValue(null);

      const result = await deleteReview(deleteInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Avaliação não encontrada ou não autorizada");
    });

    test("deve rejeitar se não é o dono nem ADMIN", async () => {
      // When not admin and not owner, findFirst returns null due to WHERE clause filtering
      mockDb.serviceHistory.findFirst.mockResolvedValue(null);

      const result = await deleteReview(deleteInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Avaliação não encontrada ou não autorizada");
    });
  });

  describe("getReviewStats", () => {
    test("deve calcular estatísticas globais corretamente", async () => {
      // getReviewStats requires authentication
      mockGetServerSession.mockResolvedValue(mockSession as any);

      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 10 },
      } as any);

      mockDb.serviceHistory.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 5 } },
        { rating: 4, _count: { rating: 3 } },
        { rating: 3, _count: { rating: 2 } },
      ] as any);

      const result = await getReviewStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        averageRating: 4.5,
        totalReviews: 10,
        ratingDistribution: [
          { rating: 5, count: 5 },
          { rating: 4, count: 3 },
          { rating: 3, count: 2 },
        ],
      });
    });

    test("deve filtrar por serviceId", async () => {
      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _avg: { rating: 5 },
        _count: { rating: 3 },
      } as any);

      mockDb.serviceHistory.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 3 } },
      ] as any);

      await getReviewStats("service-123");

      expect(mockDb.serviceHistory.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { serviceId: "service-123", rating: { not: null } },
        })
      );
    });

    test("deve filtrar por barberId", async () => {
      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _avg: { rating: 4 },
        _count: { rating: 2 },
      } as any);

      mockDb.serviceHistory.groupBy.mockResolvedValue([
        { rating: 4, _count: { rating: 2 } },
      ] as any);

      await getReviewStats(undefined, "barber-123");

      expect(mockDb.serviceHistory.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            appointments: { some: { barberId: "barber-123" } },
            rating: { not: null },
          },
        })
      );
    });

    test("deve retornar zeros quando não há avaliações", async () => {
      mockDb.serviceHistory.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { rating: 0 },
      } as any);

      mockDb.serviceHistory.groupBy.mockResolvedValue([]);

      const result = await getReviewStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: [],
      });
    });
  });

  describe("getBarberMetrics", () => {
    const barberId = "barber-123";

    test("deve calcular métricas do barbeiro corretamente", async () => {
      // Setup session with ADMIN role to bypass authorization
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      // Mock aggregate calls (returns in order of calls in function)
      mockDb.serviceHistory.aggregate
        .mockResolvedValueOnce({ _avg: { rating: 4.5 }, _count: { rating: 50 } } as any) // reviewsMetrics
        .mockResolvedValueOnce({ _avg: { rating: 4.8 }, _count: { rating: 15 } } as any) // monthlyReviews
        .mockResolvedValueOnce({ _sum: { finalPrice: 1500 }, _count: 30 } as any); // revenueData (_count is a number, not object)

      // Mock count calls
      mockDb.serviceHistory.count.mockResolvedValueOnce(10); // fiveStarReviews

      // Mock findMany for unique clients
      mockDb.serviceHistory.findMany
        .mockResolvedValueOnce(Array(100).fill({ userId: "user-x" }) as any) // uniqueClients
        .mockResolvedValueOnce(Array(30).fill({ userId: "user-y" }) as any); // monthlyClients

      // Mock groupBy for rating distribution
      mockDb.serviceHistory.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 25 } },
        { rating: 4, _count: { rating: 15 } },
        { rating: 3, _count: { rating: 10 } },
      ] as any);

      const result = await getBarberMetrics(barberId);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        averageRating: 4.5,
        totalReviews: 50,
        totalClients: 100,
        monthlyReviews: 15,
        monthlyClients: 30,
        fiveStarReviews: 10,
        totalServices: 30,
        monthlyAverageRating: 4.8,
        monthlyRevenue: 1500,
        ratingDistribution: expect.arrayContaining([
          expect.objectContaining({ rating: 5, count: 25 }),
          expect.objectContaining({ rating: 4, count: 15 }),
          expect.objectContaining({ rating: 3, count: 10 }),
        ]),
        goals: expect.objectContaining({
          averageRating: expect.any(Object),
          monthlyReviews: expect.any(Object),
          monthlyClients: expect.any(Object),
        }),
      });
    });

    test("deve permitir barbeiro ver suas próprias métricas", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, id: barberId, role: UserRole.BARBER },
      } as any);

      // Mock all required calls (3 aggregates, 1 count, 2 findMany, 1 groupBy)
      mockDb.serviceHistory.aggregate
        .mockResolvedValueOnce({ _avg: { rating: 4 }, _count: { rating: 10 } } as any)
        .mockResolvedValueOnce({ _avg: { rating: 4 }, _count: { rating: 2 } } as any)
        .mockResolvedValueOnce({ _sum: { finalPrice: 100 }, _count: { id: 5 } } as any);
      mockDb.serviceHistory.count.mockResolvedValue(0);
      mockDb.serviceHistory.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockDb.serviceHistory.groupBy.mockResolvedValue([]);

      const result = await getBarberMetrics(barberId);

      expect(result.success).toBe(true);
    });

    test("deve permitir ADMIN ver métricas de qualquer barbeiro", async () => {
      mockGetServerSession.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: UserRole.ADMIN },
      } as any);

      mockDb.serviceHistory.aggregate
        .mockResolvedValueOnce({ _avg: { rating: 4 }, _count: { rating: 10 } } as any)
        .mockResolvedValueOnce({ _avg: { rating: 4 }, _count: { rating: 2 } } as any)
        .mockResolvedValueOnce({ _sum: { finalPrice: 100 }, _count: { id: 5 } } as any);
      mockDb.serviceHistory.count.mockResolvedValue(0);
      mockDb.serviceHistory.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockDb.serviceHistory.groupBy.mockResolvedValue([]);

      const result = await getBarberMetrics("other-barber-456");

      expect(result.success).toBe(true);
    });

    test("deve rejeitar se não autenticado", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getBarberMetrics(barberId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuário não autenticado");
    });

    test("deve rejeitar se não é o barbeiro nem ADMIN", async () => {
      const result = await getBarberMetrics("other-barber-456");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Não autorizado");
    });
  });
});
