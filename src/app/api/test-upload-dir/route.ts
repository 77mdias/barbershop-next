import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing uploads directory...");
    
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const profileDir = path.join(process.cwd(), "public/uploads/profile");
    
    const tests = {
      cwd: process.cwd(),
      uploadDir,
      profileDir,
      uploadsExists: false,
      profileExists: false,
      uploadsWritable: false,
      profileWritable: false,
      error: null
    };
    
    try {
      // Verificar se diretório uploads existe
      await fs.access(uploadDir);
      tests.uploadsExists = true;
      console.log("✅ uploads directory exists");
      
      // Tentar criar arquivo de teste
      const testFile = path.join(uploadDir, "test-write.txt");
      await fs.writeFile(testFile, "test");
      await fs.unlink(testFile);
      tests.uploadsWritable = true;
      console.log("✅ uploads directory is writable");
      
    } catch (error) {
      console.log("❌ uploads directory issue:", error.message);
      tests.error = error.message;
    }
    
    try {
      // Verificar se diretório profile existe
      await fs.access(profileDir);
      tests.profileExists = true;
      console.log("✅ profile directory exists");
      
      // Tentar criar arquivo de teste
      const testFile = path.join(profileDir, "test-write.txt");
      await fs.writeFile(testFile, "test");
      await fs.unlink(testFile);
      tests.profileWritable = true;
      console.log("✅ profile directory is writable");
      
    } catch (error) {
      console.log("❌ profile directory issue:", error.message);
      if (!tests.error) tests.error = error.message;
    }
    
    // Tentar criar diretórios se não existem
    if (!tests.uploadsExists || !tests.profileExists) {
      console.log("🔧 Creating missing directories...");
      await fs.mkdir(profileDir, { recursive: true });
      
      // Testar novamente
      await fs.access(uploadDir);
      await fs.access(profileDir);
      tests.uploadsExists = true;
      tests.profileExists = true;
      console.log("✅ Directories created successfully");
    }
    
    return NextResponse.json({
      success: true,
      tests,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    });
    
  } catch (error) {
    console.error("❌ Directory test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    }, { status: 500 });
  }
}