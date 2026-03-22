import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";
import { ResetPasswordBodySchema } from "@/schemas/authApiSchemas";
import { checkRateLimit, createRateLimitErrorResponse } from "@/lib/security/rate-limit";

const RESET_PASSWORD_RATE_LIMIT = {
  scope: "auth:reset-password",
  max: 10,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
} as const;

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, RESET_PASSWORD_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return createRateLimitErrorResponse(
      RESET_PASSWORD_RATE_LIMIT,
      rateLimit,
      "Muitas tentativas de redefinição de senha.",
    );
  }

  try {
    const body = await request.json();
    const parsedBody = ResetPasswordBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, newPassword, token } = parsedBody.data;

    // Buscar usuário com o token válido
    const user = await db.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
    }

    // Criptografar nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha e limpar token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({ message: "Senha redefinida com sucesso" }, { status: 200 });
  } catch (error) {
    logger.api.error("Error resetting password", { error });
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
