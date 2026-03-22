"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

// Função para buscar informações do usuário
async function getUserAuthInfo(email: string) {
  try {
    const response = await fetch(
      `/api/auth/user-info?email=${encodeURIComponent(email)}`,
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    logger.auth.error("Erro ao buscar informações do usuário", error);
  }
  return null;
}

const errors = {
  Signin: "Tente fazer login com uma conta diferente.",
  OAuthSignin: "Tente fazer login com uma conta diferente.",
  OAuthCallback: "Tente fazer login com uma conta diferente.",
  OAuthCreateAccount: "Tente fazer login com uma conta diferente.",
  EmailCreateAccount: "Tente fazer login com uma conta diferente.",
  Callback: "Tente fazer login com uma conta diferente.",
  AccessDenied: {
    title: "Email já cadastrado",
    message:
      "Este email já está cadastrado em nossa plataforma com um método diferente de autenticação. Para sua segurança, você precisa fazer login usando o método original de cadastro.",
    details: [
      "Se você se cadastrou com email e senha, use essas credenciais",
      "Se você se cadastrou com outro provedor (Google/GitHub), use o mesmo",
      "Entre em contato conosco se precisar de ajuda",
    ],
  },
  OAuthAccountNotLinked: {
    title: "Email já cadastrado",
    message:
      "Este email já está cadastrado em nossa plataforma com um método diferente de autenticação. Para sua segurança, você precisa fazer login usando o método original de cadastro.",
    details: [
      "Se você se cadastrou com email e senha, use essas credenciais",
      "Se você se cadastrou com outro provedor (Google/GitHub), use o mesmo",
      "Entre em contato conosco se precisar de ajuda",
    ],
  },
  EmailSignin: "Verifique seu endereço de email.",
  CredentialsSignin:
    "Falha no login. Verifique se os detalhes que você forneceu estão corretos.",
  default: "Não foi possível fazer login.",
};

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams?.get("error") as keyof typeof errors;
  const errorData = errors[error] || errors.default;
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    hasPassword: boolean;
    oauthProviders: string[];
    email: string;
    attemptedProvider?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useParams();

  // Debug: verificar os parâmetros
  logger.component.debug("ErrorContent", "Params received", { 
    params, 
    type: typeof params, 
    keys: Object.keys(params || {}) 
  });

  // Extrair slug de forma segura
  const slug =
    typeof params === "object" && params !== null && "slug" in params
      ? (params as { slug: string }).slug
      : undefined;

  logger.component.debug("ErrorContent", "Slug extraído", { slug });

  // Extrair slug do callbackUrl se disponível (pode ter sido passado na URL de erro)
  const callbackUrlParam = searchParams?.get("callbackUrl");
  logger.component.debug("ErrorContent", "CallbackUrl da URL", { callbackUrlParam });

  // Tentar extrair slug do callbackUrl (ex: "/nextstore" -> "nextstore")
  let slugFromCallback: string | undefined;
  if (callbackUrlParam) {
    try {
      const decodedCallback = decodeURIComponent(callbackUrlParam);
      logger.component.debug("ErrorContent", "CallbackUrl decodificado", { decodedCallback });

      // Remover a barra inicial se existir
      const cleanCallback = decodedCallback.startsWith("/")
        ? decodedCallback.slice(1)
        : decodedCallback;

      // Se não for uma URL completa (não tem http/https), é provavelmente um slug
      if (!cleanCallback.includes("http") && !cleanCallback.includes("://")) {
        slugFromCallback = cleanCallback;
        logger.component.debug("ErrorContent", "Slug extraído do callbackUrl", { slugFromCallback });
      }
    } catch (error) {
      logger.component.error("ErrorContent", "Erro ao decodificar callbackUrl", error);
    }
  }

  // Priorizar slug do callbackUrl, depois do params, depois do localStorage
  const urlSlug = slugFromCallback || slug;
  logger.component.debug("ErrorContent", "UrlSlug final", { urlSlug });

  // Fallback: tentar obter slug do localStorage (pode ter sido salvo durante o processo de login)
  const storedSlug =
    typeof window !== "undefined"
      ? localStorage.getItem("currentStoreSlug") ||
        sessionStorage.getItem("currentStoreSlug")
      : undefined;

  logger.component.debug("ErrorContent", "StoredSlug final", { storedSlug });

  const finalSlug = urlSlug || storedSlug;
  logger.component.debug("ErrorContent", "FinalSlug", { finalSlug });

  useEffect(() => {
    logger.component.debug("ErrorContent", "useEffect iniciado", { 
      error, 
      searchParams: searchParams?.toString() || "null" 
    });

    // Verificar se estamos no cliente e obter slug do localStorage
    if (typeof window !== "undefined") {
      const storedSlug =
        localStorage.getItem("currentStoreSlug") ||
        sessionStorage.getItem("currentStoreSlug");
      logger.component.debug("ErrorContent", "Slugs do storage", {
        localStorage: localStorage.getItem("currentStoreSlug"),
        sessionStorage: sessionStorage.getItem("currentStoreSlug"),
        storedSlugFinal: storedSlug
      });
    }

    // Mostrar modal automaticamente para erros importantes
    if (error === "OAuthAccountNotLinked" || error === "AccessDenied") {
      logger.auth.info("Erro OAuth detectado, mostrando modal", { error });
      setShowModal(true);
      logger.component.debug("ErrorContent", "showModal definido como true");

      // Buscar informações detalhadas do erro
      const errorDetails = localStorage.getItem("oauthErrorDetails");
      let attemptedProvider: string | null = null;

      if (errorDetails) {
        try {
          const details = JSON.parse(errorDetails);
          attemptedProvider = details.attemptedProvider;
        } catch (e) {
          logger.auth.error("Erro ao parsear detalhes do erro", e);
        }
      }

      // Buscar informações do usuário - tentar diferentes formas de obter o email
      let email =
        searchParams?.get("email") ||
        searchParams?.get("error_description")?.split(":")[1];

      logger.auth.debug("Extraindo email da URL", {
        emailFromUrl: searchParams?.get("email"),
        errorDescription: searchParams?.get("error_description")
      });

      // Se não encontrou na URL, tentar localStorage
      if (!email) {
        email = localStorage.getItem("lastAttemptedEmail") || undefined;
        logger.auth.debug("Email do localStorage", { email });
      }

      // Se ainda não encontrou, tentar obter do sessionStorage ou cookies
      if (!email) {
        // Tentar obter do sessionStorage (pode ter sido salvo durante o processo OAuth)
        email = sessionStorage.getItem("oauthEmail") || undefined;
        logger.auth.debug("Email do sessionStorage", { email });
      }

      logger.auth.info("Email final encontrado", { email });

      if (email) {
        logger.auth.info("Buscando informações do usuário", { email });
        setLoading(true);
        getUserAuthInfo(email).then((info) => {
          logger.auth.info("Informações do usuário recebidas", { info });
          // Adicionar informações sobre o provider tentado
          if (info && attemptedProvider) {
            info.attemptedProvider = attemptedProvider;
          }
          setUserInfo(info);
          setLoading(false);
        });
      } else {
        logger.auth.warn("Nenhum email encontrado, usando informações padrão");
      }
    }
  }, [error, searchParams]);

  const handleTryAgain = () => {
    setShowModal(false);
    // Redirecionar para login com callbackUrl para voltar à loja
    const storedSlug =
      typeof window !== "undefined"
        ? localStorage.getItem("currentStoreSlug") ||
          sessionStorage.getItem("currentStoreSlug")
        : undefined;
    logger.component.debug("ErrorContent", "handleTryAgain", { 
      storedSlug, 
      callbackUrl: storedSlug ? `/${storedSlug}` : "/",
      finalSlug 
    });
    const callbackUrl = storedSlug ? `/${storedSlug}` : "/";
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const handleGoHome = () => {
    setShowModal(false);
    // Redirecionar para a página da loja (slug) se existir, senão para home
    const storedSlug =
      typeof window !== "undefined"
        ? localStorage.getItem("currentStoreSlug") ||
          sessionStorage.getItem("currentStoreSlug")
        : undefined;
    const targetUrl = storedSlug ? `/${storedSlug}` : "/";
    logger.component.debug("ErrorContent", "handleGoHome", { 
      storedSlug, 
      targetUrl,
      finalSlug 
    });
    router.push(targetUrl);
  };

  // Gerar mensagem personalizada baseada nas informações do usuário
  const getCustomMessage = () => {
    const defaultMessage =
      typeof errorData === "object" && "message" in errorData
        ? errorData.message
        : "Erro de autenticação";

    if (!userInfo) {
      return defaultMessage;
    }

    if (
      userInfo.attemptedProvider &&
      userInfo.oauthProviders &&
      userInfo.oauthProviders.length > 0
    ) {
      const attemptedProviderName =
        userInfo.attemptedProvider === "google"
          ? "Google"
          : userInfo.attemptedProvider === "github"
            ? "GitHub"
            : userInfo.attemptedProvider;

      const originalProviders = userInfo.oauthProviders
        .map((p: string) =>
          p === "google" ? "Google" : p === "github" ? "GitHub" : p,
        )
        .join(" ou ");

      return `Você tentou fazer login com ${attemptedProviderName}, mas esta conta foi criada usando ${originalProviders}. Para sua segurança, use o método original de cadastro.`;
    }

    return defaultMessage;
  };

  // Gerar detalhes baseados no método de autenticação original
  const getCustomDetails = () => {
    if (!userInfo) {
      return typeof errorData === "object" && "details" in errorData
        ? errorData.details
        : [];
    }

    const details: string[] = [];

    // Adicionar contexto sobre o que foi tentado
    if (userInfo.attemptedProvider) {
      const attemptedProviderName =
        userInfo.attemptedProvider === "google"
          ? "Google"
          : userInfo.attemptedProvider === "github"
            ? "GitHub"
            : userInfo.attemptedProvider;
      details.push(`❌ Tentativa de login com ${attemptedProviderName} falhou`);
    }

    if (userInfo.hasPassword) {
      details.push("🔐 Use seu email e senha para fazer login");
    }

    if (userInfo.oauthProviders && userInfo.oauthProviders.length > 0) {
      const providers = userInfo.oauthProviders
        .map((p: string) => {
          switch (p) {
            case "google":
              return "Google";
            case "github":
              return "GitHub";
            default:
              return p;
          }
        })
        .join(" ou ");
      details.push(`✅ Faça login com ${providers} (método original)`);
    }

    if (details.length === 0) {
      details.push("Entre em contato conosco se precisar de ajuda");
    }

    return details;
  };

  logger.component.debug("ErrorContent", "render", { error, errorData, showModal });

  // Se for OAuthAccountNotLinked ou AccessDenied, mostrar modal elegante
  if (error === "OAuthAccountNotLinked" || error === "AccessDenied") {
    logger.component.debug("ErrorContent", "rendering OAuth error modal");
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold italic text-foreground">
            Email já cadastrado
          </h2>
          <p className="mt-3 text-sm text-fg-muted">
            {loading
              ? "Carregando informações..."
              : "Clique no botão abaixo para ver mais detalhes"}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setShowModal(true)}
              disabled={loading}
              className="gold-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90 disabled:opacity-50"
            >
              {loading ? "Carregando..." : "Ver Detalhes"}
            </Button>
          </div>
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type="warning"
          title="Email já cadastrado"
          message={getCustomMessage()}
          details={getCustomDetails()}
          actions={[
            {
              label: "Tentar Novamente",
              onClick: handleTryAgain,
              variant: "default",
            },
            {
              label: "Voltar ao Início",
              onClick: handleGoHome,
              variant: "outline",
            },
          ]}
        />
      </main>
    );
  }

  // Renderização padrão para outros erros
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="font-display text-2xl font-bold italic text-foreground">
          Erro de Autenticação
        </h2>
        <p className="mt-3 text-sm text-fg-muted">{errorData as string}</p>
        <div className="mt-6 space-y-3">
          <Button
            asChild
            className="gold-shimmer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
          >
            <Link
              href={`/auth/signin?callbackUrl=${encodeURIComponent(finalSlug ? `/${finalSlug}` : "/")}`}
            >
              Tentar Novamente
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
          >
            <Link href={finalSlug ? `/${finalSlug}` : "/"}>
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
