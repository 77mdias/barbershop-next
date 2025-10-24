/**
 * 🗂️ Storage Adapters
 * 
 * Implementações específicas para cada provider de storage.
 * Cada adapter segue a mesma interface para fácil troca.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

import fs from 'fs/promises';
import path from 'path';
import { 
  STORAGE_ENVIRONMENT, 
  S3_CONFIG, 
  CLOUDINARY_CONFIG, 
  GCS_CONFIG, 
  AZURE_CONFIG,
  type StorageProvider 
} from './storage-providers';

// ===== STORAGE INTERFACE =====
export interface StorageAdapter {
  upload(file: Buffer, filename: string, folder: string): Promise<StorageResult>;
  delete(url: string): Promise<boolean>;
  getPublicUrl(filename: string, folder: string): string;
  healthCheck(): Promise<boolean>;
}

export interface StorageResult {
  url: string;
  publicUrl: string;
  size: number;
  provider: StorageProvider;
}

// ===== LOCAL STORAGE ADAPTER =====
export class LocalStorageAdapter implements StorageAdapter {
  private basePath = path.join(process.cwd(), 'public', 'uploads');
  
  async upload(file: Buffer, filename: string, folder: string): Promise<StorageResult> {
    const folderPath = path.join(this.basePath, folder);
    await fs.mkdir(folderPath, { recursive: true });
    
    const filePath = path.join(folderPath, filename);
    await fs.writeFile(filePath, file);
    
    const url = `/uploads/${folder}/${filename}`;
    
    return {
      url,
      publicUrl: url,
      size: file.length,
      provider: 'local'
    };
  }
  
  async delete(url: string): Promise<boolean> {
    try {
      const filePath = path.join(process.cwd(), 'public', url);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  getPublicUrl(filename: string, folder: string): string {
    return `/uploads/${folder}/${filename}`;
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      await fs.access(this.basePath);
      return true;
    } catch {
      return false;
    }
  }
}

// ===== AWS S3 ADAPTER =====
export class S3StorageAdapter implements StorageAdapter {
  private s3Client: any;
  
  constructor() {
    // Lazy loading do AWS SDK para não quebrar se não estiver instalado
    this.initializeS3();
  }
  
  private async initializeS3() {
    try {
      const { S3Client, PutObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      this.s3Client = new S3Client({
        region: S3_CONFIG.region,
        credentials: {
          accessKeyId: S3_CONFIG.accessKeyId,
          secretAccessKey: S3_CONFIG.secretAccessKey,
        },
      });
    } catch (error) {
      console.warn('AWS SDK not available. Install @aws-sdk/client-s3 for S3 support.');
    }
  }
  
  async upload(file: Buffer, filename: string, folder: string): Promise<StorageResult> {
    if (!this.s3Client) {
      await this.initializeS3();
    }
    
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const key = `${folder}/${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Body: file,
      ACL: S3_CONFIG.acl,
      ContentType: this.getContentType(filename),
    });
    
    await this.s3Client.send(command);
    
    const url = `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
    const publicUrl = S3_CONFIG.cloudFrontUrl 
      ? `${S3_CONFIG.cloudFrontUrl}/${key}` 
      : url;
    
    return {
      url,
      publicUrl,
      size: file.length,
      provider: 's3'
    };
  }
  
  async delete(url: string): Promise<boolean> {
    try {
      if (!this.s3Client) {
        await this.initializeS3();
      }
      
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const key = this.extractKeyFromUrl(url);
      
      const command = new DeleteObjectCommand({
        Bucket: S3_CONFIG.bucket,
        Key: key,
      });
      
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
  
  getPublicUrl(filename: string, folder: string): string {
    const key = `${folder}/${filename}`;
    return S3_CONFIG.cloudFrontUrl 
      ? `${S3_CONFIG.cloudFrontUrl}/${key}`
      : `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.s3Client) {
        await this.initializeS3();
      }
      
      const { HeadBucketCommand } = await import('@aws-sdk/client-s3');
      const command = new HeadBucketCommand({ Bucket: S3_CONFIG.bucket });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
  
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
  
  private extractKeyFromUrl(url: string): string {
    // Extrair key da URL do S3 ou CloudFront
    if (url.includes('cloudfront.net')) {
      return url.split('.net/')[1];
    }
    if (url.includes('s3.')) {
      return url.split('.amazonaws.com/')[1];
    }
    return url;
  }
}

// ===== CLOUDINARY ADAPTER =====
export class CloudinaryStorageAdapter implements StorageAdapter {
  private cloudinary: any;
  
  constructor() {
    this.initializeCloudinary();
  }
  
  private async initializeCloudinary() {
    try {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({
        cloud_name: CLOUDINARY_CONFIG.cloudName,
        api_key: CLOUDINARY_CONFIG.apiKey,
        api_secret: CLOUDINARY_CONFIG.apiSecret,
      });
      this.cloudinary = cloudinary;
    } catch (error) {
      console.warn('Cloudinary SDK not available. Install cloudinary for Cloudinary support.');
    }
  }
  
  async upload(file: Buffer, filename: string, folder: string): Promise<StorageResult> {
    if (!this.cloudinary) {
      await this.initializeCloudinary();
    }
    
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: `barbershop/${folder}`,
          public_id: path.parse(filename).name,
          transformation: this.getTransformation(folder),
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicUrl: result.secure_url,
              size: result.bytes,
              provider: 'cloudinary'
            });
          }
        }
      );
      
      uploadStream.end(file);
    });
  }
  
  async delete(url: string): Promise<boolean> {
    try {
      if (!this.cloudinary) {
        await this.initializeCloudinary();
      }
      
      const publicId = this.extractPublicIdFromUrl(url);
      await this.cloudinary.uploader.destroy(publicId);
      return true;
    } catch {
      return false;
    }
  }
  
  getPublicUrl(filename: string, folder: string): string {
    const publicId = `barbershop/${folder}/${path.parse(filename).name}`;
    const transformation = this.getTransformation(folder);
    
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformation}/${publicId}`;
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.cloudinary) {
        await this.initializeCloudinary();
      }
      
      await this.cloudinary.api.ping();
      return true;
    } catch {
      return false;
    }
  }
  
  private getTransformation(folder: string): string {
    const transformations = CLOUDINARY_CONFIG.transformations;
    
    switch (folder) {
      case 'profiles':
        return transformations.profile;
      case 'reviews':
        return transformations.review;
      default:
        return transformations.thumbnail;
    }
  }
  
  private extractPublicIdFromUrl(url: string): string {
    // Extrair public_id da URL do Cloudinary
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1) {
      const publicIdParts = parts.slice(uploadIndex + 2); // Pular 'upload' e transformation
      return publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remover extensão
    }
    
    return url;
  }
}

// ===== STORAGE FACTORY =====
export function createStorageAdapter(provider?: StorageProvider): StorageAdapter {
  const selectedProvider = provider || STORAGE_ENVIRONMENT.provider;
  
  switch (selectedProvider) {
    case 's3':
      return new S3StorageAdapter();
    case 'cloudinary':
      return new CloudinaryStorageAdapter();
    case 'local':
    default:
      return new LocalStorageAdapter();
  }
}

// ===== MULTI-PROVIDER STORAGE =====
export class MultiProviderStorage implements StorageAdapter {
  private adapters: Map<StorageProvider, StorageAdapter> = new Map();
  private primaryProvider: StorageProvider;
  private fallbackProvider: StorageProvider;
  
  constructor(
    primaryProvider: StorageProvider = STORAGE_ENVIRONMENT.provider,
    fallbackProvider: StorageProvider = 'local'
  ) {
    this.primaryProvider = primaryProvider;
    this.fallbackProvider = fallbackProvider;
    
    this.adapters.set(primaryProvider, createStorageAdapter(primaryProvider));
    if (fallbackProvider !== primaryProvider) {
      this.adapters.set(fallbackProvider, createStorageAdapter(fallbackProvider));
    }
  }
  
  async upload(file: Buffer, filename: string, folder: string): Promise<StorageResult> {
    try {
      const primaryAdapter = this.adapters.get(this.primaryProvider);
      if (primaryAdapter) {
        return await primaryAdapter.upload(file, filename, folder);
      }
    } catch (error) {
      console.warn(`Primary storage (${this.primaryProvider}) failed:`, error);
    }
    
    // Fallback para provider secundário
    const fallbackAdapter = this.adapters.get(this.fallbackProvider);
    if (fallbackAdapter) {
      console.log(`Using fallback storage: ${this.fallbackProvider}`);
      return await fallbackAdapter.upload(file, filename, folder);
    }
    
    throw new Error('All storage providers failed');
  }
  
  async delete(url: string): Promise<boolean> {
    // Tentar deletar de todos os providers
    const results = await Promise.allSettled(
      Array.from(this.adapters.values()).map(adapter => adapter.delete(url))
    );
    
    return results.some(result => result.status === 'fulfilled' && result.value === true);
  }
  
  getPublicUrl(filename: string, folder: string): string {
    const primaryAdapter = this.adapters.get(this.primaryProvider);
    return primaryAdapter?.getPublicUrl(filename, folder) || '';
  }
  
  async healthCheck(): Promise<boolean> {
    const primaryAdapter = this.adapters.get(this.primaryProvider);
    if (primaryAdapter) {
      return await primaryAdapter.healthCheck();
    }
    return false;
  }
}