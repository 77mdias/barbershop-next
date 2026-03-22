"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error" | null
  >(null);

  const token = searchParams?.get("token");
  const emailParam = searchParams?.get("email");

  // Preencher email se fornecido na URL
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch(
        `/api/auth/verify-email?token=${verificationToken}`,
      );
      const data = await response.json();

      if (response.ok) {
        setVerificationStatus("success");
        toast.success("Email verificado com sucesso!");
        setTimeout(() => {
          // Redirecionar para página de agradecimento
          const thankYouUrl = `/auth/thank-you?verified=true&email=${encodeURIComponent(email)}`;
          router.push(thankYouUrl);
        }, 3000);
      } else {
        setVerificationStatus("error");
        toast.error(data.message || "Erro ao verificar email");
      }
    } catch {
      setVerificationStatus("error");
      toast.error("Erro ao verificar email");
    } finally {
      setIsVerifying(false);
    }
  }, [email, router]);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error("Digite seu email");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Email de verificação reenviado!");
      } else {
        toast.error(data.message || "Erro ao reenviar email");
      }
    } catch {
      toast.error("Erro ao reenviar email");
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = () => {
    router.push("/auth/signin");
  };

  if (isVerifying) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 text-center">
          <h1 className="font-display text-2xl font-bold italic text-foreground">
            Verificando Email
          </h1>
          <p className="mt-3 text-sm text-fg-muted">
            Aguarde enquanto verificamos seu email...
          </p>
          <div className="mt-6 flex justify-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
        </div>
      </main>
    );
  }

  if (verificationStatus === "success") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 text-center">
          <h1 className="font-display text-2xl font-bold italic text-accent">
            Email Verificado!
          </h1>
          <p className="mt-3 text-sm text-fg-muted">
            Sua conta foi ativada com sucesso. Você será redirecionado para a
            página de agradecimento.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                const thankYouUrl = `/auth/thank-you?verified=true&email=${encodeURIComponent(email)}`;
                router.push(thankYouUrl);
              }}
              className="gold-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
            >
              Ir para Agradecimento
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (verificationStatus === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8">
          <h1 className="font-display text-center text-2xl font-bold italic text-destructive">
            Erro na Verificação
          </h1>
          <p className="mt-3 text-center text-sm text-fg-muted">
            O link de verificação é inválido ou expirou. Solicite um novo
            email de verificação.
          </p>
          <div className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
            />
            <button
              onClick={resendVerificationEmail}
              disabled={isResending}
              className="gold-shimmer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90 disabled:opacity-50"
            >
              {isResending ? "Reenviando..." : "Reenviar Email de Verificação"}
            </button>
            <button
              onClick={goToLogin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8">
        <h1 className="font-display text-center text-2xl font-bold italic text-foreground">
          Verificação de Email
        </h1>
        <p className="mt-3 text-center text-sm text-fg-muted">
          Digite seu email para receber um novo link de verificação.
        </p>
        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
          />
          <button
            onClick={resendVerificationEmail}
            disabled={isResending}
            className="gold-shimmer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90 disabled:opacity-50"
          >
            {isResending ? "Reenviando..." : "Reenviar Email de Verificação"}
          </button>
          <button
            onClick={goToLogin}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
