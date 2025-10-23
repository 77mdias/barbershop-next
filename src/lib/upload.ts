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
  "image/png": ["89504e47"], // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  "image/webp": ["52494646"],
};

// Função para verificar assinatura do arquivo
async function verifyFileSignature(
  buffer: Buffer,
  mimeType: string
): Promise<boolean> {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) {
    console.log(`❌ No signatures found for MIME type: ${mimeType}`);
    return false;
  }

  // Pegar mais bytes para garantir melhor detecção
  const fileHeader = buffer.slice(0, 12).toString("hex");
  console.log(`🔍 File signature check:`, {
    mimeType,
    expectedSignatures: signatures,
    actualHeader: fileHeader,
    bufferLength: buffer.length
  });

  const isValid = signatures.some((sig) => fileHeader.toLowerCase().startsWith(sig.toLowerCase()));
  console.log(`📋 Signature validation result: ${isValid}`);
  
  return isValid;
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
    console.log(`🔍 Starting file validation for: ${file.name}`);
    
    // Validação de tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log(`❌ File type not allowed: ${file.type}`);
      return {
        success: false,
        error: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.",
      };
    }
    console.log(`✅ File type valid: ${file.type}`);

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      console.log(`❌ File too large: ${file.size} bytes`);
      return {
        success: false,
        error: "Arquivo muito grande. Tamanho máximo: 5MB.",
      };
    }
    console.log(`✅ File size valid: ${file.size} bytes`);

    // Validação de nome do arquivo
    if (!file.name || file.name.length > 255) {
      console.log(`❌ Invalid filename: ${file.name}`);
      return {
        success: false,
        error: "Nome do arquivo inválido.",
      };
    }
    console.log(`✅ Filename valid: ${file.name}`);

    // Converter File para Buffer
    console.log(`🔄 Converting file to buffer...`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`✅ Buffer created, size: ${buffer.length} bytes`);

    // Verificar se é uma imagem válida usando Sharp (validação mais confiável)
    console.log(`🔍 Validating image with Sharp...`);
    let sharpValidation = false;
    let imageMetadata = null;
    
    try {
      imageMetadata = await sharp(buffer).metadata();
      console.log(`📋 Image metadata:`, {
        width: imageMetadata.width,
        height: imageMetadata.height,
        format: imageMetadata.format,
        channels: imageMetadata.channels
      });

      // Validar dimensões mínimas e máximas
      if (!imageMetadata.width || !imageMetadata.height) {
        console.log(`❌ Invalid image dimensions`);
        return {
          success: false,
          error: "Imagem inválida.",
        };
      }

      if (imageMetadata.width < 100 || imageMetadata.height < 100) {
        console.log(`❌ Image too small: ${imageMetadata.width}x${imageMetadata.height}`);
        return {
          success: false,
          error: "Imagem muito pequena. Mínimo: 100x100 pixels.",
        };
      }

      if (imageMetadata.width > 4000 || imageMetadata.height > 4000) {
        console.log(`❌ Image too large: ${imageMetadata.width}x${imageMetadata.height}`);
        return {
          success: false,
          error: "Imagem muito grande. Máximo: 4000x4000 pixels.",
        };
      }
      
      console.log(`✅ Image dimensions valid: ${imageMetadata.width}x${imageMetadata.height}`);
      sharpValidation = true;
    } catch (error) {
      console.log(`❌ Sharp validation failed:`, error);
      return {
        success: false,
        error: "Arquivo não é uma imagem válida.",
      };
    }

    // Verificar assinatura do arquivo (magic numbers) - como validação secundária
    console.log(`🔍 Verifying file signature...`);
    const isValidSignature = await verifyFileSignature(buffer, file.type);
    
    // Se Sharp validou mas signature falhou, log para análise mas continue (Sharp é mais confiável)
    if (!isValidSignature) {
      console.log(`⚠️ File signature validation failed, but Sharp validation passed. Continuing...`);
      console.log(`📋 File info for analysis:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        sharpFormat: imageMetadata?.format
      });
    } else {
      console.log(`✅ File signature valid`);
    }

    // Priorizar validação do Sharp sobre magic numbers
    if (!sharpValidation) {
      console.log(`❌ Primary validation (Sharp) failed`);
      return {
        success: false,
        error: "Arquivo corrompido ou tipo inválido.",
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

    // Processar e salvar imagem com otimização
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

    // Retornar URL relativa
    const url = `/uploads/${subfolder}/${filename}`;

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("Erro ao processar upload:", error);
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
    if (files.length > MAX_FILES) {
      return {
        success: false,
        error: `Máximo de ${MAX_FILES} arquivos permitidos.`,
      };
    }

    const results = await Promise.all(
      files.map((file) => validateAndSaveFile(file, subfolder))
    );

    const failedFiles = results.filter((result) => !result.success);

    if (failedFiles.length > 0) {
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

    return {
      success: true,
      files: uploadedFiles,
    };
  } catch (error) {
    console.error("Erro ao processar múltiplos uploads:", error);
    return {
      success: false,
      error: "Erro interno do servidor.",
    };
  }
}
