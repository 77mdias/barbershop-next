/**
 * 📁 Upload System Configuration
 * 
 * Configuração centralizada do sistema de upload para o Barbershop Next.js
 * Suporta desenvolvimento local e produção (read-only filesystem).
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

// ===== ENVIRONMENT DETECTION =====
export const ENVIRONMENT = {
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: process.env.VERCEL === '1',
  isReadOnlyFS: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

// ===== UPLOAD LIMITS & VALIDATION =====
export const UPLOAD_CONFIG = {
  // File size limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PER_REQUEST: 5,
  
  // Allowed file types (MIME types)
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ],
  
  // Allowed file extensions
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  
  // Magic numbers for file validation (security)
  FILE_SIGNATURES: {
    'image/jpeg': ['ffd8ff'],
    'image/jpg': ['ffd8ff'],
    'image/png': ['89504e47'],
    'image/webp': ['52494646']
  }
} as const;

// ===== STORAGE PATHS =====
export const STORAGE_CONFIG = {
  // Base upload directory (local development)
  UPLOAD_BASE_DIR: 'public/uploads',
  
  // Subfolders for different upload types
  FOLDERS: {
    PROFILE: 'profile',
    REVIEWS: 'reviews'
  },
  
  // URL prefixes for serving files
  PUBLIC_URL_PREFIX: '/uploads'
} as const;

// ===== IMAGE PROCESSING SETTINGS =====
export const IMAGE_PROCESSING = {
  // Profile images
  PROFILE: {
    MAX_WIDTH: 400,
    MAX_HEIGHT: 400,
    QUALITY: 85,
    FORMAT: 'jpeg' as const
  },
  
  // Review images
  REVIEWS: {
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 900,
    QUALITY: 80,
    FORMAT: 'jpeg' as const
  }
} as const;

// ===== RATE LIMITING =====
export const RATE_LIMIT_CONFIG = {
  // Uploads per window
  MAX_UPLOADS_PER_WINDOW: 10,
  
  // Time window in milliseconds (1 hour)
  WINDOW_MS: 60 * 60 * 1000,
  
  // Block duration after limit exceeded (15 minutes)
  BLOCK_DURATION_MS: 15 * 60 * 1000,
  
  // Storage key prefix for rate limiting
  STORAGE_PREFIX: 'upload_rate_limit'
} as const;

// ===== ERROR MESSAGES =====
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `Arquivo muito grande. Tamanho máximo: ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
  INVALID_FILE_TYPE: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP',
  TOO_MANY_FILES: `Máximo de ${UPLOAD_CONFIG.MAX_FILES_PER_REQUEST} arquivos por upload`,
  FILE_CORRUPTED: 'Arquivo corrompido ou inválido',
  RATE_LIMIT_EXCEEDED: 'Muitos uploads. Tente novamente em alguns minutos',
  UPLOAD_FAILED: 'Erro no upload. Tente novamente',
  NO_FILE_PROVIDED: 'Nenhum arquivo fornecido',
  UNAUTHORIZED: 'Usuário não autorizado para upload'
} as const;

// ===== UPLOAD TYPES =====
export enum UploadType {
  PROFILE = 'profile',
  REVIEWS = 'reviews'
}

// ===== TYPE DEFINITIONS =====
export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
  
  // Production-specific fields
  base64?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
  };
}

export interface MultipleUploadResult {
  success: boolean;
  files?: UploadResult[];
  error?: string;
  totalFiles?: number;
  successfulFiles?: number;
}

export interface ProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get storage configuration based on environment
 */
export function getStorageConfig() {
  return {
    strategy: ENVIRONMENT.isReadOnlyFS ? 'memory' : 'filesystem',
    baseDir: STORAGE_CONFIG.UPLOAD_BASE_DIR,
    publicPrefix: STORAGE_CONFIG.PUBLIC_URL_PREFIX
  };
}

/**
 * Get processing options for upload type
 */
export function getProcessingOptions(uploadType: UploadType): ProcessingOptions {
  switch (uploadType) {
    case UploadType.PROFILE:
      return {
        width: IMAGE_PROCESSING.PROFILE.MAX_WIDTH,
        height: IMAGE_PROCESSING.PROFILE.MAX_HEIGHT,
        quality: IMAGE_PROCESSING.PROFILE.QUALITY,
        format: IMAGE_PROCESSING.PROFILE.FORMAT,
        fit: 'cover'
      };
      
    case UploadType.REVIEWS:
      return {
        width: IMAGE_PROCESSING.REVIEWS.MAX_WIDTH,
        height: IMAGE_PROCESSING.REVIEWS.MAX_HEIGHT,
        quality: IMAGE_PROCESSING.REVIEWS.QUALITY,
        format: IMAGE_PROCESSING.REVIEWS.FORMAT,
        fit: 'inside'
      };
      
    default:
      throw new Error(`Unknown upload type: ${uploadType}`);
  }
}

/**
 * Generate unique filename
 */
export function generateFilename(originalName: string, uploadType: UploadType): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  return `${uploadType}-${timestamp}-${random}.${extension}`;
}

/**
 * Get upload directory path
 */
export function getUploadDir(uploadType: UploadType): string {
  return `${STORAGE_CONFIG.UPLOAD_BASE_DIR}/${STORAGE_CONFIG.FOLDERS[uploadType.toUpperCase() as keyof typeof STORAGE_CONFIG.FOLDERS]}`;
}

/**
 * Get public URL for uploaded file
 */
export function getPublicUrl(filename: string, uploadType: UploadType): string {
  const folder = STORAGE_CONFIG.FOLDERS[uploadType.toUpperCase() as keyof typeof STORAGE_CONFIG.FOLDERS];
  return `/uploads/${folder}/${filename}`;
}