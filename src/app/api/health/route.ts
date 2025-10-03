import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

/**
 * Health Check Endpoint
 * 
 * Verifica o status da aplicação e dependências
 * Usado pelo Docker health check e monitoramento
 */
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Verificar conexão com banco de dados
    await db.$queryRaw`SELECT 1`;
    
    const dbResponseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`
      },
      version: process.env.npm_package_version || '1.0.0'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV
    }, { status: 503 });
  }
}