import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateAndSaveMultipleFiles } from "@/lib/upload";
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

    // Obter dados do FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("❌ No file in form data");
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    console.log("📄 File received:", {
      name: file.name,
      type: file.type,
      size: file.size
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

    // Processar upload (salvar em pasta "profile" em vez de "reviews")
    const result = await validateAndSaveMultipleFiles([file], "profile");

    console.log("📋 Upload processing result:", result);

    if (!result.success || !result.files?.[0]) {
      console.log("❌ Upload failed:", result.error);
      return NextResponse.json({ error: result.error || "Erro no upload" }, { status: 400 });
    }

    const uploadedFile = result.files[0];
    
    console.log("✅ File uploaded successfully:", uploadedFile.url);
    
    // Atualizar a imagem no perfil do usuário
    const updateResult = await updateProfileImage(uploadedFile.url);

    console.log("📋 Profile update result:", updateResult);

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
    console.error("💥 Upload profile error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}