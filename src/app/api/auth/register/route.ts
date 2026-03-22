import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { sendVerificationEmail, generateVerificationToken } from "@/lib/email";
import { logger } from "@/lib/logger";
import { RegisterBodySchema } from "@/schemas/authApiSchemas";
import { checkRateLimit, createRateLimitErrorResponse } from "@/lib/security/rate-limit";

const REGISTER_RATE_LIMIT = {
  scope: "auth:register",
  max: 5,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
} as const;

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, REGISTER_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return createRateLimitErrorResponse(REGISTER_RATE_LIMIT, rateLimit, "Muitas tentativas de cadastro.");
  }

  try {
    const body = await request.json();
    const parsedBody = RegisterBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "Dados inválidos", details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, password } = parsedBody.data;

    logger.api.info("Tentativa de cadastro recebida", { hasName: !!name });

    // Verificar se o usuário já existe
    const existingUser = await db.user.findFirst({
      where: {
        email,
      },
      include: {
        accounts: true, // Incluir contas OAuth para verificação
      },
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        return NextResponse.json(
          { message: "Este email pertence a uma conta removida. Restaure-a ou use outro email." },
          { status: 409 },
        );
      }

      // Se já existe com conta OAuth, informar ao usuário
      if (existingUser.accounts && existingUser.accounts.length > 0) {
        const providers = existingUser.accounts.map((acc: { provider: string }) => acc.provider).join(", ");
        return NextResponse.json(
          {
            message: `Este email já está cadastrado via ${providers}. Use o botão "${providers}" para fazer login.`,
          },
          { status: 409 },
        );
      }

      return NextResponse.json({ message: "Usuário já existe com este email" }, { status: 409 });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Gerar token de verificação
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Criar o usuário
    const user = await db.user.create({
      data: {
        name: name, // Adicionar campo name também
        nickname: name, // Manter nickname para compatibilidade
        email,
        password: hashedPassword,
        role: "CLIENT", // Definir como cliente por padrão
        isActive: false, // Usuário inativo até verificar email
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Enviar email de verificação
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      // Se falhar ao enviar email, deletar o usuário criado
      await db.user.delete({ where: { id: user.id } });
      return NextResponse.json({ message: "Erro ao enviar email de verificação. Tente novamente." }, { status: 500 });
    }

    return NextResponse.json({
      message: "Usuário criado com sucesso. Verifique seu email para ativar sua conta.",
      user,
      emailSent: true,
    });
  } catch (error) {
    logger.api.error("Error creating user", { error });
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
