import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FriendshipService } from "@/server/services/friendshipService";

/**
 * DELETE /api/friends/:id
 * Remove amigo
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

    await FriendshipService.removeFriend(session.user.id, id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Erro ao remover amigo:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro ao remover amigo" },
      { status: 500 }
    );
  }
}
