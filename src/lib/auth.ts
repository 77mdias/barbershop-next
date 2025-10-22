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

const isProd = process.env.NODE_ENV === "production";

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
        timeout: 30000, // Aumentado para produção
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
        const startTime = Date.now();

        logger.auth.info("🔐 Credentials authorize attempt", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
          userAgent: "production-auth-debug",
        });

        if (!credentials?.email || !credentials?.password) {
          logger.auth.warn("❌ Missing credentials", {
            hasEmail: !!credentials?.email,
            hasPassword: !!credentials?.password,
          });
          return null;
        }

        try {
          // Log da tentativa de busca no banco
          logger.auth.debug("🔍 Searching user in database", {
            email: credentials.email,
            dbUrl: process.env.DATABASE_URL?.substring(0, 20) + "...",
          });

          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          const dbTime = Date.now() - startTime;

          logger.auth.debug("📊 Database query completed", {
            email: credentials.email,
            userFound: !!user,
            userActive: user?.isActive,
            hasPassword: !!user?.password,
            dbQueryTime: `${dbTime}ms`,
            userId: user?.id,
          });

          if (!user || !user.password) {
            logger.auth.warn("❌ User not found or no password", {
              email: credentials.email,
              userExists: !!user,
              hasPassword: !!user?.password,
            });
            return null;
          }

          // Verificar se o usuário está ativo
          if (!user.isActive) {
            logger.auth.warn("⚠️ User account not active", {
              email: credentials.email,
              userId: user.id,
              emailVerified: !!user.emailVerified,
            });
            throw new Error("EmailNotVerified");
          }

          // Verificar senha
          const passwordStartTime = Date.now();
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          const passwordTime = Date.now() - passwordStartTime;

          logger.auth.debug("🔑 Password validation completed", {
            email: credentials.email,
            userId: user.id,
            isValid: isPasswordValid,
            validationTime: `${passwordTime}ms`,
          });

          if (!isPasswordValid) {
            logger.auth.warn("❌ Invalid password", {
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
            name: user.nickname || user.email?.split("@")[0] || "",
          };

          const totalTime = Date.now() - startTime;

          logger.auth.info("✅ Successful credentials authentication", {
            userId: user.id,
            email: user.email,
            role: user.role,
            totalTime: `${totalTime}ms`,
            environment: process.env.NODE_ENV,
          });

          return authUser;
        } catch (error) {
          const totalTime = Date.now() - startTime;

          logger.auth.error("💥 Error in credentials authorize", {
            email: credentials.email,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            totalTime: `${totalTime}ms`,
            environment: process.env.NODE_ENV,
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
    updateAge: 0, // Permite atualizações imediatas
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  events: {
    async signIn({ user, account, profile: _profile }) {
      logger.auth.info("🚀 SignIn event triggered", {
        provider: account?.provider,
        email: user.email,
        userId: user.id,
        environment: process.env.NODE_ENV,
        baseUrl: process.env.NEXTAUTH_URL,
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
        logger.auth.info("✅ OAuth user configured successfully", {
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.auth.error("❌ Error configuring OAuth user", {
          userId: user.id,
          error,
          timestamp: new Date().toISOString(),
        });
      }
    },
    async session({ session, token }) {
      logger.auth.info("📋 Session event", {
        userId: session?.user?.id,
        email: session?.user?.email,
        hasToken: !!token,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    },
  },
  // Configuração melhorada de cookies para produção
  cookies: {
    sessionToken: {
      name: isProd
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
    callbackUrl: {
      name: isProd
        ? `__Secure-next-auth.callback-url`
        : `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
    csrfToken: {
      name: isProd ? `__Secure-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      logger.auth.debug("🎫 JWT callback", {
        hasUser: !!user,
        hasToken: !!token,
        hasAccount: !!account,
        provider: account?.provider,
        userId: user?.id || token?.id,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });

      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.nickname = user.nickname || user.name || user.email?.split("@")[0];
        token.name = user.name;
        token.email = user.email;
        token.phone = user.phone || null;
        token.image = user.image;

        logger.auth.info("✅ JWT token updated with user data", {
          userId: user.id,
          role: user.role,
          provider: account?.provider,
          timestamp: new Date().toISOString(),
        });
      }
      return token;
    },
    async session({ session, token, trigger, newSession }) {
      logger.auth.debug("🔄 Session callback", {
        hasSession: !!session,
        hasToken: !!token,
        tokenId: token?.id,
        sessionEmail: session?.user?.email,
        trigger,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });

      if (token) {
        // Sempre buscar dados atuais do usuário se temos um ID
        if (token.id) {
          try {
            const freshUser = await db.user.findUnique({
              where: { id: token.id as string },
              select: {
                id: true,
                name: true,
                nickname: true,
                email: true,
                phone: true,
                image: true,
                role: true,
              },
            });

            if (freshUser) {
              // Atualizar token com dados frescos SEMPRE
              token.name = freshUser.name;
              token.nickname = freshUser.nickname;
              token.email = freshUser.email;
              token.phone = freshUser.phone;
              token.image = freshUser.image;
              token.role = freshUser.role;

              logger.auth.info("🔄 Session data refreshed from database", {
                userId: freshUser.id,
                hasNewImage: !!freshUser.image,
                trigger,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (error) {
            logger.auth.error("❌ Error refreshing user data", {
              userId: token.id,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.nickname = token.nickname as string | null;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.phone = token.phone as string | null;
        session.user.image = token.image as string | null | undefined;

        logger.auth.info("✅ Session updated with token data", {
          userId: token.id,
          role: token.role,
          hasImage: !!token.image,
          timestamp: new Date().toISOString(),
        });
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      logger.auth.info("🔀 NextAuth redirect callback", {
        url,
        baseUrl,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });

      // Para desenvolvimento, manter comportamento simples
      if (!isProd) {
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        if (url.startsWith(baseUrl)) return url;
        return `${baseUrl}/dashboard`;
      }

      // PRODUÇÃO: Lógica mais robusta
      try {
        // Se a URL é relativa, adiciona o baseUrl
        if (url.startsWith("/")) {
          const redirectUrl = `${baseUrl}${url}`;
          logger.auth.info("🔗 Relative URL redirect", { redirectUrl });
          return redirectUrl;
        }

        // Se a URL é do mesmo domínio, permite
        if (url.startsWith(baseUrl)) {
          logger.auth.info("✅ Same domain URL allowed", { url });
          return url;
        }

        // Extrair callbackUrl se existir
        const urlObj = new URL(url);
        const callbackUrl = urlObj.searchParams.get("callbackUrl");

        if (callbackUrl) {
          const finalUrl = callbackUrl.startsWith("/")
            ? `${baseUrl}${callbackUrl}`
            : callbackUrl;

          // Verificar se a URL final é segura
          if (finalUrl.startsWith(baseUrl)) {
            logger.auth.info("🎯 CallbackUrl redirect", { finalUrl });
            return finalUrl;
          }
        }

        // Fallback seguro
        const fallbackUrl = `${baseUrl}/dashboard`;
        logger.auth.info("🏠 Fallback redirect to dashboard", {
          fallbackUrl,
          originalUrl: url,
        });
        return fallbackUrl;
      } catch (error) {
        logger.auth.error("💥 Error in redirect callback", {
          url,
          baseUrl,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return `${baseUrl}/dashboard`;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: isProd ? false : true, // Debug apenas em desenvolvimento
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
