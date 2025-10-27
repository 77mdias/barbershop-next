import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FriendshipService } from "@/server/services/friendshipService";
import { AcceptInviteSchema } from "@/schemas/friendshipSchemas";

/**
 * GET /api/friends/invite
 * Gera ou obtém código de convite do usuário
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
    const regenerate = searchParams.get("regenerate") === "true";

    const inviteCode = await FriendshipService.generateInviteCode(
      session.user.id,
      regenerate
    );

    return NextResponse.json({
      success: true,
      data: { inviteCode },
    });
  } catch (error) {
    console.error("Erro ao gerar código de convite:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao gerar código de convite" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/friends/invite
 * Aceita convite via código
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = AcceptInviteSchema.parse(body);

    const result = await FriendshipService.acceptInvite(
      session.user.id,
      validated.inviteCode
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro ao aceitar convite" },
      { status: 500 }
    );
  }
}
