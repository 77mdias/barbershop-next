import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  logger.auth.info('Middleware executed for path', { pathname: request.nextUrl.pathname });
  
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const pathname = request.nextUrl.pathname;
  const isAuth = !!token;
  const isAuthPage = pathname.startsWith('/auth');
  const isAdminPage = pathname.startsWith('/admin');
  const isProfilePage = pathname.startsWith('/profile');
  const isDashboardPage = pathname.startsWith('/dashboard');

  logger.auth.debug('Authentication status check', { isAuth, pathname });

  // Se usuário autenticado tentar acessar páginas de auth, redirecionar para dashboard
  if (isAuth && isAuthPage) {
    logger.auth.info('Authenticated user redirected from auth to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Se não autenticado na página inicial, redirecionar para login
  if (!isAuth && pathname === '/') {
    logger.auth.info('Unauthenticated user redirected from home to login');
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Proteger páginas que requerem autenticação
  if (!isAuth && (isProfilePage || isDashboardPage)) {
    logger.auth.warn('Access denied - redirecting to login', { pathname });
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Proteger páginas de admin (verificar role)
  if (isAdminPage) {
    if (!isAuth) {
      logger.auth.warn('Admin access denied - not authenticated', { pathname });
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    const userRole = token?.role as string;
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      logger.auth.warn('Admin access denied - insufficient role', { userRole, pathname });
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }

  logger.auth.debug('Middleware allowing access', { pathname });
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*'
  ]
};
