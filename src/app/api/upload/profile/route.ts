import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateAndSaveMultipleFiles, smartUpload } from "@/lib/upload";
import { checkRateLimit } from "@/lib/rate-limit";
import { updateProfileImage } from "@/server/profileActions";

export async function POST(request: NextRequest) {
  try {
    // Log detalhado para debug (incluindo informações do dispositivo)
    const userAgent = request.headers.get("user-agent") || "unknown";
    const isMobile = /Mobi|Android/i.test(userAgent);
    const contentType = request.headers.get("content-type") || "unknown";
    
    console.log("📱 Upload Profile API - Request Info:", {
      userAgent,
      isMobile,
      contentType,
      timestamp: new Date().toISOString()
    });

    // Verificar rate limiting
    const rateLimitResult = checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      console.log("❌ Rate limit exceeded:", rateLimitResult.error);
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.log("❌ User not authenticated");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("✅ User authenticated:", session.user.id);

    // Obter dados do FormData - com tratamento de erro mais específico
    let formData;
    try {
      formData = await request.formData();
      console.log("✅ FormData parsed successfully");
    } catch (formDataError) {
      console.error("❌ FormData parsing error:", formDataError);
      return NextResponse.json(
        { error: "Erro ao processar dados do formulário" },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File;

    if (!file) {
      console.log("❌ No file in form data. FormData keys:", Array.from(formData.keys()));
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    console.log("📄 File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
      constructor: file.constructor.name
    });

    // Validar que é apenas uma imagem
    if (!file.type.startsWith("image/")) {
      console.log("❌ Invalid file type:", file.type);
      return NextResponse.json(
        { error: "Apenas imagens são permitidas" },
        { status: 400 }
      );
    }

    console.log("🚀 Processing upload...");

    // Processar upload (usar smartUpload que detecta mobile automaticamente)
    let result;
    try {
      result = await smartUpload(file, "profile", userAgent);
      console.log("📋 Smart upload result:", result);
    } catch (uploadError) {
      console.error("❌ Upload processing error:", uploadError);
      return NextResponse.json(
        { error: `Erro no processamento: ${uploadError.message}` },
        { status: 500 }
      );
    }

    if (!result.success || !result.url) {
      console.log("❌ Upload failed:", result.error);
      return NextResponse.json({ error: result.error || "Erro no upload" }, { status: 400 });
    }

    const uploadedFile = { url: result.url, filename: result.url?.split('/').pop() || '', path: result.url || '', size: file.size };
    
    console.log("✅ File uploaded successfully:", uploadedFile.url);
    
    // Atualizar a imagem no perfil do usuário - com tratamento de erro específico
    let updateResult;
    try {
      updateResult = await updateProfileImage(uploadedFile.url);
      console.log("📋 Profile update result:", updateResult);
    } catch (profileUpdateError) {
      console.error("❌ Profile update error:", profileUpdateError);
      return NextResponse.json(
        { error: `Erro ao atualizar perfil: ${profileUpdateError.message}` },
        { status: 500 }
      );
    }

    if (!updateResult.success) {
      console.log("❌ Profile update failed:", updateResult.error);
      return NextResponse.json({ error: updateResult.error }, { status: 400 });
    }

    console.log("🎉 Profile image updated successfully!");

    return NextResponse.json({
      success: true,
      file: uploadedFile,
      message: "Foto de perfil atualizada com sucesso",
    });
  } catch (error) {
    console.error("💥 Upload profile error (detailed):", {
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