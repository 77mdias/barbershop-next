import Link from "next/link";
import { ArrowLeft, HeartHandshake } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Sobre</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Quem somos</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Plataforma de agendamentos e relacionamento entre barbeiros e clientes, com dashboards em tempo real,
          promoções e avaliações.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <HeartHandshake className="h-4 w-4 text-accent" />
          Experiência pensada para a primeira impressão
        </div>
        <p className="text-sm text-muted-foreground">
          Esta página é uma prévia institucional. Para saber mais ou falar com o time, acesse a Central de Ajuda.
        </p>
        <Link href="/support" className="text-sm font-semibold text-accent hover:text-accent/80">
          Falar com o suporte
        </Link>
      </section>
    </main>
  );
}
