import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FriendshipService } from "@/server/services/friendshipService";
import { SendFriendRequestSchema } from "@/schemas/friendshipSchemas";

/**
 * GET /api/friends/requests
 * Lista solicitações de amizade recebidas
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const requests = await FriendshipService.getReceivedRequests(session.user.id);

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar solicitações" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/friends/requests
 * Envia solicitação de amizade
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
    const validated = SendFriendRequestSchema.parse(body);

    const result = await FriendshipService.sendFriendRequest(
      session.user.id,
      validated.receiverId
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erro ao enviar solicitação:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro ao enviar solicitação" },
      { status: 500 }
    );
  }
}
