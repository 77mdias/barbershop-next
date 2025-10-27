import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FriendshipService } from "@/server/services/friendshipService";

/**
 * GET /api/friends/suggestions
 * Busca sugestões de amigos baseado em amigos em comum
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const suggestions = await FriendshipService.getSuggestions(
      session.user.id,
      limit
    );

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Erro ao buscar sugestões:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar sugestões" },
      { status: 500 }
    );
  }
}
