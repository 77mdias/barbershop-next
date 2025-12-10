import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { ServiceFiltersSchema } from "@/schemas/serviceSchemas";

/**
 * GET /api/services
 * Lista serviços disponíveis com filtros opcionais
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = ServiceFiltersSchema.parse({
      active: searchParams.get("active") ? searchParams.get("active") === "true" : undefined,
      search: searchParams.get("search") || undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      maxDuration: searchParams.get("maxDuration") ? parseInt(searchParams.get("maxDuration")!) : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
    });

    const where: any = {};

    if (filters.active !== undefined) where.active = filters.active;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters.maxDuration) {
      where.duration = { lte: filters.maxDuration };
    }

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        orderBy: [{ active: "desc" }, { name: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.service.count({ where }),
    ]);

    return NextResponse.json({
      services,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

/**
 * POST /api/services
 * Cria um novo serviço (apenas ADMIN)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    // Verificar se é admin
    const user = await db.user.findFirst({
      where: { id: session.user.id, deletedAt: null },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar serviços" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { CreateServiceSchema } = await import("@/schemas/serviceSchemas");
    const data = CreateServiceSchema.parse(body);

    // Verificar se já existe serviço com mesmo nome
    const existingService = await db.service.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
      },
    });

    if (existingService) {
      return NextResponse.json({ error: "Já existe um serviço com este nome" }, { status: 409 });
    }

    const service = await db.service.create({
      data,
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos", details: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
