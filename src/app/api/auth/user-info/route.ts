import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    logger.api.debug("User info request received", { email });

    if (!email) {
      logger.api.warn("Email not provided in user info request");
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar usuário com suas contas OAuth
    const user = await db.user.findUnique({
      where: { email },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      logger.api.warn("User not found", { email });
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    logger.api.debug("User found", {
      email,
      hasPassword: !!user.password,
      oauthProviders: user.accounts.map(
        (acc: { provider: string }) => acc.provider
      ),
    });

    // Determinar se o usuário tem senha
    const hasPassword = !!user.password;

    // Obter provedores OAuth
    const oauthProviders = user.accounts.map(
      (account: { provider: string }) => account.provider
    );

    return NextResponse.json({
      hasPassword,
      oauthProviders,
      email: user.email,
    });
  } catch (error) {
    logger.api.error("Error fetching user information", { error });
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
