import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateAndSaveMultipleFiles } from "@/lib/upload";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Log para debug
    const userAgent = request.headers.get("user-agent") || "unknown";
    const isMobile = /Mobi|Android/i.test(userAgent);
    
    console.log("📸 Upload Images API:", { userAgent, isMobile });
    
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
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Processar upload (passar user agent para detecção de mobile)
    const result = await validateAndSaveMultipleFiles(files, "reviews", userAgent);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      files: result.files,
      message: "Upload realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Método para deletar arquivos
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "Caminho do arquivo não informado" },
        { status: 400 }
      );
    }

    // Importar função de delete dinamicamente
    const { deleteFile } = await import("@/lib/upload");
    const success = await deleteFile(filePath);

    if (!success) {
      return NextResponse.json(
        { error: "Erro ao deletar arquivo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Arquivo deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
