/**
 * 👤 Profile Upload API Route
 * 
 * Endpoint para upload de fotos de perfil dos usuários.
 * Suporta apenas uma imagem por upload com validação rigorosa.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIP, createRateLimitHeaders } from '@/lib/rate-limiter';
import { uploadToCloudinaryAction } from '@/server/cloudinaryActions';
import { UploadType } from '@/types/upload';

// ===== POST: Upload Profile Image =====

export async function POST(request: NextRequest) {
  console.log('👤 Profile upload request received');
  
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
    console.log(`👤 Profile upload for user: ${userId}`);
    
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
    
    // 3. Extract File from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('❌ No file provided in form data');
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }
    
    console.log(`📄 Profile file received: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    // 4. Upload File directly to Cloudinary (no Sharp processing)
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    const uploadResult = await uploadToCloudinaryAction(uploadFormData, UploadType.PROFILE, userId);
    
    if (!uploadResult.success) {
      console.log(`❌ Profile upload failed: ${uploadResult.error}`);
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }

    // 5. Update User Profile Image in Database
    try {
      const { db } = await import('@/lib/prisma');
      
      await db.user.update({
        where: { id: userId },
        data: { image: uploadResult.url }
      });
      
      console.log(`✅ User profile image updated in database: ${uploadResult.url}`);
    } catch (dbError) {
      console.error('❌ Failed to update user image in database:', dbError);
      // Continue anyway since file upload was successful
    }
    
    // 6. Success Response
    console.log(`✅ Profile upload successful: ${uploadResult.url}`);
    
    const response = {
      success: true,
      file: {
        url: uploadResult.url,
        filename: uploadResult.filename,
        size: uploadResult.size,
        metadata: uploadResult.metadata
      },
      message: 'Foto de perfil atualizada com sucesso'
    };
    
    // Add base64 if available (production)
    if (uploadResult.base64) {
      (response.file as any).base64 = uploadResult.base64;
    }
    
    return NextResponse.json(response, {
      headers: createRateLimitHeaders({
        count: rateLimitResult.remaining ? 10 - rateLimitResult.remaining : 1,
        remaining: rateLimitResult.remaining || 9,
        resetTime: rateLimitResult.resetTime || Date.now()
      })
    });
    
  } catch (error) {
    console.error('💥 Profile upload error:', error);
    
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
      uploadType: 'profile',
      maxFileSize: '5MB',
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      rateLimit: {
        remaining: rateLimitStatus.remaining,
        resetTime: rateLimitStatus.resetTime
      }
    });
    
  } catch (error) {
    console.error('💥 Profile upload info error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}