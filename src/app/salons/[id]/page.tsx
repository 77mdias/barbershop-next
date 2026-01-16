import Link from "next/link";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { getHomePageData } from "@/server/home/getHomePageData";

type SalonDetailsPageProps = {
  params: { id: string };
};

export default async function SalonDetailsPage({ params }: SalonDetailsPageProps) {
  const data = await getHomePageData();
  const salons = data.salons.items;
  const salon =
    salons.find((item) => item.id === params.id) ??
    salons.find((item) => item.id === `fallback-${params.id}`) ??
    salons.find((item) => item.id === `salon-${params.id}`);

  const name = salon?.name ?? "Barbearia em destaque";

  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/salons" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Salões
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Detalhes do salão</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{name}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Página demonstrativa para navegação segura. Os detalhes completos e agendamentos são exibidos no fluxo
          autenticado.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{salon?.address ?? "Endereço será exibido aqui"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-accent fill-accent" />
          <span>{salon?.ratingLabel ?? "Avaliações em breve"}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Status:{" "}
          <span className="font-semibold text-foreground">
            {salon?.status === "OPEN" ? "Aberto" : salon?.status === "CLOSING_SOON" ? "Fecha em breve" : "Fechado"}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/scheduling" className="text-accent font-semibold hover:text-accent/80">
            Agendar neste salão
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/" className="text-accent font-semibold hover:text-accent/80">
            Voltar para a Home
          </Link>
        </div>
      </section>
    </main>
  );
}
