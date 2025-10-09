import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { logger } from "./logger";

import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    // OAuth Providers
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      httpOptions: {
        timeout: 20000, // 20 segundos - timeout aumentado
      },
    }),
    // Credentials Provider para login com email/senha
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        logger.auth.info("Credentials provider authorize attempt", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString(),
        });

        if (!credentials?.email || !credentials?.password) {
          logger.auth.warn("Missing credentials", {
            hasEmail: !!credentials?.email,
            hasPassword: !!credentials?.password,
          });
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          logger.auth.debug("User lookup result", {
            email: credentials.email,
            userFound: !!user,
            userActive: user?.isActive,
            hasPassword: !!user?.password,
          });

          if (!user || !user.password) {
            logger.auth.warn("User not found or no password", {
              email: credentials.email,
              userExists: !!user,
              hasPassword: !!user?.password,
            });
            return null;
          }

          // Verificar se o usuário está ativo
          if (!user.isActive) {
            logger.auth.warn("User not active", {
              email: credentials.email,
              userId: user.id,
            });
            throw new Error("EmailNotVerified");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          logger.auth.debug("Password validation", {
            email: credentials.email,
            userId: user.id,
            isValid: isPasswordValid,
          });

          if (!isPasswordValid) {
            logger.auth.warn("Invalid password", {
              email: credentials.email,
              userId: user.id,
            });
            return null;
          }

          const authUser = {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            image: user.image || null,
            role: user.role,
          };

          logger.auth.info("Successful credentials authentication", {
            userId: user.id,
            email: user.email,
            role: user.role,
          });

          return authUser;
        } catch (error) {
          logger.auth.error("Error in credentials authorize", {
            email: credentials.email,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          if (error instanceof Error && error.message === "EmailNotVerified") {
            throw error;
          }

          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60, // Atualiza a cada 24h
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  events: {
    async signIn({ user, account, profile: _profile }) {
      logger.auth.info("SignIn event", {
        provider: account?.provider,
        email: user.email,
        userId: user.id,
        userAgent: "production-debug",
        timestamp: new Date().toISOString(),
      });
    },
    async createUser({ user }) {
      logger.auth.info("User created by PrismaAdapter", {
        email: user.email,
        id: user.id,
        timestamp: new Date().toISOString(),
      });

      // Se foi criado via OAuth, configurar campos padrão
      try {
        await db.user.update({
          where: { id: user.id },
          data: {
            role: UserRole.CLIENT,
            isActive: true,
            emailVerified: new Date(),
            nickname: user.name || user.email?.split("@")[0],
          },
        });
        logger.auth.info("OAuth user configured successfully", {
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.auth.error("Error configuring OAuth user", {
          userId: user.id,
          error,
          timestamp: new Date().toISOString(),
        });
      }
    },
    async session({ session, token }) {
      logger.auth.info("Session event", {
        userId: session?.user?.id,
        email: session?.user?.email,
        hasToken: !!token,
        timestamp: new Date().toISOString(),
      });
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account: _account }) {
      logger.auth.debug("JWT callback", {
        hasUser: !!user,
        hasToken: !!token,
        userId: user?.id || token?.id,
        timestamp: new Date().toISOString(),
      });

      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.nickname =
          user.nickname || user.name || user.email?.split("@")[0];
        token.name = user.name;
        token.image = user.image;

        logger.auth.info("JWT token updated with user data", {
          userId: user.id,
          role: user.role,
          timestamp: new Date().toISOString(),
        });
      }
      return token;
    },
    async session({ session, token }) {
      logger.auth.debug("Session callback", {
        hasSession: !!session,
        hasToken: !!token,
        tokenId: token?.id,
        sessionEmail: session?.user?.email,
        timestamp: new Date().toISOString(),
      });

      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.nickname = token.nickname || null;
        session.user.name = token.name || "";
        session.user.image = token.image as string | null | undefined;

        logger.auth.info("Session updated with token data", {
          userId: token.id,
          role: token.role,
          timestamp: new Date().toISOString(),
        });
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      logger.auth.info("NextAuth redirect callback", {
        url,
        baseUrl,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });

      // Solução simplificada para garantir redirecionamento após login
      // Sempre redirecionar para dashboard após login bem-sucedido
      if (url.includes("/api/auth/signin") || url.includes("/auth/signin")) {
        const redirectUrl = `${baseUrl}/dashboard`;
        logger.auth.info("Login successful, redirecting to dashboard", {
          redirectUrl,
          originalUrl: url,
        });
        return redirectUrl;
      }

      // Se a URL é relativa, adiciona o baseUrl
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        logger.auth.info("Relative URL, redirecting to", { redirectUrl });
        return redirectUrl;
      }

      // Se a URL é do mesmo domínio, permite
      if (url.startsWith(baseUrl)) {
        logger.auth.info("Same domain URL, allowing", { url });
        return url;
      }

      // Se a URL contém callbackUrl, extrai e usa
      if (url.includes("callbackUrl=")) {
        try {
          const urlObj = new URL(url);
          const callbackUrl = urlObj.searchParams.get("callbackUrl");
          if (callbackUrl) {
            const finalUrl = callbackUrl.startsWith("/")
              ? `${baseUrl}${callbackUrl}`
              : callbackUrl;
            logger.auth.info("CallbackUrl found, redirecting to", { finalUrl });
            return finalUrl;
          }
        } catch (error) {
          logger.auth.error("Error parsing URL with callbackUrl", {
            url,
            error,
          });
          return `${baseUrl}/dashboard`;
        }
      }

      // Verificar se é uma URL de callback do Stripe
      if (url.includes("session_id=") && url.includes("/pedido/")) {
        logger.auth.info("Stripe callback URL detected", { url });
        return url;
      }

      // Se não, volta para o dashboard
      const fallbackUrl = `${baseUrl}/dashboard`;
      logger.auth.info("Fallback redirecting to dashboard", {
        fallbackUrl,
        originalUrl: url,
      });
      return fallbackUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // Redirecionar para página de erro dedicada
    signOut: "/", // Redirecionar para home após logout
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helpers para server-side
export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
};

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};
