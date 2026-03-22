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
      <main className="flex min-h-screen bg-background text-foreground">
        {/* Left side — desktop only */}
        <div className="grain-overlay hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-1 p-12">
          <div className="font-display text-3xl font-bold italic text-foreground">
            Barber<span className="text-accent">Kings</span>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-4xl font-bold italic text-foreground">
                A experiência premium que você merece
              </h2>
              <p className="mt-4 text-base leading-relaxed text-fg-muted">
                Agende com precisão, acompanhe em tempo real e eleve seu ritual de grooming.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Scissors, text: "Barbeiros certificados e experientes" },
                { icon: Star, text: "Avaliações reais da comunidade" },
                { icon: Users, text: "Agendamento fácil em poucos cliques" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-fg-muted">
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
            <span className="text-xs text-fg-subtle">BarberKings · 2026</span>
          </div>
        </div>

        {/* Right side — form */}
        <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Entrar
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold italic text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Acesse sua conta para gerenciar agendamentos e avaliações.
            </p>
            <div className="mt-8">
              <SignInForm />
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
}
