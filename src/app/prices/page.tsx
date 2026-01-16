import Link from "next/link";
import { ArrowLeft, BadgePercent, Scissors } from "lucide-react";

const samplePrices = [
  { label: "Corte de Cabelo", price: "R$ 70,00", time: "30 min" },
  { label: "Barba Completa", price: "R$ 55,00", time: "25 min" },
  { label: "Combo Corte + Barba", price: "R$ 110,00", time: "50 min" },
  { label: "Pezinho / Acabamento", price: "R$ 35,00", time: "15 min" },
];

export default function PricesPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Tabela de preços</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Valores transparentes</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Os valores podem variar por barbeiro e promoções ativas. Agende para ver o preço final no seu perfil.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {samplePrices.map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-accent" />
              <h2 className="text-lg font-semibold">{item.label}</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Duração média: {item.time}</p>
            <p className="mt-3 text-xl font-bold text-foreground">{item.price}</p>
          </article>
        ))}

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <BadgePercent className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold">Quer economizar?</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Confira as ofertas em destaque ou aplique cupons válidos direto no agendamento.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/promotions" className="text-accent hover:text-accent/80">
              Ver promoções
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/scheduling" className="text-accent hover:text-accent/80">
              Agendar agora
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
