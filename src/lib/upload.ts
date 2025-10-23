import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import crypto from "crypto";

// Detectar ambiente
const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const isReadOnlyFS = isProd || isVercel;

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

// Função para verificar assinatura do arquivo (versão mobile-friendly)
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

  // Para PNG, verificar múltiplas variações (mobile pode ter headers diferentes)
  if (mimeType === "image/png") {
    const pngHeaders = ["89504e47", "89504e470d0a1a0a"];
    const isValidPng = pngHeaders.some((header) => 
      fileHeader.toLowerCase().startsWith(header.toLowerCase())
    );
    console.log(`📋 PNG signature validation result: ${isValidPng}`);
    return isValidPng;
  }

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

// Função para upload em ambiente read-only (produção)
export async function uploadToMemoryStorage(
  file: File,
  subfolder: string = "reviews"
): Promise<{ success: boolean; url?: string; error?: string; base64?: string }> {
  try {
    console.log(`☁️ Production upload for: ${file.name}`);
    
    // Validações básicas
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Arquivo muito grande. Tamanho máximo: 5MB.",
      };
    }

    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: "Arquivo deve ser uma imagem.",
      };
    }

    // Converter para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return {
        success: false,
        error: "Arquivo vazio.",
      };
    }

    // Validar com Sharp
    let metadata = null;
    let processedBuffer = null;
    
    try {
      metadata = await sharp(buffer).metadata();
      
      // Processar e otimizar imagem
      processedBuffer = await sharp(buffer)
        .resize(1200, 900, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toBuffer();
        
      console.log(`✅ Image processed: ${metadata.width}x${metadata.height}`);
      
    } catch (error) {
      console.log(`❌ Cannot process image:`, error);
      return {
        success: false,
        error: "Imagem não pode ser processada.",
      };
    }

    // Em produção, converter para base64 e retornar data URL
    const base64 = processedBuffer.toString('base64');
    const mimeType = `image/${metadata.format || 'jpeg'}`;
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    // Simular URL para compatibilidade
    const fileHash = generateFileHash(processedBuffer);
    const timestamp = Date.now();
    const virtualUrl = `/uploads/${subfolder}/prod-${timestamp}-${fileHash.substring(0, 8)}.${metadata.format || 'jpg'}`;
    
    console.log(`✅ Production upload successful (base64): ${virtualUrl}`);

    return {
      success: true,
      url: virtualUrl,
      base64: dataUrl, // Para uso direto em <img src={base64} />
    };
    
  } catch (error) {
    console.error("🚨 Production upload error:", error);
    return {
      success: false,
      error: "Erro no upload de produção.",
    };
  }
}
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

