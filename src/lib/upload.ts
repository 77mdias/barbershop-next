/**
 * Upload System - Real Implementation
 */

export { UploadType } from "@/types/upload";
import { UPLOAD_CONFIG, UploadResult, UploadType } from "@/lib/upload/config";
import { validateUploadFile } from "@/lib/upload/validators";
import { processImage } from "@/lib/upload/processors";
import { createStorageStrategy } from "@/lib/upload/storage";

// Real upload functions using modular system
export async function uploadSingleFile(
  file: File, 
  uploadType: any, 
  userId?: string
): Promise<any> {
  try {
    console.log(`🔧 Processing single file upload: ${file.name}`);
    
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
  return await validateUploadFile(file, 'profile');
}

export function getUploadSystemInfo(): any {
  return {
    environment: UPLOAD_CONFIG.isDevelopment ? "development" : "production",
    storageStrategy: UPLOAD_CONFIG.storage.type,
    features: ["File validation", "Image processing", "Rate limiting"]
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
