"use client";

import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/ui/notification";
import { useState } from "react";
import styles from "@/app/scss/components/CourseCard.module.scss";

const ButtonLogin = ({ isLoading }: { isLoading: boolean }) => {
  const router = useRouter();

  const { NotificationContainer } = useNotification();
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: string) => {
    setIsOAuthLoading(provider);

    try {
      const result = await signIn(provider);

      if (
        result?.error === "OAuthAccountNotLinked" ||
        result?.error === "AccessDenied"
      ) {
        console.log("Erro OAuth detectado, redirecionando para página de erro");

        // Salvar informações detalhadas no localStorage para uso na página de erro
        localStorage.setItem("lastOAuthProvider", provider);
        localStorage.setItem(
          "oauthErrorDetails",
          JSON.stringify({
            error: "OAuthAccountNotLinked",
            attemptedProvider: provider,
            timestamp: new Date().toISOString(),
          })
        );

        // Tentar obter o email do resultado ou usar um placeholder
        const email =
          result?.url?.split("email=")[1]?.split("&")[0] || "teste@exemplo.com";
        localStorage.setItem("lastAttemptedEmail", email);
        console.log("Email salvo no localStorage:", email);
      } else if (result?.error) {
        router.push(`/auth/error?error=${result.error}`);
      }
    } catch (error) {
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
        className={`w-full text-white hover:bg-[var(--text-price-secondary)] ${styles.buttonAccent}`}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="mt-6">
        <div className="relative mt-6">
          <div className="flex justify-center text-sm">
            <span className="relative z-10 bg-black px-2 text-gray-400">
              Ou continue com
            </span>
          </div>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-gray-600" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isOAuthLoading === "github"}
            className="w-full border-gray-600 bg-[var(--card-product)] text-white transition-all duration-300 hover:border-primary hover:bg-primary/10"
          >
            <Github className="mr-2 h-4 w-4" />
            {isOAuthLoading === "github" ? "Conectando..." : "GitHub"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isOAuthLoading === "google"}
            className="w-full border-gray-600 bg-[var(--card-product)] text-white transition-all duration-300 hover:border-primary hover:bg-primary/10"
          >
            <Mail className="mr-2 h-4 w-4" />
            {isOAuthLoading === "google" ? "Conectando..." : "Google"}
          </Button>
        </div>
      </div>

      <NotificationContainer />
    </>
  );
};

export default ButtonLogin;
