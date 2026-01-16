import Link from "next/link";
import { ArrowLeft, Scissors } from "lucide-react";

type ServiceDetailsPageProps = {
  params: { id: string };
};

export default function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Serviço</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Detalhes do serviço</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Esta página é demonstrativa para evitar erros de navegação. Para ver valores e duração, acesse o fluxo de
          agendamento.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Scissors className="h-4 w-4 text-accent" />
          ID do serviço: {params.id}
        </div>
        <p className="text-sm text-muted-foreground">
          Agende para visualizar horários, barbeiros disponíveis e preços atualizados.
        </p>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/scheduling" className="text-accent hover:text-accent/80">
            Agendar agora
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/promotions" className="text-accent hover:text-accent/80">
            Ver promoções
          </Link>
        </div>
      </section>
    </main>
  );
}
