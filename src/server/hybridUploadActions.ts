/**
 * 🔄 Hybrid Upload Strategy
 * 
 * Development: Local filesystem (free, fast)
 * Production: Cloudinary (CDN, optimized)
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

'use server';

import { UploadType } from "@/types/upload";

export async function hybridUploadAction(
  formData: FormData,
  uploadType: UploadType,
  userId?: string
): Promise<{
  success: boolean;
  url?: string;
  urls?: string[];
  filename?: string;
  provider?: string;
  error?: string;
}> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useCloudinary = process.env.STORAGE_PROVIDER === 'cloudinary';
  
  try {
    if (!isDevelopment && useCloudinary) {
      // 🌐 PRODUÇÃO: Cloudinary
      console.log('🌐 Using Cloudinary for production upload');
      return await uploadToCloudinary(formData, uploadType, userId);
    } else {
      // 🏠 DESENVOLVIMENTO: Local filesystem
      console.log('🏠 Using local storage for development upload');
      return await uploadToLocal(formData, uploadType, userId);
    }
  } catch (error) {
    console.error('❌ Hybrid upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// 🌐 CLOUDINARY UPLOAD
async function uploadToCloudinary(
  formData: FormData,
  uploadType: UploadType,
  userId?: string
) {
  const cloudinary = await import('cloudinary');
  
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload único ou múltiplo
  const singleFile = formData.get('file') as File;
  const multipleFiles = formData.getAll('files') as File[];
  
  if (singleFile) {
    const result = await uploadSingleToCloudinary(cloudinary, singleFile, uploadType, userId);
    return {
      success: true,
      url: result.secure_url,
      filename: result.public_id,
      provider: 'cloudinary'
    };
  } else if (multipleFiles.length > 0) {
    const results = await Promise.all(
      multipleFiles.map(file => 
        uploadSingleToCloudinary(cloudinary, file, uploadType, userId)
      )
    );
    
    return {
      success: true,
      urls: results.map(r => r.secure_url),
      provider: 'cloudinary'
    };
  } else {
    throw new Error('No files provided');
  }
}

async function uploadSingleToCloudinary(
  cloudinary: any, 
  file: File, 
  uploadType: UploadType, 
  userId?: string
) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  return new Promise<any>((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      base64,
      {
        folder: `barbershop/${uploadType}`,
        public_id: `${userId ? `user${userId}-` : ''}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transformation: getCloudinaryTransformation(uploadType),
      },
      (error: any, result: any) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
}

// 🏠 LOCAL FILESYSTEM UPLOAD
async function uploadToLocal(
  formData: FormData,
  uploadType: UploadType,
  userId?: string
) {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // Upload único ou múltiplo
  const singleFile = formData.get('file') as File;
  const multipleFiles = formData.getAll('files') as File[];
  
  if (singleFile) {
    const result = await uploadSingleToLocal(fs, path, singleFile, uploadType, userId);
    return {
      success: true,
      url: result.url,
      filename: result.filename,
      provider: 'local'
    };
  } else if (multipleFiles.length > 0) {
    const results = await Promise.all(
      multipleFiles.map(file => 
        uploadSingleToLocal(fs, path, file, uploadType, userId)
      )
    );
    
    return {
      success: true,
      urls: results.map(r => r.url),
      provider: 'local'
    };
  } else {
    throw new Error('No files provided');
  }
}

async function uploadSingleToLocal(
  fs: any,
  path: any,
  file: File,
  uploadType: UploadType,
  userId?: string
) {
  // Generate filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(file.name);
  const filename = `${userId ? `user${userId}-` : ''}${timestamp}-${random}${ext}`;
  
  // Create directory
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadType);
  await fs.mkdir(uploadDir, { recursive: true });
  
  // Save file
  const filePath = path.join(uploadDir, filename);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await fs.writeFile(filePath, buffer);
  
  const url = `/uploads/${uploadType}/${filename}`;
  
  return { url, filename };
}

function getCloudinaryTransformation(uploadType: UploadType): string {
  switch (uploadType) {
    case UploadType.PROFILE:
      return 'w_400,h_400,c_fill,f_auto,q_auto';
    case UploadType.REVIEWS:
      return 'w_800,h_600,c_fit,f_auto,q_auto';
    default:
      return 'w_400,h_400,c_fill,f_auto,q_auto';
  }
}