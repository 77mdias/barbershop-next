import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { getHomePageData } from "@/server/home/getHomePageData";

export default async function SalonsPage() {
  const data = await getHomePageData();
  const salons = data.salons.items;

  return (
    <main className="container mx-auto flex min-h-screen flex-col mt-8 gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Barbearias</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Encontre uma unidade</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Esses dados são demonstrativos. Escolha um card para ver mais detalhes e agendar.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {salons.map((salon, index) => (
          <article
            key={salon.id}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="relative">
              <Image
                src={salon.imageUrl}
                alt={salon.name}
                width={400}
                height={240}
                className="h-48 w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-foreground shadow">
                {salon.status === "OPEN" ? "Aberto" : salon.status === "CLOSING_SOON" ? "Fecha em breve" : "Fechado"}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{salon.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {salon.address}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {salon.ratingLabel ?? "—"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Distância simulada: {salon.distanceLabel ?? `${index + 1} km`}
              </p>
              <Link
                href={salon.href || `/salons/${salon.id}`}
                className="mt-auto inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent hover:text-accent/80"
              >
                Ver detalhes
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
