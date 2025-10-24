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

      const file = formData.get('file') as File;
      if (!file) {
        return { success: false, error: 'No file provided' };
      }

      // Converter File para base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

      // Upload para Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.v2.uploader.upload(
          base64,
          {
            folder: `barbershop/${uploadType}`,
            public_id: `${userId ? `user${userId}-` : ''}${Date.now()}`,
            transformation: getCloudinaryTransformation(uploadType),
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      return {
        success: true,
        url: result.secure_url,
        publicUrl: result.secure_url,
      };
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