// Função para validar arquivo de upload com segurança extra (mobile-friendly)
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

    // Verificar se é uma imagem válida usando Sharp (validação principal)
    console.log(`🔍 Validating image with Sharp...`);
    let imageMetadata = null;
    
    try {
      imageMetadata = await sharp(buffer).metadata();
      console.log(`📋 Image metadata:`, {
        width: imageMetadata.width,
        height: imageMetadata.height,
        format: imageMetadata.format,
        channels: imageMetadata.channels,
        hasProfile: imageMetadata.hasProfile,
        hasAlpha: imageMetadata.hasAlpha
      });

      // Validar se é realmente uma imagem
      if (!imageMetadata.width || !imageMetadata.height || !imageMetadata.format) {
        console.log(`❌ Invalid image - missing metadata`);
        return {
          success: false,
          error: "Arquivo não é uma imagem válida.",
        };
      }

      // Validar dimensões mínimas e máximas
      if (imageMetadata.width < 50 || imageMetadata.height < 50) {
        console.log(`❌ Image too small: ${imageMetadata.width}x${imageMetadata.height}`);
        return {
          success: false,
          error: "Imagem muito pequena. Mínimo: 50x50 pixels.",
        };
      }

      if (imageMetadata.width > 8000 || imageMetadata.height > 8000) {
        console.log(`❌ Image too large: ${imageMetadata.width}x${imageMetadata.height}`);
        return {
          success: false,
          error: "Imagem muito grande. Máximo: 8000x8000 pixels.",
        };
      }

      // Validar formatos suportados pelo Sharp
      const supportedFormats = ["jpeg", "jpg", "png", "webp"];
      if (!supportedFormats.includes(imageMetadata.format?.toLowerCase() || "")) {
        console.log(`❌ Unsupported format: ${imageMetadata.format}`);
        return {
          success: false,
          error: "Formato de imagem não suportado.",
        };
      }
      
      console.log(`✅ Image validation passed: ${imageMetadata.width}x${imageMetadata.height}, format: ${imageMetadata.format}`);
      
    } catch (sharpError) {
      console.log(`❌ Sharp validation failed:`, sharpError);
      return {
        success: false,
        error: "Arquivo não é uma imagem válida ou está corrompido.",
      };
    }

    // Validação adicional (menos restritiva para mobile)
    console.log(`🔍 Running additional validations...`);
    
    // Verificar se o buffer não está vazio
    if (buffer.length === 0) {
      console.log(`❌ Empty buffer`);
      return {
        success: false,
        error: "Arquivo vazio.",
      };
    }

    // Para mobile, pular verificação de magic numbers se Sharp passou
    console.log(`✅ All validations passed, proceeding with upload...`);

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), "public/uploads", subfolder);
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
      console.log(`📁 Created upload directory: ${uploadDir}`);
    }

    // Gerar nome único e seguro
    const fileHash = generateFileHash(buffer);
    const sanitizedName = sanitizeFilename(file.name);
    const ext = path.extname(sanitizedName) || `.${imageMetadata.format}`;
    
    // Usar prefixo específico baseado na subpasta
    const prefix = subfolder === "profile" ? "profile" : "review";
    const filename = `${prefix}-${fileHash}-${nanoid(8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    console.log(`📝 Generated filename: ${filename}`);

    // Verificar se arquivo já existe (baseado em hash)
    try {
      const files = await fs.readdir(uploadDir);
      const duplicate = files.find((f) => f.includes(fileHash));
      if (duplicate) {
        console.log(`♻️ Duplicate file found, returning existing: ${duplicate}`);
        return {
          success: true,
          url: `/uploads/${subfolder}/${duplicate}`,
        };
      }
    } catch (error) {
      console.log(`⚠️ Could not check for duplicates:`, error);
      // Continuar se não conseguir verificar duplicatas
    }

    // Processar e salvar imagem com otimização
    console.log(`🎨 Processing and saving image...`);
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

    console.log(`✅ Image saved successfully: ${filePath}`);

    // Retornar URL relativa
    const url = `/uploads/${subfolder}/${filename}`;

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("🚨 Erro ao processar upload:", error);
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

// Tipos de resposta (atualizado para suportar base64)
export interface UploadResponse {
  success: boolean;
  files?: {
    filename: string;
    path: string;
    size: number;
    url: string;
    base64?: string; // Para produção
  }[];
  error?: string;
}

// Função alternativa para upload mobile (mais permissiva)
export async function validateAndSaveFileMobile(
  file: File,
  subfolder: string = "reviews"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log(`📱 Mobile upload for: ${file.name}`);
    
    // Validações básicas apenas
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Arquivo muito grande. Tamanho máximo: 5MB.",
      };
    }

    if (!file.name || file.name.length > 255) {
      return {
        success: false,
        error: "Nome do arquivo inválido.",
      };
    }

    // Verificar se é imagem através do tipo MIME apenas
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: "Arquivo deve ser uma imagem.",
      };
    }

    // Converter para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return {
        success: false,
        error: "Arquivo vazio.",
      };
    }

    // Usar Sharp apenas para verificar se consegue processar
    let canProcess = false;
    let metadata = null;
    
    try {
      // Tentar processar a imagem para ver se é válida
      const processed = await sharp(buffer)
        .resize(300, 300, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      if (processed.length > 0) {
        canProcess = true;
        metadata = await sharp(buffer).metadata();
      }
    } catch (error) {
      console.log(`❌ Cannot process image:`, error);
      return {
        success: false,
        error: "Imagem não pode ser processada.",
      };
    }

    if (!canProcess) {
      return {
        success: false,
        error: "Formato de imagem não suportado.",
      };
    }

    // Criar diretório
    const uploadDir = path.join(process.cwd(), "public/uploads", subfolder);
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome do arquivo
    const fileHash = generateFileHash(buffer);
    const timestamp = Date.now();
    const ext = metadata?.format ? `.${metadata.format}` : '.jpg';
    const filename = `mobile-${timestamp}-${fileHash.substring(0, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Verificar duplicatas
    try {
      const files = await fs.readdir(uploadDir);
      const duplicate = files.find((f) => f.includes(fileHash.substring(0, 8)));
      if (duplicate) {
        return {
          success: true,
          url: `/uploads/${subfolder}/${duplicate}`,
        };
      }
    } catch (error) {
      // Ignorar erro de duplicatas
    }

    // Salvar imagem otimizada
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

    const url = `/uploads/${subfolder}/${filename}`;
    console.log(`✅ Mobile upload successful: ${url}`);

    return {
      success: true,
      url,
    };
    
  } catch (error) {
    console.error("🚨 Mobile upload error:", error);
    return {
      success: false,
      error: "Erro no upload mobile.",
    };
  }
}

// Função inteligente que detecta ambiente e usa estratégia apropriada
export async function smartUpload(
  file: File,
  subfolder: string = "reviews",
  userAgent?: string
): Promise<{ success: boolean; url?: string; error?: string; base64?: string }> {
  console.log(`🎯 Smart upload - Environment: ${isReadOnlyFS ? 'PRODUCTION (read-only)' : 'DEVELOPMENT'}`);
  
  // Em produção com filesystem read-only, usar storage em memória
  if (isReadOnlyFS) {
    console.log(`☁️ Using production upload strategy (memory/base64)`);
    return await uploadToMemoryStorage(file, subfolder);
  }
  
  // Em desenvolvimento, detectar mobile e usar função apropriada
  const isMobile = userAgent ? 
    /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) :
    false;
  
  console.log(`🖥️ Using development upload - Device: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
  
  if (isMobile) {
    // Usar função mais permissiva para mobile
    return await validateAndSaveFileMobile(file, subfolder);
  } else {
    // Usar função original para desktop
    return await validateAndSaveFile(file, subfolder);
  }
}

// Função para processar múltiplos arquivos (atualizada para usar smart upload)
export async function validateAndSaveMultipleFiles(
  files: File[],
  subfolder: string = "reviews",
  userAgent?: string
): Promise<UploadResponse> {
  try {
    if (files.length > MAX_FILES) {
      return {
        success: false,
        error: `Máximo de ${MAX_FILES} arquivos permitidos.`,
      };
    }

    const results = await Promise.all(
      files.map((file) => smartUpload(file, subfolder, userAgent))
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
      base64: result.base64, // Include base64 for production
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
