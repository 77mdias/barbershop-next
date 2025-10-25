/**
 * 🌐 Cloudinary Direct Upload
 * 
 * Upload direto para Cloudinary sem processamento local.
 * Resolve problema de tamanho das serverless functions.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

'use server';

import { UploadType } from "@/types/upload";

export async function uploadToCloudinaryAction(
  formData: FormData,
  uploadType: UploadType,
  userId?: string
): Promise<{
  success: boolean;
  url?: string;
  urls?: string[];
  publicUrl?: string;
  error?: string;
}> {
  try {
    // Se Cloudinary estiver configurado, usar upload direto
    if (process.env.STORAGE_PROVIDER === 'cloudinary') {
      const cloudinary = await import('cloudinary');
      
      cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Verificar se é upload único ou múltiplo
      const singleFile = formData.get('file') as File;
      const multipleFiles = formData.getAll('files') as File[];
      
      if (singleFile) {
        // Upload único
        const result = await uploadSingleToCloudinary(cloudinary, singleFile, uploadType, userId);
        return {
          success: true,
          url: result.secure_url,
          publicUrl: result.secure_url,
        };
      } else if (multipleFiles.length > 0) {
        // Upload múltiplo
        const results = await Promise.all(
          multipleFiles.map(file => 
            uploadSingleToCloudinary(cloudinary, file, uploadType, userId)
          )
        );
        
        return {
          success: true,
          urls: results.map(r => r.secure_url),
        };
      } else {
        return { success: false, error: 'No files provided' };
      }
    }

    // Fallback para sistema local se Cloudinary não configurado
    return {
      success: false,
      error: 'Cloudinary not configured. Please set STORAGE_PROVIDER=cloudinary'
    };

  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

async function uploadSingleToCloudinary(
  cloudinary: any, 
  file: File, 
  uploadType: UploadType, 
  userId?: string
) {
  // Converter File para base64
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  // Upload para Cloudinary com transformações no formato correto
  const transformation = uploadType === UploadType.REVIEWS 
    ? 'w_800,h_600,c_fit,f_auto,q_auto'
    : 'w_400,h_400,c_fill,f_auto,q_auto';

  return new Promise<any>((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      base64,
      {
        folder: `barbershop/${uploadType}`,
        public_id: `${userId ? `user${userId}-` : ''}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        resource_type: 'auto',
        transformation: transformation
      },
      (error: any, result: any) => {
        if (error) reject(error);
        else {
          resolve(result);
        }
      }
    );
  });
}

  });
}
