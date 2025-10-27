import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FriendshipService } from "@/server/services/friendshipService";
import { UserSearchSchema } from "@/schemas/friendshipSchemas";

/**
 * GET /api/friends/search
 * Busca usuários por nome/email
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
    const query = searchParams.get("query");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Busca deve ter no mínimo 2 caracteres" },
        { status: 400 }
      );
    }

    const excludeFriends = searchParams.get("excludeFriends") !== "false";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const filters = UserSearchSchema.parse({
      query,
      excludeFriends,
      page,
      limit,
    });

    const result = await FriendshipService.searchUsers(session.user.id, filters);

    return NextResponse.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}
