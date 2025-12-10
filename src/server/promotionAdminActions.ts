"use server";

import { getServerSession } from "next-auth";
import { type Session } from "next-auth";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import {
  CreatePromotionSchema,
  UpdatePromotionSchema,
  type CreatePromotionInput,
  type UpdatePromotionInput,
  type PromotionFiltersInput,
} from "@/schemas/promotionSchemas";

type AdminSession = Session & { user: { id: string; role: string } };

function ensureAdminSession(session: AdminSession | null) {
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" } as const;
  }

  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Acesso negado: apenas administradores" } as const;
  }

  return null;
}

function dedupeIds(ids?: string[]) {
  if (!ids) return [] as string[];
  return Array.from(new Set(ids.filter(Boolean)));
}

function revalidatePromotionPaths() {
  revalidatePath("/dashboard/admin/promotions");
  revalidatePath("/promotions");
  revalidatePath("/");
}

export async function createPromotion(data: CreatePromotionInput) {
  try {
    const session = (await getServerSession(authOptions)) as AdminSession | null;
    const authError = ensureAdminSession(session);
    if (authError) return authError;

    const validatedData = CreatePromotionSchema.parse(data);

    const existing = await db.promotion.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Já existe uma promoção com este nome",
      } as const;
    }

    const serviceIds = dedupeIds(validatedData.serviceIds);
    const userIds = dedupeIds(validatedData.userIds);

    const promotion = await db.$transaction(async (tx) => {
      const created = await tx.promotion.create({
        data: {
          name: validatedData.name,
          description: validatedData.description ?? null,
          type: validatedData.type,
          value: validatedData.value,
          validFrom: validatedData.validFrom,
          validUntil: validatedData.validUntil ?? null,
          isGlobal: validatedData.isGlobal,
          minFrequency: validatedData.minFrequency ?? null,
          active: validatedData.active,
        },
      });

      if (serviceIds.length) {
        await tx.promotionService.createMany({
          data: serviceIds.map((serviceId) => ({
            promotionId: created.id,
            serviceId,
          })),
          skipDuplicates: true,
        });
      }

      if (userIds.length) {
        await tx.userPromotion.createMany({
          data: userIds.map((userId) => ({
            promotionId: created.id,
            userId,
          })),
          skipDuplicates: true,
        });
      }

      return created;
    });

    revalidatePromotionPaths();

    return {
      success: true,
      data: promotion,
      message: "Promoção criada com sucesso",
    } as const;
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      } as const;
    }

    console.error("Erro ao criar promoção:", error);
    return {
      success: false,
      error: "Erro ao criar promoção",
    } as const;
  }
}

export async function updatePromotion(promotionId: string, data: UpdatePromotionInput) {
  try {
    const session = (await getServerSession(authOptions)) as AdminSession | null;
    const authError = ensureAdminSession(session);
    if (authError) return authError;

    const validatedData = UpdatePromotionSchema.parse(data);

    const existing = await db.promotion.findUnique({ where: { id: promotionId } });
    if (!existing) {
      return {
        success: false,
        error: "Promoção não encontrada",
      } as const;
    }

    if (validatedData.name && validatedData.name !== existing.name) {
      const nameConflict = await db.promotion.findFirst({
        where: {
          id: { not: promotionId },
          name: { equals: validatedData.name, mode: "insensitive" },
        },
      });

      if (nameConflict) {
        return {
          success: false,
          error: "Já existe outra promoção com este nome",
        } as const;
      }
    }

    const serviceIds = validatedData.serviceIds ? dedupeIds(validatedData.serviceIds) : null;
    const userIds = validatedData.userIds ? dedupeIds(validatedData.userIds) : null;

    const promotion = await db.$transaction(async (tx) => {
      const updated = await tx.promotion.update({
        where: { id: promotionId },
        data: {
          ...(validatedData.name ? { name: validatedData.name } : {}),
          ...(validatedData.description !== undefined
            ? { description: validatedData.description ?? null }
            : {}),
          ...(validatedData.type ? { type: validatedData.type } : {}),
          ...(validatedData.value !== undefined ? { value: validatedData.value } : {}),
          ...(validatedData.validFrom ? { validFrom: validatedData.validFrom } : {}),
          ...(validatedData.validUntil !== undefined
            ? { validUntil: validatedData.validUntil ?? null }
            : {}),
          ...(validatedData.isGlobal !== undefined ? { isGlobal: validatedData.isGlobal } : {}),
          ...(validatedData.minFrequency !== undefined
            ? { minFrequency: validatedData.minFrequency ?? null }
            : {}),
          ...(validatedData.active !== undefined ? { active: validatedData.active } : {}),
        },
      });

      if (serviceIds) {
        await tx.promotionService.deleteMany({ where: { promotionId } });
        if (serviceIds.length) {
          await tx.promotionService.createMany({
            data: serviceIds.map((serviceId) => ({ promotionId, serviceId })),
            skipDuplicates: true,
          });
        }
      }

      if (userIds) {
        await tx.userPromotion.deleteMany({ where: { promotionId } });
        if (userIds.length) {
          await tx.userPromotion.createMany({
            data: userIds.map((userId) => ({ promotionId, userId })),
            skipDuplicates: true,
          });
        }
      }

      return updated;
    });

    revalidatePromotionPaths();

    return {
      success: true,
      data: promotion,
      message: "Promoção atualizada com sucesso",
    } as const;
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      } as const;
    }

    console.error("Erro ao atualizar promoção:", error);
    return {
      success: false,
      error: "Erro ao atualizar promoção",
    } as const;
  }
}

