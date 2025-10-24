/**
 * 📤 Upload Server Actions
 * 
 * Server-only actions for file uploads.
 * These use Node.js modules and cannot be imported in client components.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

'use server';

import { validateUploadFile } from "@/lib/upload/validators";
import { processImage } from "@/lib/upload/processors";
import { createStorageStrategy } from "@/lib/upload/storage";
import { UploadType } from "@/types/upload";

export async function uploadSingleFileAction(
  formData: FormData,
  uploadType: UploadType,
  userId?: string
): Promise<{
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    console.log(`🔧 Processing single file upload: ${file.name}`);
    
    // 1. Validate file
    const validation = await validateUploadFile(file, uploadType, userId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 2. Save file
    const storage = createStorageStrategy();
    const saveResult = await storage.save(file, uploadType, userId);
    
    if (!saveResult.success) {
      return { 
        success: false, 
        error: saveResult.error || 'Upload failed' 
      };
    }

    return {
      success: true,
      url: saveResult.url,
      filename: saveResult.filename
    };
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function uploadMultipleFilesAction(
  formData: FormData,
  uploadType: UploadType,
  userId?: string
): Promise<{
  success: boolean;
  urls?: string[];
  filenames?: string[];
  errors?: string[];
}> {
  try {
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return { success: false, errors: ['No files provided'] };
    }

    console.log(`🔧 Processing ${files.length} files`);

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const validation = await validateUploadFile(file, uploadType, userId);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const storage = createStorageStrategy();
        const result = await storage.save(file, uploadType, userId);
        
        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        return result;
      })
    );

    const successResults = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    const errorResults = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason?.message || 'Unknown error');

    return {
      success: successResults.length > 0,
      urls: successResults.map(r => r.url),
      filenames: successResults.map(r => r.filename),
      errors: errorResults.length > 0 ? errorResults : undefined
    };

  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

export async function validateFileAction(
  file: File,
  uploadType: UploadType
): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    return await validateUploadFile(file, uploadType);
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    };
  }
}
