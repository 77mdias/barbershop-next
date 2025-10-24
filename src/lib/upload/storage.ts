/**
 * 💾 Storage Strategies
 * 
 * Diferentes estratégias de armazenamento para desenvolvimento e produção.
 * Suporta filesystem local e memory storage para ambientes read-only.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { 
  UploadType, 
  UploadResult, 
  ENVIRONMENT, 
  getUploadDir, 
  getPublicUrl, 
  generateFilename 
} from './config';
import { optimizeForWeb } from './processors';

// ===== STORAGE INTERFACE =====

export interface StorageStrategy {
  save(file: File, uploadType: UploadType, userId?: string): Promise<UploadResult>;
  delete(filename: string, uploadType: UploadType): Promise<boolean>;
  exists(filename: string, uploadType: UploadType): Promise<boolean>;
}

// ===== FILESYSTEM STORAGE (DEVELOPMENT) =====

export class FilesystemStorage implements StorageStrategy {
  async save(file: File, uploadType: UploadType, userId?: string): Promise<UploadResult> {
    try {
      console.log(`💾 Filesystem storage: saving ${file.name} as ${uploadType}`);
      
      // Convert File to Buffer  
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      
      // Generate filename
      const filename = generateFilename(file.name, uploadType);
      
      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), getUploadDir(uploadType));
      await fs.mkdir(uploadDir, { recursive: true });
      
      // Save file
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, fileBuffer);
      
      const url = getPublicUrl(filename, uploadType);
      
      console.log(`✅ File saved successfully: ${url}`);
      
      return {
        success: true,
        url,
        filename,
        size: file.size,
        metadata: {
          width: 0,
          height: 0,
          format: 'jpeg'
        }
      };
      
    } catch (error) {
      console.error('❌ Filesystem storage error:', error);
      return {
        success: false,
        error: `Erro no salvamento: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  async delete(filename: string, uploadType: UploadType): Promise<boolean> {
    try {
      const uploadDir = path.join(process.cwd(), getUploadDir(uploadType));
      const filePath = path.join(uploadDir, filename);
      
      await fs.unlink(filePath);
      console.log(`🗑️ File deleted: ${filename}`);
      return true;
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      return false;
    }
  }
  
  async exists(filename: string, uploadType: UploadType): Promise<boolean> {
    try {
      const uploadDir = path.join(process.cwd(), getUploadDir(uploadType));
      const filePath = path.join(uploadDir, filename);
      
      await fs.access(filePath);
      return true;
      
    } catch {
      return false;
    }
  }
  
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
    }
  }
}

// ===== MEMORY STORAGE (PRODUCTION) =====

export class MemoryStorage implements StorageStrategy {
  private static store = new Map<string, { data: string; metadata: any }>();
  
  async save(file: File, uploadType: UploadType, userId?: string): Promise<UploadResult> {
    try {
      console.log(`☁️ Memory storage: processing ${file.name} as ${uploadType}`);
      
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      
      // Process and optimize image
      const { optimizedBuffer, metadata, base64 } = await optimizeForWeb(fileBuffer, uploadType);
      
      // Generate unique filename
      const filename = generateFilename(file.name, uploadType);
      
      // Store in memory
      if (base64) {
        MemoryStorage.store.set(filename, {
          data: base64,
          metadata: {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || 'jpeg',
            size: optimizedBuffer.length,
            uploadType,
            createdAt: new Date().toISOString()
          }
        });
      }
      
      // Generate virtual URL for compatibility
      const url = getPublicUrl(filename, uploadType);
      
      console.log(`✅ File stored in memory: ${filename}`);
      
      return {
        success: true,
        url,
        filename,
        size: optimizedBuffer.length,
        base64, // Include base64 for direct use
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || 'jpeg'
        }
      };
      
    } catch (error) {
      console.error('❌ Memory storage error:', error);
      return {
        success: false,
        error: `Erro no upload: ${error.message}`
      };
    }
  }
  
  async delete(filename: string, uploadType: UploadType): Promise<boolean> {
    try {
      const deleted = MemoryStorage.store.delete(filename);
      if (deleted) {
        console.log(`🗑️ File removed from memory: ${filename}`);
      }
      return deleted;
      
    } catch (error) {
      console.error('❌ Memory delete error:', error);
      return false;
    }
  }
  
  async exists(filename: string, uploadType: UploadType): Promise<boolean> {
    return MemoryStorage.store.has(filename);
  }
  
  // Static method to retrieve stored data
  static get(filename: string): { data: string; metadata: any } | undefined {
    return MemoryStorage.store.get(filename);
  }
  
  // Static method to list all stored files
  static list(): Array<{ filename: string; metadata: any }> {
    return Array.from(MemoryStorage.store.entries()).map(([filename, { metadata }]) => ({
      filename,
      metadata
    }));
  }
  
  // Static method to clear old files (for memory management)
  static cleanup(maxAgeHours: number = 24): number {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [filename, { metadata }] of MemoryStorage.store.entries()) {
      if (new Date(metadata.createdAt) < cutoff) {
        MemoryStorage.store.delete(filename);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} old files from memory`);
    }
    
    return cleaned;
  }
}

// ===== STORAGE FACTORY =====

export function createStorageStrategy(): StorageStrategy {
  if (ENVIRONMENT.isReadOnlyFS) {
    console.log('☁️ Using memory storage strategy (production)');
    return new MemoryStorage();
  } else {
    console.log('💾 Using filesystem storage strategy (development)');
    return new FilesystemStorage();
  }
}

// ===== STORAGE UTILITIES =====

/**
 * Save multiple files using the appropriate storage strategy
 */
export async function saveMultipleFiles(
  files: File[],
  uploadType: UploadType,
  userId?: string
): Promise<UploadResult[]> {
  const storage = createStorageStrategy();
  const results: UploadResult[] = [];
  
  console.log(`📤 Saving ${files.length} files using ${storage.constructor.name}`);
  
  for (const file of files) {
    const result = await storage.save(file, uploadType, userId);
    results.push(result);
    
    // Stop on first error for safety
    if (!result.success) {
      console.error(`❌ Upload failed for ${file.name}:`, result.error);
      break;
    }
  }
  
  return results;
}

/**
 * Delete file using the appropriate storage strategy
 */
export async function deleteFile(
  filename: string,
  uploadType: UploadType
): Promise<boolean> {
  const storage = createStorageStrategy();
  return await storage.delete(filename, uploadType);
}

/**
 * Check if file exists using the appropriate storage strategy
 */
export async function fileExists(
  filename: string,
  uploadType: UploadType
): Promise<boolean> {
  const storage = createStorageStrategy();
  return await storage.exists(filename, uploadType);
}

/**
 * Get file info from memory storage (production only)
 */
export function getMemoryFile(filename: string): { data: string; metadata: any } | undefined {
  if (ENVIRONMENT.isReadOnlyFS) {
    return MemoryStorage.get(filename);
  }
  return undefined;
}

/**
 * List all memory files (production only)
 */
export function listMemoryFiles(): Array<{ filename: string; metadata: any }> {
  if (ENVIRONMENT.isReadOnlyFS) {
    return MemoryStorage.list();
  }
  return [];
}

/**
 * Cleanup old memory files (production only)
 */
export function cleanupMemoryStorage(maxAgeHours: number = 24): number {
  if (ENVIRONMENT.isReadOnlyFS) {
    return MemoryStorage.cleanup(maxAgeHours);
  }
  return 0;
}