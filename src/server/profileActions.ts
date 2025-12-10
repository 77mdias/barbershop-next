"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ProfileSettingsSchema } from "@/schemas/profileSchemas";

// Schema para validação do servidor (adiciona ID ao schema do perfil)
const UpdateProfileSchema = ProfileSettingsSchema.extend({
  id: z.string(),
});

type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * Server Action para atualizar perfil do usuário
 */
export async function updateProfile(data: UpdateProfileInput) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verificar se o usuário pode editar este perfil
    if (session.user.id !== data.id && session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Você não tem permissão para editar este perfil",
      };
    }

    // Validar dados de entrada
    const validatedData = UpdateProfileSchema.parse(data);

    // Verificar se o email já está em uso por outro usuário
    if (validatedData.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id: validatedData.id },
        },
      });

      if (existingUser) {
        return {
          success: false,
          error: "Este email já está sendo usado por outro usuário",
        };
      }
    }

    // Atualizar usuário no banco de dados
    const updatedUser = await db.user.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        nickname: validatedData.nickname || null,
        phone: validatedData.phone || null,
        email: validatedData.email,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    });

    // Revalidar páginas relacionadas
    revalidatePath("/profile");
    revalidatePath("/profile/settings");

    return {
      success: true,
      data: updatedUser,
      message: "Perfil atualizado com sucesso",
    };

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    
    // Tratar erros de validação do Zod
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para obter dados do perfil do usuário atual
 */
export async function getCurrentProfile() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            appointments: true,
            vouchers: true,
            serviceHistory: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    return {
      success: true,
      data: user,
    };

  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para atualizar apenas a imagem de perfil
 */
export async function updateProfileImage(imageUrl: string) {
  try {
    console.log("🖼️ updateProfileImage called with URL:", imageUrl);
    
    const session = await getServerSession(authOptions);
    
    console.log("📋 Session info:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.id) {
      console.log("❌ No authenticated user session");
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    console.log("🔄 Updating user image in database...");

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        image: imageUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        image: true,
      },
    });

    console.log("✅ User image updated successfully:", updatedUser);

    // Revalidar páginas relacionadas
    revalidatePath("/profile");
    revalidatePath("/profile/settings");

    return {
      success: true,
      data: updatedUser,
      message: "Foto de perfil atualizada com sucesso",
    };

  } catch (error) {
    console.error("💥 Erro ao atualizar imagem de perfil:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para alterar senha do usuário
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Buscar o usuário atual com a senha
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!currentUser) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Verificar se o usuário tem senha (pode ter logado via OAuth)
    if (!currentUser.password) {
      return {
        success: false,
        error: "Esta conta foi criada via login social e não possui senha. Entre em contato com o suporte.",
      };
    }

    // Verificar senha atual
    const bcrypt = await import("bcryptjs");
    const isCurrentPasswordValid = await bcrypt.compare(
      data.currentPassword,
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: "Senha atual incorreta",
      };
    }

    // Verificar se a nova senha é diferente da atual
    const isSamePassword = await bcrypt.compare(
      data.newPassword,
      currentUser.password
    );

    if (isSamePassword) {
      return {
        success: false,
        error: "A nova senha deve ser diferente da senha atual",
      };
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);

    // Atualizar senha no banco
    await db.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Senha alterada com sucesso",
    };

  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}