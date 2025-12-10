jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  db: {
    promotion: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { getPromotionsForAdmin } from "@/server/promotionAdminActions";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDb = db as unknown as {
  promotion: {
    findMany: jest.Mock;
    count: jest.Mock;
  };
};

describe("promotionAdminActions.getPromotionsForAdmin", () => {
  const adminSession = {
    user: {
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    },
    expires: "2025-12-31",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.promotion.findMany.mockResolvedValue([]);
    mockDb.promotion.count.mockResolvedValue(0);
  });

  test("retorna erro quando usuário não está autenticado", async () => {
    mockGetServerSession.mockResolvedValue(null as any);

    const result = await getPromotionsForAdmin();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Não autenticado");
    expect(result.data).toEqual([]);
  });

  test("retorna erro quando usuário não é admin", async () => {
    mockGetServerSession.mockResolvedValue({
      ...adminSession,
      user: { ...adminSession.user, role: "CLIENT" },
    } as any);

    const result = await getPromotionsForAdmin();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Acesso negado: apenas administradores");
    expect(result.data).toEqual([]);
  });

  test("aplica filtro de status ativo", async () => {
    mockGetServerSession.mockResolvedValue(adminSession);

    mockDb.promotion.findMany.mockResolvedValue([
      {
        id: "promo-1",
        name: "Promoção Ativa",
        active: true,
        type: "DISCOUNT_FIXED",
        value: 10,
        validFrom: new Date(),
        isGlobal: true,
        _count: { appointments: 0, servicePromotions: 0, userPromotions: 0 },
      },
    ]);
    mockDb.promotion.count.mockResolvedValue(1);

    const result = await getPromotionsForAdmin({ active: true, page: 1, limit: 10 });

    expect(mockDb.promotion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true },
      })
    );
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  test("retorna erro quando consulta falha", async () => {
    mockGetServerSession.mockResolvedValue(adminSession);
    mockDb.promotion.findMany.mockRejectedValue(new Error("DB fail"));

    const result = await getPromotionsForAdmin();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Erro ao buscar promoções");
  });
});
