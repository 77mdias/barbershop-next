import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar um serviço existente
    const service = await db.service.findFirst({
      where: { active: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Nenhum serviço encontrado" },
        { status: 404 }
      );
    }

    // Criar um novo ServiceHistory sem avaliação
    const newServiceHistory = await db.serviceHistory.create({
      data: {
        userId: session.user.id,
        serviceId: service.id,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        finalPrice: service.price,
        notes: "Serviço criado para teste de avaliação",
      },
      include: {
        service: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: newServiceHistory,
      message: "ServiceHistory criado com sucesso para teste!",
    });
  } catch (error) {
    console.error("Erro ao criar ServiceHistory de teste:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
