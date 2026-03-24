import Link from "next/link";
import { Camera, Sparkles, Users, ArrowRight } from "lucide-react";
import { CortesGallerySection } from "@/components/cortes-gallery";
import { PageHero } from "@/components/shared/PageHero";

/**
 * Página dedicada à galeria de cortes da barbershop
 *
 * Exibe uma coleção organizada de trabalhos realizados,
 * seguindo o padrão de design da aplicação.
 */
export default function GalleryPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Inspiração"
        title="Galeria de Estilos"
        subtitle="Uma curadoria editorial dos melhores cortes, texturas e acabamentos para orientar sua próxima visita."
        actions={[
          { label: "Agendar agora", href: "/scheduling" },
          { label: "Ver promoções", href: "/promotions", variant: "outline" },
        ]}
      >
        <div className="grid w-full gap-3 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Seleção editorial",
              description: "Visual refinado com cortes que destacam precisão e presença.",
            },
            {
              icon: Camera,
              title: "Referências reais",
              description: "Imagens pensadas para facilitar a escolha do próximo estilo.",
            },
            {
              icon: Users,
              title: "Preferidos da casa",
              description: "Os looks mais pedidos pelos clientes e barbeiros da barbearia.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="card-hover rounded-2xl border border-border bg-surface-card p-4 text-left shadow-[0_16px_40px_-24px_rgba(0,0,0,0.16)]"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold italic text-foreground">{item.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-fg-muted">{item.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </PageHero>

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="rounded-[2rem] border border-border bg-surface-card p-3 shadow-[0_28px_80px_-32px_rgba(0,0,0,0.2)] sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Curadoria visual
              </p>
              <h2 className="font-display text-2xl font-bold italic text-foreground sm:text-3xl">
                Cortes que contam histórias
              </h2>
              <p className="max-w-2xl text-sm text-fg-muted sm:text-base">
                Explore a seleção completa abaixo e use a estética como ponto de partida para o seu próximo agendamento.
              </p>
            </div>

            <Link
              href="/reviews"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
            >
              Ver avaliações
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <CortesGallerySection />
        </div>
      </section>
    </main>
  );
}
