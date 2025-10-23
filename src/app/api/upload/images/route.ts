import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateAndSaveMultipleFiles, smartUpload } from "@/lib/upload";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Log para debug (incluindo informações do ambiente)
    const userAgent = request.headers.get("user-agent") || "unknown";
    const isMobile = /Mobi|Android/i.test(userAgent);
    const isProduction = process.env.NODE_ENV === "production";
    const isVercel = process.env.VERCEL === "1";
    
    console.log("📸 Upload Images API - Request Info:", {
      userAgent,
      isMobile,
      isProduction,
      isVercel,
      platform: process.platform,
      timestamp: new Date().toISOString()
    });
    
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
      console.log("❌ No files in form data. FormData keys:", Array.from(formData.keys()));
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    console.log("📄 Files received:", files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      constructor: f.constructor.name
    })));

    // Processar cada arquivo usando smartUpload (que detecta ambiente automaticamente)
    console.log("🚀 Processing uploads with smart upload...");
    
    const uploadResults = await Promise.all(
      files.map(async (file, index) => {
        console.log(`📤 Processing file ${index + 1}/${files.length}: ${file.name}`);
        try {
          const result = await smartUpload(file, "reviews", userAgent);
          console.log(`📋 File ${index + 1} result:`, result);
          return result;
        } catch (error) {
          console.error(`❌ Error processing file ${index + 1}:`, error);
          return {
            success: false,
            error: `Erro ao processar ${file.name}: ${error.message}`
          };
        }
      })
    );

    // Verificar se algum upload falhou
    const failedUploads = uploadResults.filter(result => !result.success);
    
    if (failedUploads.length > 0) {
      console.log("❌ Some uploads failed:", failedUploads);
      return NextResponse.json({ 
        error: failedUploads[0].error || "Erro ao processar arquivos" 
      }, { status: 400 });
    }

    // Construir resposta dos arquivos enviados
    const uploadedFiles = uploadResults.map((result, index) => ({
      filename: result.url?.split('/').pop() || files[index].name,
      path: result.url || "",
      size: files[index].size,
      url: result.url || "",
      base64: result.base64, // Include base64 for production
    }));

    console.log("✅ All uploads successful:", uploadedFiles.length, "files");

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: "Upload realizado com sucesso",
      isProduction: uploadResults.some(r => r.base64) ? true : false, // Indicate if using base64
    });
  } catch (error) {
    console.error("💥 Upload images error (detailed):", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    return NextResponse.json(
      { error: `Erro interno: ${error.message}` },
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
