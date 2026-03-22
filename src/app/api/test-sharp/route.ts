import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { canAccessDebugEndpoints } from "@/lib/security/debug-access";

export async function GET(request: NextRequest) {
  if (!canAccessDebugEndpoints(request.headers)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    console.log("🧪 Testing Sharp installation...");

    // Verificar se Sharp está instalado e funcionando
    const sharpVersion = sharp.versions;
    console.log("✅ Sharp versions:", sharpVersion);
    
    // Teste simples de criação de imagem
    const testImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toBuffer();
    
    console.log("✅ Sharp test image created, size:", testImage.length);
    
    return NextResponse.json({
      success: true,
      sharp: {
        versions: sharpVersion,
        testImageSize: testImage.length,
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      }
    });
    
  } catch (error) {
    console.error("❌ Sharp test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    }, { status: 500 });
  }
}
