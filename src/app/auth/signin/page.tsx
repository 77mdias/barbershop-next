import { Suspense } from "react";
import SignInForm from "./components/SignInForm";
import Link from "next/link";
import { ArrowLeft, Scissors, Star, Users } from "lucide-react";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <main className="flex min-h-[calc(100vh-65px)] mt-[65px] bg-background text-foreground">
        {/* Left side — desktop only */}
        <div className="grain-overlay hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-1 p-12">
          <div className="type-3d-title text-foreground">
            Barber<span className="text-accent">Kings</span>
          </div>
          <div className="rhythm-3d-stack-xl">
            <div className="rhythm-3d-stack-md">
              <h2 className="type-3d-title text-foreground lg:text-4xl">
                A experiência premium que você merece
              </h2>
              <p className="type-3d-body-lg text-fg-muted">
                Agende com precisão, acompanhe em tempo real e eleve seu ritual de grooming.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Scissors, text: "Barbeiros certificados e experientes" },
                { icon: Star, text: "Avaliações reais da comunidade" },
                { icon: Users, text: "Agendamento fácil em poucos cliques" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="type-3d-meta flex items-center gap-3 text-fg-muted">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-[hsl(var(--accent)/0.4)]" />
            <span className="type-3d-meta text-fg-subtle">BarberKings · 2026</span>
          </div>
        </div>

        {/* Right side — form */}
        <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12">
          <div className="rhythm-3d-stack-md w-full max-w-sm">
            <Link
              href="/"
              className="type-3d-meta inline-flex items-center gap-2 font-semibold text-accent transition-colors hover:text-accent/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
            <span className="type-3d-label inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Entrar
            </span>
            <h1 className="type-3d-title text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="type-3d-body text-fg-muted">
              Acesse sua conta para gerenciar agendamentos e avaliações.{" "}
              <a href="/auth/signup" className="font-semibold text-accent hover:text-accent/80 transition-colors">
                Novo? Cadastre-se.
              </a>
            </p>
            <div className="pt-3d-sm">
              <SignInForm />
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
}
