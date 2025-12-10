/**
 * 🖼️ Image Processors
 * 
 * Processamento de imagens com Sharp para diferentes tipos de upload.
 * Suporta resize, compressão e otimização automática.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

import sharp from 'sharp';
import { ProcessingOptions, UploadType, getProcessingOptions } from './config';

// ===== IMAGE PROCESSING FUNCTIONS =====

/**
 * Process image based on upload type
 */
export async function processImage(
  fileBuffer: Buffer, 
  uploadType: UploadType,
  customOptions?: Partial<ProcessingOptions>
): Promise<{ processedBuffer: Buffer; metadata: sharp.Metadata }> {
  try {
    // Get default options for upload type
    const defaultOptions = getProcessingOptions(uploadType);
    
    // Merge with custom options
    const options = { ...defaultOptions, ...customOptions };
    
    console.log(`🖼️ Processing ${uploadType} image with options:`, options);
    
    // Create Sharp instance
    let sharpInstance = sharp(fileBuffer);
    
    // Get original metadata
    const originalMetadata = await sharpInstance.metadata();
    console.log(`📋 Original image: ${originalMetadata.width}x${originalMetadata.height}, format: ${originalMetadata.format}`);
    
    // Apply resize if needed
    if (options.width || options.height) {
      sharpInstance = sharpInstance.resize(options.width, options.height, {
        fit: options.fit || 'inside',
        withoutEnlargement: true // Don't upscale images
      });
    }
    
    // Apply format and quality
    switch (options.format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: options.quality || 80,
          progressive: true,
          mozjpeg: true // Better compression
        });
        break;
        
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality: options.quality || 80,
          progressive: true,
          compressionLevel: 9
        });
        break;
        
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: options.quality || 80,
          effort: 6 // Higher effort for better compression
        });
        break;
        
      default:
        // Default to JPEG
        sharpInstance = sharpInstance.jpeg({ 
          quality: options.quality || 80,
          progressive: true,
          mozjpeg: true
        });
    }
    
    // Process the image
    const processedBuffer = await sharpInstance.toBuffer();
    const processedMetadata = await sharp(processedBuffer).metadata();
    
    console.log(`✅ Processed image: ${processedMetadata.width}x${processedMetadata.height}, size: ${processedBuffer.length} bytes`);
    
    return {
      processedBuffer,
      metadata: processedMetadata
    };
    
  } catch (error) {
    console.error('❌ Image processing error:', error);
    throw new Error(`Erro no processamento da imagem: ${error.message}`);
  }
}

/**
 * Generate thumbnail for image previews
 */
export async function generateThumbnail(
  fileBuffer: Buffer,
  maxWidth: number = 200,
  maxHeight: number = 200
): Promise<Buffer> {
  try {
    const thumbnail = await sharp(fileBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 70 })
      .toBuffer();
      
    console.log(`🖼️ Generated thumbnail: ${thumbnail.length} bytes`);
    return thumbnail;
    
  } catch (error) {
    console.error('❌ Thumbnail generation error:', error);
    throw new Error(`Erro na geração de thumbnail: ${error.message}`);
  }
}

/**
 * Convert image to Base64 for production environments
 */
export async function convertToBase64(
  processedBuffer: Buffer,
  format: string = 'jpeg'
): Promise<string> {
  try {
    const base64 = processedBuffer.toString('base64');
    const mimeType = `image/${format}`;
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    console.log(`📋 Generated base64 data URL, size: ${dataUrl.length} chars`);
    return dataUrl;
    
  } catch (error) {
    console.error('❌ Base64 conversion error:', error);
    throw new Error(`Erro na conversão Base64: ${error.message}`);
  }
}

/**
 * Optimize image for web delivery
 */
export async function optimizeForWeb(
  fileBuffer: Buffer,
  uploadType: UploadType
): Promise<{ optimizedBuffer: Buffer; metadata: sharp.Metadata; base64?: string }> {
  try {
    // Process image with appropriate settings
    const { processedBuffer, metadata } = await processImage(fileBuffer, uploadType);
    
    // For production, also generate base64
    let base64: string | undefined;
    if (process.env.NODE_ENV === 'production') {
      base64 = await convertToBase64(processedBuffer, metadata.format || 'jpeg');
    }
    
    return {
      optimizedBuffer: processedBuffer,
      metadata,
      base64
    };
    
  } catch (error) {
    console.error('❌ Web optimization error:', error);
    throw new Error(`Erro na otimização: ${error.message}`);
  }
}

/**
 * Extract image metadata safely
 */
export async function extractMetadata(fileBuffer: Buffer): Promise<{
  width?: number;
  height?: number;
  format?: string;
  size: number;
  hasAlpha?: boolean;
  colorSpace?: string;
}> {
  try {
    const metadata = await sharp(fileBuffer).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: fileBuffer.length,
      hasAlpha: metadata.hasAlpha,
      colorSpace: metadata.space
    };
    
  } catch (error) {
    console.error('❌ Metadata extraction error:', error);
    return {
      size: fileBuffer.length
    };
  }
}

/**
 * Validate image can be processed by Sharp
 */
export async function canProcessImage(fileBuffer: Buffer): Promise<boolean> {
  try {
    await sharp(fileBuffer).metadata();
    return true;
  } catch (error) {
    console.error('❌ Cannot process image:', error);
    return false;
  }
}

/**
 * Create multiple sizes for responsive images
 */
export async function createResponsiveSizes(
  fileBuffer: Buffer,
  sizes: Array<{ width: number; height?: number; suffix: string }>
): Promise<Array<{ buffer: Buffer; suffix: string; metadata: sharp.Metadata }>> {
  const results: Array<{ buffer: Buffer; suffix: string; metadata: sharp.Metadata }> = [];
  
  for (const size of sizes) {
    try {
      const resized = await sharp(fileBuffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
        
      const metadata = await sharp(resized).metadata();
      
      results.push({
        buffer: resized,
        suffix: size.suffix,
        metadata
      });
      
    } catch (error) {
      console.error(`❌ Error creating size ${size.suffix}:`, error);
    }
  }
  
  return results;
}

/**
 * Remove EXIF data for privacy
 */
export async function removeExifData(fileBuffer: Buffer): Promise<Buffer> {
  try {
    const cleanBuffer = await sharp(fileBuffer)
      .jpeg({ 
        quality: 85,
        progressive: true
      })
      .toBuffer();
      
    console.log(`🔒 Removed EXIF data, size change: ${fileBuffer.length} → ${cleanBuffer.length} bytes`);
    return cleanBuffer;
    
  } catch (error) {
    console.error('❌ EXIF removal error:', error);
    return fileBuffer; // Return original if removal fails
  }
}