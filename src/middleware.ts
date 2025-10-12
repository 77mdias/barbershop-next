import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { logger } from "@/lib/logger";

export async function middleware(request: NextRequest) {
  logger.auth.info("Middleware executed for path", {
    pathname: request.nextUrl.pathname,
  });

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;
  const isAuth = !!token;
  const isAuthPage = pathname.startsWith("/auth");
  const isAdminPage = pathname.startsWith("/admin");
  const isProfilePage = pathname.startsWith("/profile");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isSchedulingPage = pathname.startsWith("/scheduling");

  // Definir rotas públicas que não precisam de autenticação
  const publicRoutes = [
    "/",
    "/gallery",
    "/about",
    "/contact",
    "/client-review-demo",
    "/test-reviews-real",
    "/reviews",
  ];

  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/api/auth");

  logger.auth.debug("Authentication status check", {
    isAuth,
    pathname,
    isPublicRoute,
  });

  // Se usuário autenticado tentar acessar páginas de auth, redirecionar para dashboard
  if (isAuth && isAuthPage) {
    logger.auth.info("Authenticated user redirected from auth to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Proteger páginas que requerem autenticação
  if (!isAuth && (isProfilePage || isDashboardPage || isSchedulingPage)) {
    logger.auth.warn("Access denied - redirecting to login", { pathname });
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Proteger páginas de admin (verificar role)
  if (isAdminPage) {
    if (!isAuth) {
      logger.auth.warn("Admin access denied - not authenticated", { pathname });
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const userRole = token?.role as string;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      logger.auth.warn("Admin access denied - insufficient role", {
        userRole,
        pathname,
      });
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  logger.auth.debug("Middleware allowing access", { pathname });
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
