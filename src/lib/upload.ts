import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import crypto from "crypto";

// Tipos de arquivo permitidos
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

// Lista de assinaturas de arquivo (magic numbers) para validação adicional
const FILE_SIGNATURES: Record<string, string[]> = {
  "image/jpeg": ["ffd8ff"],
  "image/jpg": ["ffd8ff"],
  "image/png": ["89504e47"],
  "image/webp": ["52494646"],
};

// Função para verificar assinatura do arquivo
async function verifyFileSignature(
  buffer: Buffer,
  mimeType: string
): Promise<boolean> {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) return false;

  const fileHeader = buffer.slice(0, 8).toString("hex");
  return signatures.some((sig) => fileHeader.toLowerCase().startsWith(sig));
}

// Função para sanitizar nome do arquivo
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Remove caracteres especiais
    .replace(/_{2,}/g, "_") // Remove underscores múltiplos
    .toLowerCase();
}

// Função para gerar hash do arquivo (detecção de duplicatas)
function generateFileHash(buffer: Buffer): string {
  return crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex")
    .substring(0, 16);
}

// Função para processar e otimizar imagens
export async function processImage(
  inputPath: string,
  outputPath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
) {
  const { width = 800, height = 600, quality = 80 } = options;

  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality })
      .toFile(outputPath);

    // Remove arquivo original se diferente do otimizado
    if (inputPath !== outputPath) {
      await fs.unlink(inputPath);
    }

    return outputPath;
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    throw new Error("Falha no processamento da imagem");
  }
}

// Função para deletar arquivo
export async function deleteFile(filePath: string) {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return false;
  }
}

