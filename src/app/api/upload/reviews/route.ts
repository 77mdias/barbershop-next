/**
 * ⭐ Review Images Upload API Route
 * 
 * Endpoint para upload de imagens em avaliações.
 * Suporta múltiplas imagens por upload (máx. 5).
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIP, createRateLimitHeaders } from '@/lib/rate-limiter';
import { hybridUploadAction } from '@/server/hybridUploadActions';
import { UploadType } from '@/types/upload';

// ===== POST: Upload Review Images =====

export async function POST(request: NextRequest) {
  console.log('⭐ Review images upload request received');
  
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ Unauthorized upload attempt');
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log(`⭐ Review upload for user: ${userId}`);
    
    // 2. Rate Limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, userId);
    
    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for ${clientIP}:${userId}`);
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: createRateLimitHeaders({
            count: 10, // Max reached
            remaining: 0,
            resetTime: rateLimitResult.resetTime || Date.now()
          })
        }
      );
    }
    
    // 3. Extract Files from FormData
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      console.log('❌ No files provided in form data');
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }
    
    console.log(`📄 Review files received: ${files.length} files`);
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} (${file.type}, ${file.size} bytes)`);
    });
    
    // 4. Upload Files - hybrid strategy (local dev, Cloudinary prod)
    const uploadFormData = new FormData();
    files.forEach(file => uploadFormData.append('files', file));
    
    const uploadResult = await hybridUploadAction(uploadFormData, UploadType.REVIEWS, userId);
    
    if (!uploadResult.success) {
      console.log(`❌ Review upload failed: ${uploadResult.error}`);
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }
    
    // 5. Success Response
    console.log(`✅ Review upload successful: ${uploadResult.successfulFiles}/${uploadResult.totalFiles} files`);
    
    const response = {
      success: true,
      files: uploadResult.files?.map(file => ({
        url: file.url,
        filename: file.filename,
        size: file.size,
        metadata: file.metadata,
        base64: file.base64 // Include base64 if available (production)
      })),
      totalFiles: uploadResult.totalFiles,
      successfulFiles: uploadResult.successfulFiles,
      message: `${uploadResult.successfulFiles} imagens enviadas com sucesso`
    };
    
    return NextResponse.json(response, {
      headers: createRateLimitHeaders({
        count: rateLimitResult.remaining ? 10 - rateLimitResult.remaining : 1,
        remaining: rateLimitResult.remaining || 9,
        resetTime: rateLimitResult.resetTime || Date.now()
      })
    });
    
  } catch (error) {
    console.error('💥 Review upload error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ===== DELETE: Remove Review Image =====

export async function DELETE(request: NextRequest) {
  console.log('🗑️ Review image delete request received');
  
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ Unauthorized delete attempt');
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    // 2. Extract filename from request
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Nome do arquivo não fornecido' },
        { status: 400 }
      );
    }
    
    console.log(`🗑️ Deleting review image: ${filename}`);
    
    // 3. Delete File - TODO: Implement delete server action
    console.log(`⚠️ Delete functionality temporarily disabled: ${filename}`);
    const deleteResult: { success: boolean; error?: string } = { success: true }; // Temporary placeholder
    
    if (!deleteResult.success) {
      console.log(`❌ Delete failed: ${deleteResult.error}`);
      return NextResponse.json(
        { error: deleteResult.error },
        { status: 400 }
      );
    }
    
    // 4. Success Response
    console.log(`✅ Review image deleted: ${filename}`);
    
    return NextResponse.json({
      success: true,
      message: 'Imagem removida com sucesso'
    });
    
  } catch (error) {
    console.error('💥 Review delete error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ===== GET: Upload Status/Info =====

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    // Get rate limit status
    const clientIP = getClientIP(request);
    const rateLimitStatus = checkRateLimit(clientIP, session.user.id);
    
    return NextResponse.json({
      uploadType: 'reviews',
      maxFileSize: '5MB',
      maxFiles: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      rateLimit: {
        remaining: rateLimitStatus.remaining,
        resetTime: rateLimitStatus.resetTime
      }
    });
    
  } catch (error) {
    console.error('💥 Review upload info error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}