export async function togglePromotionStatus(promotionId: string) {
  try {
    const session = await getServerSession(authOptions);
    const authError = ensureAdminSession(session);
    if (authError) return authError;

    const existing = await db.promotion.findUnique({
      where: { id: promotionId },
      select: { id: true, active: true, name: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Promoção não encontrada",
      } as const;
    }

    const promotion = await db.promotion.update({
      where: { id: promotionId },
      data: { active: !existing.active },
    });

    revalidatePromotionPaths();

    return {
      success: true,
      data: promotion,
      message: `Promoção ${promotion.active ? "ativada" : "desativada"} com sucesso`,
    } as const;
  } catch (error) {
    console.error("Erro ao alternar status da promoção:", error);
    return {
      success: false,
      error: "Erro ao alternar status da promoção",
    } as const;
  }
}

export async function deletePromotion(promotionId: string) {
  try {
    const session = await getServerSession(authOptions);
    const authError = ensureAdminSession(session);
    if (authError) return authError;

    const existing = await db.promotion.findUnique({
      where: { id: promotionId },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Promoção não encontrada",
      } as const;
    }

    if (existing._count.appointments > 0) {
      const promotion = await db.promotion.update({
        where: { id: promotionId },
        data: { active: false },
      });

      revalidatePromotionPaths();

      return {
        success: true,
        data: promotion,
        message: "Promoção marcada como inativa (já foi utilizada)",
      } as const;
    }

    await db.$transaction([
      db.promotionService.deleteMany({ where: { promotionId } }),
      db.userPromotion.deleteMany({ where: { promotionId } }),
      db.promotion.delete({ where: { id: promotionId } }),
    ]);

    revalidatePromotionPaths();

    return {
      success: true,
      message: "Promoção deletada com sucesso",
    } as const;
  } catch (error) {
    console.error("Erro ao deletar promoção:", error);
    return {
      success: false,
      error: "Erro ao deletar promoção",
    } as const;
  }
}

export async function getPromotionsForAdmin(filters?: PromotionFiltersInput) {
  try {
    const session = await getServerSession(authOptions);
    const authError = ensureAdminSession(session);
    if (authError) {
      return { ...authError, data: [] } as const;
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isGlobal !== undefined) {
      where.isGlobal = filters.isGlobal;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [promotions, total] = await Promise.all([
      db.promotion.findMany({
        where,
        include: {
          _count: {
            select: {
              appointments: true,
              servicePromotions: true,
              userPromotions: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.promotion.count({ where }),
    ]);

    return {
      success: true,
      data: promotions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as const;
  } catch (error) {
    console.error("Erro ao buscar promoções:", error);
    return {
      success: false,
      error: "Erro ao buscar promoções",
      data: [],
    } as const;
  }
}

export async function getPromotionByIdForAdmin(promotionId: string) {
  try {
    const session = await getServerSession(authOptions);
    const authError = ensureAdminSession(session);
    if (authError) return authError;

    const promotion = await db.promotion.findUnique({
      where: { id: promotionId },
      include: {
        servicePromotions: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                active: true,
              },
            },
          },
        },
        userPromotions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: true,
            servicePromotions: true,
            userPromotions: true,
          },
        },
      },
    });

    if (!promotion) {
      return {
        success: false,
        error: "Promoção não encontrada",
      } as const;
    }

    return {
      success: true,
      data: promotion,
    } as const;
  } catch (error) {
    console.error("Erro ao buscar promoção:", error);
    return {
      success: false,
      error: "Erro ao buscar promoção",
    } as const;
  }
}