// Função para validar arquivo de upload com segurança extra
export async function validateAndSaveFile(
  file: File,
  subfolder: string = "reviews"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("🔍 validateAndSaveFile - Starting validation:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      subfolder
    });

    // Validação de tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log("❌ File type not allowed:", file.type);
      return {
        success: false,
        error: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.",
      };
    }

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      console.log("❌ File too large:", file.size);
      return {
        success: false,
        error: "Arquivo muito grande. Tamanho máximo: 5MB.",
      };
    }

    // Validação de nome do arquivo
    if (!file.name || file.name.length > 255) {
      console.log("❌ Invalid filename:", file.name);
      return {
        success: false,
        error: "Nome do arquivo inválido.",
      };
    }

    console.log("🔄 Converting File to Buffer...");
    
    // Converter File para Buffer - com tratamento de erro específico
    let bytes, buffer;
    try {
      bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      console.log("✅ Buffer created successfully, size:", buffer.length);
    } catch (bufferError) {
      console.error("❌ Buffer conversion error:", bufferError);
      return {
        success: false,
        error: "Erro ao processar arquivo.",
      };
    }

    console.log("🔍 Verifying file signature...");
    
    // Verificar assinatura do arquivo (magic numbers)
    try {
      const isValidSignature = await verifyFileSignature(buffer, file.type);
      if (!isValidSignature) {
        console.log("❌ Invalid file signature for type:", file.type);
        return {
          success: false,
          error: "Arquivo corrompido ou tipo inválido.",
        };
      }
      console.log("✅ File signature valid");
    } catch (signatureError) {
      console.error("❌ File signature verification error:", signatureError);
      return {
        success: false,
        error: "Erro na verificação do arquivo.",
      };
    }

    console.log("🖼️ Validating image with Sharp...");
    
    // Verificar se é uma imagem válida usando Sharp
    try {
      const metadata = await sharp(buffer).metadata();
      console.log("✅ Sharp metadata:", metadata);

      // Validar dimensões mínimas e máximas
      if (!metadata.width || !metadata.height) {
        console.log("❌ No image dimensions found");
        return {
          success: false,
          error: "Imagem inválida.",
        };
      }

      if (metadata.width < 100 || metadata.height < 100) {
        console.log("❌ Image too small:", { width: metadata.width, height: metadata.height });
        return {
          success: false,
          error: "Imagem muito pequena. Mínimo: 100x100 pixels.",
        };
      }

      if (metadata.width > 4000 || metadata.height > 4000) {
        console.log("❌ Image too large:", { width: metadata.width, height: metadata.height });
        return {
          success: false,
          error: "Imagem muito grande. Máximo: 4000x4000 pixels.",
        };
      }
    } catch (sharpError) {
      console.error("❌ Sharp validation error:", sharpError);
      return {
        success: false,
        error: "Arquivo não é uma imagem válida.",
      };
    }

    console.log("📁 Creating upload directory...");
    
    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), "public/uploads", subfolder);
    try {
      await fs.access(uploadDir);
      console.log("✅ Upload directory exists");
    } catch {
      console.log("📁 Creating upload directory:", uploadDir);
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único e seguro
    const fileHash = generateFileHash(buffer);
    const sanitizedName = sanitizeFilename(file.name);
    const ext = path.extname(sanitizedName) || ".jpg";
    
    // Usar prefixo específico baseado na subpasta
    const prefix = subfolder === "profile" ? "profile" : "review";
    const filename = `${prefix}-${fileHash}-${nanoid(8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    console.log("🔍 Checking for duplicates...");
    
    // Verificar se arquivo já existe (baseado em hash)
    try {
      const files = await fs.readdir(uploadDir);
      const duplicate = files.find((f) => f.includes(fileHash));
      if (duplicate) {
        console.log("✅ Duplicate found, returning existing:", duplicate);
        return {
          success: true,
          url: `/uploads/${subfolder}/${duplicate}`,
        };
      }
    } catch (error) {
      console.log("⚠️ Could not check for duplicates:", error.message);
      // Continuar se não conseguir verificar duplicatas
    }

    console.log("🖼️ Processing and saving image...");
    
    // Processar e salvar imagem com otimização - com tratamento de erro específico
    try {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.",
      };
    }

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Arquivo muito grande. Tamanho máximo: 5MB.",
      };
    }

    // Validação de nome do arquivo
    if (!file.name || file.name.length > 255) {
      return {
        success: false,
        error: "Nome do arquivo inválido.",
      };
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verificar assinatura do arquivo (magic numbers)
    const isValidSignature = await verifyFileSignature(buffer, file.type);
    if (!isValidSignature) {
      return {
        success: false,
        error: "Arquivo corrompido ou tipo inválido.",
      };
    }

    // Verificar se é uma imagem válida usando Sharp
    try {
      const metadata = await sharp(buffer).metadata();

      // Validar dimensões mínimas e máximas
      if (!metadata.width || !metadata.height) {
        return {
          success: false,
          error: "Imagem inválida.",
        };
      }

      if (metadata.width < 100 || metadata.height < 100) {
        return {
          success: false,
          error: "Imagem muito pequena. Mínimo: 100x100 pixels.",
        };
      }

      if (metadata.width > 4000 || metadata.height > 4000) {
        return {
          success: false,
          error: "Imagem muito grande. Máximo: 4000x4000 pixels.",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Arquivo não é uma imagem válida.",
      };
    }

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), "public/uploads", subfolder);
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único e seguro
    const fileHash = generateFileHash(buffer);
    const sanitizedName = sanitizeFilename(file.name);
    const ext = path.extname(sanitizedName) || ".jpg";
    
    // Usar prefixo específico baseado na subpasta
    const prefix = subfolder === "profile" ? "profile" : "review";
    const filename = `${prefix}-${fileHash}-${nanoid(8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Verificar se arquivo já existe (baseado em hash)
    const existingFile = path.join(uploadDir, `*${fileHash}*`);
    try {
      const files = await fs.readdir(uploadDir);
      const duplicate = files.find((f) => f.includes(fileHash));
      if (duplicate) {
        return {
          success: true,
          url: `/uploads/${subfolder}/${duplicate}`,
        };
      }
    } catch (error) {
      // Continuar se não conseguir verificar duplicatas
    }

    // Processar e salvar imagem com otimização - com tratamento de erro específico
    try {
      await sharp(buffer)
        .resize(1200, 900, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toFile(filePath);
      
      console.log("✅ Image processed and saved successfully");
    } catch (sharpProcessingError) {
      console.error("❌ Sharp processing error:", sharpProcessingError);
      return {
        success: false,
        error: "Erro ao processar imagem.",
      };
    }

    // Retornar URL relativa
    const url = `/uploads/${subfolder}/${filename}`;
    console.log("🎉 Upload completed successfully:", url);

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("💥 validateAndSaveFile - Unexpected error:", error);
    return {
      success: false,
      error: "Erro interno do servidor.",
    };
  }
}

// Validação de segurança adicional
export function validateImageFile(file: File): boolean {
  // Verifica extensão do arquivo
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const fileExtension = path.extname(file.name).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return false;
  }

  // Verifica tamanho
  if (file.size > MAX_FILE_SIZE) {
    return false;
  }

  // Verifica tipo MIME
  if (!ALLOWED_TYPES.includes(file.type)) {
    return false;
  }

  return true;
}

// Tipos de resposta
export interface UploadResponse {
  success: boolean;
  files?: {
    filename: string;
    path: string;
    size: number;
    url: string;
  }[];
  error?: string;
}

// Função para processar múltiplos arquivos
export async function validateAndSaveMultipleFiles(
  files: File[],
  subfolder: string = "reviews"
): Promise<UploadResponse> {
  try {
    console.log("📋 validateAndSaveMultipleFiles - Starting:", {
      fileCount: files.length,
      subfolder,
      maxFiles: MAX_FILES
    });

    if (files.length > MAX_FILES) {
      console.log("❌ Too many files:", files.length);
      return {
        success: false,
        error: `Máximo de ${MAX_FILES} arquivos permitidos.`,
      };
    }

    console.log("🔄 Processing files individually...");
    
    const results = await Promise.all(
      files.map(async (file, index) => {
        console.log(`📄 Processing file ${index + 1}/${files.length}:`, file.name);
        const result = await validateAndSaveFile(file, subfolder);
        console.log(`${result.success ? '✅' : '❌'} File ${index + 1} result:`, result);
        return result;
      })
    );

    const failedFiles = results.filter((result) => !result.success);

    if (failedFiles.length > 0) {
      console.log("❌ Some files failed:", failedFiles);
      return {
        success: false,
        error: failedFiles[0].error || "Erro ao processar arquivos.",
      };
    }

    const uploadedFiles = results.map((result, index) => ({
      filename: path.basename(result.url || ""),
      path: result.url || "",
      size: files[index].size,
      url: result.url || "",
    }));

    console.log("🎉 All files processed successfully:", uploadedFiles);

    return {
      success: true,
      files: uploadedFiles,
    };
  } catch (error) {
    console.error("💥 validateAndSaveMultipleFiles - Error:", error);
    return {
      success: false,
      error: "Erro interno do servidor.",
    };
  }
}
