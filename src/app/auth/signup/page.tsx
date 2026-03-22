import { Suspense } from "react";
import SignUpForm from "./components/SignUpForm";
import Link from "next/link";
import { ArrowLeft, Scissors, Star, Users } from "lucide-react";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <main className="flex min-h-screen bg-background text-foreground">
        <div className="grain-overlay hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-1 p-12">
          <div className="font-display text-3xl font-bold italic text-foreground">
            Barber<span className="text-accent">Kings</span>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-4xl font-bold italic text-foreground">
                Faça parte da comunidade premium
              </h2>
              <p className="mt-4 text-base leading-relaxed text-fg-muted">
                Crie sua conta e tenha acesso à melhor experiência de barbearia da cidade.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Scissors, text: "Acesso a barbeiros especializados" },
                { icon: Star, text: "Histórico completo de atendimentos" },
                { icon: Users, text: "Comunidade exclusiva de clientes" },
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
              Cadastro
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold italic text-foreground">
              Crie sua conta
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Preencha os dados abaixo para começar a usar a plataforma.
            </p>
            <div className="mt-8">
              <SignUpForm />
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
}
