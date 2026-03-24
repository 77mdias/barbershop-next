"use client";

import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/ui/notification";
import { useState } from "react";
import { logger } from "@/lib/logger";

const ButtonLogin = ({ isLoading }: { isLoading: boolean }) => {
  const router = useRouter();

  const { NotificationContainer } = useNotification();
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: string) => {
    setIsOAuthLoading(provider);

    try {
      // Forçar redirecionamento para garantir que funcione em produção
      logger.auth.info(`Iniciando login OAuth com ${provider}, forçando redirecionamento`);
      
      // Usar callbackUrl explícito para dashboard
      await signIn(provider, { 
        callbackUrl: "/dashboard",
        redirect: true // Forçar redirecionamento
      });
      
      // O código abaixo só será executado se o redirecionamento falhar
      logger.auth.warn(`Redirecionamento OAuth falhou, tentando alternativa`, { provider });
      
      if (typeof window !== 'undefined') {
        // Fallback: redirecionar manualmente após um breve delay
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (error) {
      logger.auth.error(`Erro no login OAuth`, { provider, error });
      router.push("/auth/error?error=OAuthSignin");
    } finally {
      setIsOAuthLoading(null);
    }
  };

  return (
    <>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent text-on-accent hover:bg-accent/90"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="mt-6">
        <div className="relative mt-6">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
          <div className="flex justify-center text-sm">
            <span className="relative z-10 bg-background px-2 text-fg-muted">
              Ou continue com
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isOAuthLoading === "github"}
            className="w-full border-border text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
          >
            <Github className="mr-2 h-4 w-4" />
            {isOAuthLoading === "github" ? "Conectando..." : "GitHub"}
          </Button>
          {/*
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isOAuthLoading === "google"}
            className="w-full border-border text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
          >
            <Mail className="mr-2 h-4 w-4" />
            {isOAuthLoading === "google" ? "Conectando..." : "Google"}
          </Button>
          */}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn("discord")}
            disabled={isOAuthLoading === "discord"}
            className="w-full border-border text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
          >
            <Mail className="mr-2 h-4 w-4" />
            {isOAuthLoading === "discord" ? "Conectando..." : "Discord"}
          </Button>
        </div>
      </div>

      <NotificationContainer />
    </>
  );
};

export default ButtonLogin;
