/**
 * 🌐 Production Storage Manager
 * 
 * Gerenciador de storage para produção com múltiplos providers.
 * Facilita a migração entre diferentes serviços de storage.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

import { 
  createStorageAdapter, 
  MultiProviderStorage,
  type StorageAdapter,
  type StorageResult 
} from './storage-adapters';
import { 
  STORAGE_ENVIRONMENT, 
  getStorageProviderInfo,
  validateStorageConfig,
  type StorageProvider 
} from './storage-providers';
import { UPLOAD_CONFIG } from './config';

// ===== PRODUCTION STORAGE MANAGER =====
export class ProductionStorageManager {
  private adapter: StorageAdapter;
  private multiAdapter: MultiProviderStorage;
  private isInitialized = false;
  
  constructor() {
    this.adapter = createStorageAdapter();
    this.multiAdapter = new MultiProviderStorage();
  }
  
  /**
   * 🚀 Inicializar storage para produção
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing production storage...');
    
    // Validar configuração
    const validation = validateStorageConfig();
    
    if (!validation.isValid) {
      console.warn('⚠️ Storage configuration issues:', validation.errors);
      
      if (STORAGE_ENVIRONMENT.provider !== 'local') {
        console.warn(`🔄 Falling back to local storage due to configuration issues`);
      }
    }
    
    // Health check
    const health = await this.adapter.healthCheck();
    
    if (!health) {
      console.error(`❌ Storage provider ${STORAGE_ENVIRONMENT.provider} is not healthy`);
      throw new Error(`Storage provider ${STORAGE_ENVIRONMENT.provider} failed health check`);
    }
    
    console.log(`✅ Storage provider ${STORAGE_ENVIRONMENT.provider} initialized successfully`);
    this.isInitialized = true;
  }
  
  /**
   * 📁 Upload de arquivo para produção
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: 'profiles' | 'reviews' | 'temp',
    options: {
      userId?: string;
      useMultiProvider?: boolean;
      retries?: number;
    } = {}
  ): Promise<{
    success: boolean;
    url?: string;
    publicUrl?: string;
    filename?: string;
    provider?: string;
    error?: string;
  }> {
    await this.initialize();
    
    try {
      // Validar tamanho
      if (buffer.length > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }
      
      // Gerar nome único
      const filename = this.generateFilename(originalName, options.userId);
      
      // Escolher adapter
      const storageAdapter = options.useMultiProvider ? this.multiAdapter : this.adapter;
      
      // Upload com retry
      const retries = options.retries || 2;
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await storageAdapter.upload(buffer, filename, folder);
          
          console.log(`✅ File uploaded successfully: ${result.publicUrl} (provider: ${result.provider})`);
          
          return {
            success: true,
            url: result.url,
            publicUrl: result.publicUrl,
            filename,
            provider: result.provider
          };
          
        } catch (error) {
          lastError = error as Error;
          console.warn(`⚠️ Upload attempt ${attempt + 1} failed:`, error);
          
          if (attempt < retries) {
            console.log(`🔄 Retrying upload (${attempt + 1}/${retries})...`);
            await this.delay(1000 * (attempt + 1)); // Exponential backoff
          }
        }
      }
      
      throw lastError || new Error('Upload failed after retries');
      
    } catch (error) {
      console.error('❌ Production upload error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }
  
  /**
   * 🗑️ Deletar arquivo
   */
  async deleteFile(url: string): Promise<boolean> {
    await this.initialize();
    
    try {
      const result = await this.adapter.delete(url);
      
      if (result) {
        console.log(`🗑️ File deleted successfully: ${url}`);
      } else {
        console.warn(`⚠️ Failed to delete file: ${url}`);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      return false;
    }
  }
  
  /**
   * 📊 Status do storage
   */
  async getStatus(): Promise<{
    provider: string;
    isHealthy: boolean;
    configuration: any;
    validation: any;
    environment: any;
  }> {
    const health = await this.adapter.healthCheck();
    const providerInfo = getStorageProviderInfo();
    const validation = validateStorageConfig();
    
    return {
      provider: STORAGE_ENVIRONMENT.provider,
      isHealthy: health,
      configuration: providerInfo,
      validation,
      environment: {
        isProduction: STORAGE_ENVIRONMENT.isProduction,
        isVercel: STORAGE_ENVIRONMENT.isVercel,
        baseUrl: STORAGE_ENVIRONMENT.baseUrl,
        cdnUrl: STORAGE_ENVIRONMENT.cdnUrl
      }
    };
  }
  
  /**
   * 🔄 Migrar para outro provider
   */
  async migrateFiles(
    targetProvider: StorageProvider,
    folder: string,
    fileUrls: string[]
  ): Promise<{
    success: number;
    failed: number;
    results: Array<{ url: string; success: boolean; newUrl?: string; error?: string; }>
  }> {
    console.log(`🔄 Starting migration to ${targetProvider} for ${fileUrls.length} files...`);
    
    const targetAdapter = createStorageAdapter(targetProvider);
    const results: Array<{ url: string; success: boolean; newUrl?: string; error?: string; }> = [];
    
    for (const url of fileUrls) {
      try {
        // Este seria o processo de migração real
        // 1. Download do arquivo atual
        // 2. Upload para o novo provider
        // 3. Verificação
        // 4. Atualização do banco de dados
        
        console.log(`📥 Migrating: ${url}`);
        
        // Placeholder para a implementação real
        results.push({
          url,
          success: false,
          error: 'Migration not implemented yet'
        });
        
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Migration completed: ${success} success, ${failed} failed`);
    
    return { success, failed, results };
  }
  
  // ===== HELPERS =====
  
  private generateFilename(originalName: string, userId?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = this.getFileExtension(originalName);
    const name = this.sanitizeFilename(originalName, ext);
    
    const userPrefix = userId ? `user${userId}-` : '';
    
    return `${userPrefix}${name}-${timestamp}-${random}${ext}`;
  }
  
  private sanitizeFilename(originalName: string, ext: string): string {
    return originalName
      .replace(ext, '') // Remove extension
      .toLowerCase()
      .normalize('NFD') // Remove accents
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]/g, '-') // Replace special chars with dash
      .replace(/-+/g, '-') // Replace multiple dashes with single
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .substring(0, 20); // Limit length
  }
  
  private getFileExtension(filename: string): string {
    return filename.toLowerCase().match(/\.[0-9a-z]+$/i)?.[0] || '';
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== SINGLETON FOR PRODUCTION =====
export const productionStorage = new ProductionStorageManager();

// ===== DEPLOYMENT HELPERS =====

/**
 * 🚀 Helper para setup inicial em produção
 */
export async function setupProductionStorage(): Promise<void> {
  console.log('🚀 Setting up production storage...');
  
  try {
    await productionStorage.initialize();
    const status = await productionStorage.getStatus();
    
    console.log('📊 Storage status:', {
      provider: status.provider,
      isHealthy: status.isHealthy,
      isProduction: status.environment.isProduction
    });
    
    if (!status.isHealthy) {
      throw new Error(`Storage provider ${status.provider} is not healthy`);
    }
    
    console.log('✅ Production storage setup completed successfully');
    
  } catch (error) {
    console.error('❌ Production storage setup failed:', error);
    throw error;
  }
}

/**
 * 🔧 Helper para verificar configuração
 */
export function checkProductionConfig(): {
  isValid: boolean;
  provider: string;
  issues: string[];
  recommendations: string[];
} {
  const validation = validateStorageConfig();
  const providerInfo = getStorageProviderInfo();
  
  const recommendations: string[] = [];
  
  // Recomendações baseadas no provider
  switch (STORAGE_ENVIRONMENT.provider) {
    case 'local':
      recommendations.push('⚠️ Local storage não é recomendado para produção');
      recommendations.push('💡 Considere usar AWS S3, Cloudinary ou Google Cloud Storage');
      break;
      
    case 's3':
      recommendations.push('✅ AWS S3 é uma excelente escolha para produção');
      if (!STORAGE_ENVIRONMENT.cdnUrl) {
        recommendations.push('💡 Configure CloudFront CDN para melhor performance');
      }
      break;
      
    case 'cloudinary':
      recommendations.push('✅ Cloudinary oferece otimização automática de imagens');
      recommendations.push('💡 Use transformações para diferentes tamanhos de imagem');
      break;
  }
  
  // Recomendações gerais
  if (!STORAGE_ENVIRONMENT.isProduction) {
    recommendations.push('⚠️ Certifique-se de configurar NODE_ENV=production');
  }
  
  return {
    isValid: validation.isValid,
    provider: providerInfo.provider,
    issues: validation.errors,
    recommendations
  };
}