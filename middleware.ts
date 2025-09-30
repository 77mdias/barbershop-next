import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
    const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");
    const isProfilePage = req.nextUrl.pathname.includes("/profile");

    // Redirecionar usuários autenticados das páginas de auth
    // Mas não redirecionar durante o processo de OAuth ou páginas de erro
    if (
      isAuthPage &&
      isAuth &&
      !req.nextUrl.searchParams.has("callbackUrl") &&
      !req.nextUrl.pathname.includes("/error")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Proteger páginas que requerem autenticação
    if (!isAuth && (isProfilePage || isAuthPage)) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Proteger páginas de admin
    if (isAdminPage && (!isAuth || token?.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Proteger páginas do dashboard - só admins podem acessar
    if (isDashboardPage && (!isAuth || token?.role !== "ADMIN")) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("error", "AccessDenied");
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Deixar o middleware handle a lógica
    },
  }
);

export const config = {
  matcher: [
    // Proteger todas as rotas exceto as públicas
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    // Proteger especificamente as rotas de auth
    "/auth/:path*",
    // Proteger rotas que requerem login
    "/:slug/perfil/:path*",
    "/:slug/wishlist/:path*",
    "/:slug/carrinho/:path*",
    "/:slug/checkout/:path*",
    // Proteger rotas de admin
    "/admin/:path*",
    // Proteger rotas do dashboard
    "/dashboard/:path*",
  ],
};
