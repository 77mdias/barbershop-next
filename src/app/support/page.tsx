import Link from "next/link";
import { ArrowLeft, Headphones } from "lucide-react";

export default function SupportPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Suporte</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Central de Ajuda</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Precisa de ajuda com agendamentos, pagamentos ou conta? Fale com nosso time ou consulte as perguntas
          frequentes.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Atendimento rápido</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Envie sua dúvida e retornaremos em minutos durante o horário comercial.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
            <Headphones className="h-4 w-4" />
            suporte@barberkings.com
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Veja orientações sobre reagendamentos, cancelamentos e pagamentos.
          </p>
          <Link href="/scheduling" className="mt-3 inline-flex text-sm font-semibold text-accent hover:text-accent/80">
            Ir para agendamentos
          </Link>
        </article>
      </section>
    </main>
  );
}
