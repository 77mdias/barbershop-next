import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateAndSaveMultipleFiles } from "@/lib/upload";
import { checkRateLimit } from "@/lib/rate-limit";
import { updateProfileImage } from "@/server/profileActions";

export async function POST(request: NextRequest) {
  try {
    // Verificar rate limiting
    const rateLimitResult = checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter dados do FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar que é apenas uma imagem
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Apenas imagens são permitidas" },
        { status: 400 }
      );
    }

    // Processar upload (salvar em pasta "profile" em vez de "reviews")
    const result = await validateAndSaveMultipleFiles([file], "profile");

    if (!result.success || !result.files?.[0]) {
      return NextResponse.json({ error: result.error || "Erro no upload" }, { status: 400 });
    }

    const uploadedFile = result.files[0];
    
    // Atualizar a imagem no perfil do usuário
    const updateResult = await updateProfileImage(uploadedFile.url);

    if (!updateResult.success) {
      return NextResponse.json({ error: updateResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      file: uploadedFile,
      message: "Foto de perfil atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro no upload de perfil:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}