import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FriendshipService } from "@/server/services/friendshipService";
import { FriendshipFiltersSchema } from "@/schemas/friendshipSchemas";

/**
 * GET /api/friends
 * Lista amigos do usuário autenticado
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
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const filters = FriendshipFiltersSchema.parse({
      search,
      page,
      limit,
    });

    const result = await FriendshipService.getFriends(session.user.id, filters);

    return NextResponse.json({
      success: true,
      data: result.friends,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Erro ao buscar amigos:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar amigos" },
      { status: 500 }
    );
  }
}
