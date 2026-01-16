import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
import { getHomePageData } from "@/server/home/getHomePageData";

export default async function PromotionsPage() {
  const data = await getHomePageData();
  const promotions = data.promotions.items;

  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 mt-8 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Promoções</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Ofertas e cupons ativos</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Aplique os códigos no agendamento para garantir desconto. As datas de validade são atualizadas
          automaticamente.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <article key={promo.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <Gift className="h-4 w-4 text-accent" />
              <span>{promo.badgeLabel}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-foreground">{promo.title}</h2>
            {promo.description && <p className="mt-1 text-sm text-muted-foreground">{promo.description}</p>}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
              {promo.code}
            </div>
            {promo.expiresLabel && <p className="mt-2 text-xs text-muted-foreground">{promo.expiresLabel}</p>}
            <Link
              href="/scheduling"
              className="mt-4 inline-flex text-sm font-semibold text-accent hover:text-accent/80"
            >
              Usar agora
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
