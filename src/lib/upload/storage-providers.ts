/**
 * 🌐 Production Storage Configuration
 * 
 * Configurações para diferentes provedores de storage em produção.
 * Suporta AWS S3, Cloudinary, Google Cloud Storage, Azure, etc.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

// ===== STORAGE PROVIDERS =====
export type StorageProvider = 'local' | 's3' | 'cloudinary' | 'gcs' | 'azure';

// ===== ENVIRONMENT CONFIGURATION =====
export const STORAGE_ENVIRONMENT = {
  // Determinar provider baseado em variáveis de ambiente
  provider: (process.env.STORAGE_PROVIDER as StorageProvider) || 'local',
  
  // URLs base para different providers
  baseUrl: process.env.STORAGE_BASE_URL || '',
  
  // Configurações específicas do ambiente
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: process.env.VERCEL === '1',
  
  // CDN configuration
  cdnUrl: process.env.CDN_URL || '',
  
} as const;

// ===== AWS S3 CONFIGURATION =====
export const S3_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET || '',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  
  // S3 specific settings
  acl: 'public-read' as const,
  signedUrlExpires: 3600, // 1 hour
  
  // CloudFront CDN
  cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL || '',
} as const;

// ===== CLOUDINARY CONFIGURATION =====
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  
  // Upload presets
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'barbershop-uploads',
  
  // Transformation settings
  transformations: {
    profile: 'w_400,h_400,c_fill,f_auto,q_auto',
    review: 'w_800,h_600,c_fit,f_auto,q_auto',
    thumbnail: 'w_150,h_150,c_fill,f_auto,q_auto'
  }
} as const;

// ===== GOOGLE CLOUD STORAGE CONFIGURATION =====
export const GCS_CONFIG = {
  projectId: process.env.GCP_PROJECT_ID || '',
  keyFilename: process.env.GCP_KEY_FILE || '',
  bucket: process.env.GCS_BUCKET || '',
  
  // GCS specific settings
  public: true,
  resumable: false,
} as const;

// ===== AZURE BLOB STORAGE CONFIGURATION =====
export const AZURE_CONFIG = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  containerName: process.env.AZURE_CONTAINER_NAME || 'uploads',
  
  // Azure specific settings
  blobHTTPHeaders: {
    blobCacheControl: 'public, max-age=31536000', // 1 year
  }
} as const;

// ===== PROVIDER VALIDATION =====
export function validateStorageConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const provider = STORAGE_ENVIRONMENT.provider;
  
  switch (provider) {
    case 's3':
      if (!S3_CONFIG.bucket) errors.push('AWS_S3_BUCKET is required');
      if (!S3_CONFIG.accessKeyId) errors.push('AWS_ACCESS_KEY_ID is required');
      if (!S3_CONFIG.secretAccessKey) errors.push('AWS_SECRET_ACCESS_KEY is required');
      break;
      
    case 'cloudinary':
      if (!CLOUDINARY_CONFIG.cloudName) errors.push('CLOUDINARY_CLOUD_NAME is required');
      if (!CLOUDINARY_CONFIG.apiKey) errors.push('CLOUDINARY_API_KEY is required');
      if (!CLOUDINARY_CONFIG.apiSecret) errors.push('CLOUDINARY_API_SECRET is required');
      break;
      
    case 'gcs':
      if (!GCS_CONFIG.projectId) errors.push('GCP_PROJECT_ID is required');
      if (!GCS_CONFIG.bucket) errors.push('GCS_BUCKET is required');
      break;
      
    case 'azure':
      if (!AZURE_CONFIG.connectionString) errors.push('AZURE_STORAGE_CONNECTION_STRING is required');
      break;
      
    case 'local':
      // Local storage sempre válido para desenvolvimento
      break;
      
    default:
      errors.push(`Unknown storage provider: ${provider}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ===== PROVIDER INFO =====
export function getStorageProviderInfo() {
  const provider = STORAGE_ENVIRONMENT.provider;
  const validation = validateStorageConfig();
  
  return {
    provider,
    isConfigured: validation.isValid,
    errors: validation.errors,
    baseUrl: getBaseUrlForProvider(provider),
    features: getProviderFeatures(provider)
  };
}

function getBaseUrlForProvider(provider: StorageProvider): string {
  switch (provider) {
    case 's3':
      return S3_CONFIG.cloudFrontUrl || `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com`;
    case 'cloudinary':
      return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    case 'gcs':
      return `https://storage.googleapis.com/${GCS_CONFIG.bucket}`;
    case 'azure':
      return `https://${AZURE_CONFIG.containerName}.blob.core.windows.net/${AZURE_CONFIG.containerName}`;
    case 'local':
    default:
      return STORAGE_ENVIRONMENT.baseUrl || '';
  }
}

function getProviderFeatures(provider: StorageProvider) {
  const features = {
    cdn: false,
    imageProcessing: false,
    backup: false,
    scalable: false,
    cost: 'free' as 'free' | 'low' | 'medium' | 'high'
  };
  
  switch (provider) {
    case 's3':
      return { ...features, cdn: true, backup: true, scalable: true, cost: 'low' as const };
    case 'cloudinary':
      return { ...features, cdn: true, imageProcessing: true, backup: true, scalable: true, cost: 'medium' as const };
    case 'gcs':
      return { ...features, cdn: true, backup: true, scalable: true, cost: 'low' as const };
    case 'azure':
      return { ...features, cdn: true, backup: true, scalable: true, cost: 'low' as const };
    case 'local':
    default:
      return features;
  }
}