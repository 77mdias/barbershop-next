import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendResetPasswordEmail, generateResetToken } from "@/lib/email";
import { logger } from "@/lib/logger";
import { ForgotPasswordBodySchema } from "@/schemas/authApiSchemas";
import { checkRateLimit, createRateLimitErrorResponse } from "@/lib/security/rate-limit";

const FORGOT_PASSWORD_RATE_LIMIT = {
  scope: "auth:forgot-password",
  max: 5,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
} as const;

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, FORGOT_PASSWORD_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return createRateLimitErrorResponse(
      FORGOT_PASSWORD_RATE_LIMIT,
      rateLimit,
      "Muitas tentativas de recuperação de senha.",
    );
  }

  try {
    const body = await request.json();
    const parsedBody = ForgotPasswordBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const { email } = parsedBody.data;

    // Verificar se o usuário existe
    const user = await db.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return NextResponse.json(
        {
          message: "Se o email existir, você receberá um link para redefinir sua senha",
        },
        { status: 200 },
      );
    }

    // Gerar token único
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Salvar token no banco
    await db.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
    });

    // Enviar email de reset
    const emailResult = await sendResetPasswordEmail(email, resetToken);

    if (!emailResult.success) {
      logger.api.error("Error sending reset email", { reason: emailResult.error });
      return NextResponse.json({ error: "Erro ao enviar email de redefinição" }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Se o email existir, você receberá um link para redefinir sua senha",
      },
      { status: 200 },
    );
  } catch (error) {
    logger.api.error("Error processing password reset request", { error });
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
