import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@/generated/prisma";
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verificar se o usuário está ativo
        if (!user.isActive) {
          throw new Error("EmailNotVerified");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          image: user.image || null,
          role: user.role,
        };
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
      });
    },
    async createUser({ user }) {
      logger.auth.info("User created by PrismaAdapter", {
        email: user.email,
        id: user.id,
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
        logger.auth.info("OAuth user configured successfully", { userId: user.id });
      } catch (error) {
        logger.auth.error("Error configuring OAuth user", { userId: user.id, error });
      }
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
  },
  callbacks: {
    async jwt({ token, user, account: _account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.nickname = user.nickname || user.name || user.email?.split("@")[0];
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.nickname = token.nickname || null;
        session.user.name = token.name || "";
        session.user.image = token.image as string | null | undefined;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      logger.auth.debug("NextAuth redirect callback", { url, baseUrl });

      // Se a URL é relativa, adiciona o baseUrl
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        logger.auth.debug("Relative URL, redirecting to", { redirectUrl });
        return redirectUrl;
      }

      // Se a URL é do mesmo domínio, permite
      if (url.startsWith(baseUrl)) {
        logger.auth.debug("Same domain URL, allowing", { url });
        return url;
      }

      // Se a URL contém callbackUrl, extrai e usa
      if (url.includes("callbackUrl=")) {
        const urlObj = new URL(url);
        const callbackUrl = urlObj.searchParams.get("callbackUrl");
        if (callbackUrl) {
          const finalUrl = callbackUrl.startsWith("/")
            ? `${baseUrl}${callbackUrl}`
            : callbackUrl;
          logger.auth.debug("CallbackUrl found, redirecting to", { finalUrl });
          return finalUrl;
        }
      }

      // Verificar se é uma URL de callback do Stripe
      if (url.includes("session_id=") && url.includes("/pedido/")) {
        logger.auth.debug("Stripe callback URL detected", { url });
        return url;
      }

      // Se não, volta para o baseUrl
      logger.auth.debug("Redirecting to baseUrl", { baseUrl });
      return baseUrl;
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
