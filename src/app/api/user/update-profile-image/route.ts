import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

/**
 * 🔄 API Route - Atualizar Foto de Perfil
 *
 * Atualiza a URL da foto de perfil do usuário no banco de dados
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("❌ User not authenticated");
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("🔄 Updating profile image for user:", userId);

    const existingUser = await db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Usuário não encontrado ou removido" }, { status: 404 });
    }

    // 2. Extrair URL da imagem
    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      console.log("❌ Invalid image URL provided");
      return NextResponse.json({ error: "URL da imagem é obrigatória" }, { status: 400 });
    }

    console.log("📸 New image URL:", imageUrl);

    // 3. Atualizar no banco de dados
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
      },
    });

    console.log("✅ Profile image updated successfully:", updatedUser.image);

    // 4. Resposta de sucesso
    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Foto de perfil atualizada com sucesso",
    });
  } catch (error) {
    console.error("💥 Error updating profile image:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
