"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [hasResent, setHasResent] = useState(false);

  const emailParam = searchParams?.get("email");
  const verified = searchParams?.get("verified") === "true";

  // Preencher email se fornecido na URL
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

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
        setHasResent(true);
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold italic text-foreground">
            {verified
              ? "Email Verificado com Sucesso!"
              : "Conta Criada com Sucesso!"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            {verified
              ? "Sua conta foi ativada! Agora você pode fazer login e começar a usar nossa plataforma."
              : "Obrigado por se cadastrar em nossa plataforma. Para começar a usar sua conta, verifique seu email."}
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {/* Informações sobre o email */}
          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Email de verificação enviado
                </p>
                <p className="mt-1 text-xs text-fg-muted">
                  Verifique sua caixa de entrada e spam
                </p>
              </div>
            </div>
          </div>

          {/* Email do usuário */}
          {email && (
            <div className="text-center">
              <p className="text-sm text-fg-muted">Email:</p>
              <p className="font-medium text-foreground">{email}</p>
            </div>
          )}

          {/* Instruções */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Próximos passos:</h4>
            <div className="space-y-2 text-sm text-fg-muted">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-on-accent">
                  1
                </span>
                <span>Abra o email que enviamos para você</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-on-accent">
                  2
                </span>
                <span>Clique no botão &quot;Verificar Email&quot;</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-on-accent">
                  3
                </span>
                <span>Faça login e comece a usar sua conta</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <button
              onClick={resendVerificationEmail}
              disabled={isResending || hasResent}
              className="gold-shimmer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90 disabled:opacity-50"
            >
              {isResending
                ? "Reenviando..."
                : hasResent
                  ? "Email Reenviado"
                  : "Reenviar Email"}
            </button>

            <button
              onClick={goToLogin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
            >
              Ir para Login
            </button>
          </div>

          {/* Link para voltar */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
