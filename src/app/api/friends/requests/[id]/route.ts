import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FriendshipService } from "@/server/services/friendshipService";

/**
 * PATCH /api/friends/requests/:id
 * Responde solicitação de amizade (accept/reject)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Ação inválida" },
        { status: 400 }
      );
    }

    // Verificar permissão
    const friendRequest = await FriendshipService.findRequestById(id);

    if (!friendRequest) {
      return NextResponse.json(
        { success: false, error: "Solicitação não encontrada" },
        { status: 404 }
      );
    }

    if (friendRequest.receiverId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Sem permissão" },
        { status: 403 }
      );
    }

    let result;
    if (action === "accept") {
      result = await FriendshipService.acceptFriendRequest(id);
    } else {
      result = await FriendshipService.rejectFriendRequest(id);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erro ao responder solicitação:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro ao responder solicitação" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/friends/requests/:id
 * Cancela solicitação de amizade enviada
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    await FriendshipService.cancelFriendRequest(id, session.user.id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Erro ao cancelar solicitação:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro ao cancelar solicitação" },
      { status: 500 }
    );
  }
}
