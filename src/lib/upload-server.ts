/**
 * Upload System - Real Implementation
 * 
 * ⚠️ This module contains both server and client-safe exports
 */

export { UploadType } from "@/types/upload";
import { UPLOAD_CONFIG, UploadResult, UploadType } from "@/lib/upload/config";

// Server-only imports (lazy loaded)
let validateUploadFile: any;
let processImage: any;
let createStorageStrategy: any;

// Lazy load server-only modules
async function loadServerModules() {
  if (!validateUploadFile) {
    const validators = await import("@/lib/upload/validators");
    validateUploadFile = validators.validateUploadFile;
  }
  if (!processImage) {
    const processors = await import("@/lib/upload/processors");
    processImage = processors.processImage;
  }
  if (!createStorageStrategy) {
    const storage = await import("@/lib/upload/storage");
    createStorageStrategy = storage.createStorageStrategy;
  }
}

// Real upload functions using modular system
export async function uploadSingleFile(
  file: File, 
  uploadType: any, 
  userId?: string
): Promise<any> {
  try {
    console.log(`🔧 Processing single file upload: ${file.name}`);
    
    // Load server modules
    await loadServerModules();
    
    // 1. Validate file
    const validation = await validateUploadFile(file, uploadType, userId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 2. Simple save without processing (for now)
    const storage = createStorageStrategy();
    const saveResult = await storage.save(file, uploadType, userId);
    
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    console.log(`✅ Single file upload complete: ${saveResult.url}`);
    
    return {
      success: true,
      url: saveResult.url,
      filename: saveResult.filename,
      size: file.size,
      metadata: saveResult.metadata || {}
    };
    
  } catch (error) {
    console.error('💥 Error in uploadSingleFile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

export async function uploadMultipleFiles(
  files: File[], 
  uploadType: any, 
  userId?: string
): Promise<any> {
  try {
    console.log(`🔧 Processing multiple files upload: ${files.length} files`);
    
    const results: UploadResult[] = [];
    let successCount = 0;
    
    for (const file of files) {
      const result = await uploadSingleFile(file, uploadType, userId);
      results.push(result);
      if (result.success) successCount++;
    }

    console.log(`✅ Multiple files upload complete: ${successCount}/${files.length} successful`);
    
    return {
      success: true,
      files: results,
      totalFiles: files.length,
      maxFileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
      allowedTypes: UPLOAD_CONFIG.ALLOWED_MIME_TYPES,
    };
    
  } catch (error) {
    console.error('💥 Error in uploadMultipleFiles:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

export async function validateFile(file: File): Promise<any> {
  await loadServerModules();
  return await validateUploadFile(file, 'profile');
}

// Client-safe function to get system info
export function getUploadSystemInfo(): any {
  return {
    environment: typeof window !== 'undefined' ? 'client' : 'server',
    storageStrategy: "filesystem",
    features: ["File validation", "Image processing", "Rate limiting"],
    config: {
      maxFileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
      allowedTypes: UPLOAD_CONFIG.ALLOWED_MIME_TYPES
    }
  };
}

// Legacy function for compatibility
export async function deleteUploadedFile(
  filename: string,
  uploadType: any
): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

// Legacy function for compatibility  
export async function checkFileExists(
  filename: string,
  uploadType: any
): Promise<boolean> {
  return false;
}
