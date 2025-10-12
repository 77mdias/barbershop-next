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
    // Validação de tipo
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
    const filename = `review-${fileHash}-${nanoid(8)}${ext}`;
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
