import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeader } from "@/components/shared/SectionHeader";

export default function CommunityPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Em Breve"
        title="Comunidade BarberKings"
        subtitle="Um espaço editorial para inspiração, conversa e eventos exclusivos. A experiência está sendo lapidada para o próximo lançamento."
        actions={[
          { label: "Ir para o chat", href: "/chat" },
          { label: "Ler avaliações", href: "/reviews", variant: "outline" },
        ]}
      >
        <div className="grid w-full gap-3 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Curadoria de estilo",
              description: "Conteúdo selecionado com referências, inspirações e novidades da barbearia.",
            },
            {
              icon: Users,
              title: "Conversa entre clientes",
              description: "Fóruns e trocas pensados para quem quer compartilhar experiências reais.",
            },
            {
              icon: Calendar,
              title: "Eventos exclusivos",
              description: "Encontros e lançamentos para quem acompanha as novidades de perto.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="card-hover rounded-2xl border border-border bg-surface-card p-4 text-left"
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
        <SectionHeader
          title="Enquanto isso, os canais ativos seguem disponíveis"
          subtitle="Use o chat e as avaliações para conversar com a equipe e compartilhar feedback."
          centered={false}
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <article className="card-hover rounded-[2rem] border border-border bg-surface-card p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.12)] text-accent">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Participação imediata</p>
                <h2 className="font-display text-2xl font-bold italic text-foreground">
                  Converse agora e acompanhe o que está acontecendo
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-base">
                  O chat e as avaliações já funcionam como os pontos de contato principais enquanto a comunidade é
                  construída.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/chat"
                    className="group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 gold-shimmer hover:bg-accent/90"
                  >
                    Abrir chat
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/reviews"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    Ver reviews
                  </Link>
                </div>
              </div>
            </div>
          </article>

          <aside className="card-hover rounded-[2rem] border border-border bg-surface-1 p-6 sm:p-8">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Status da feature
                </div>
                <h3 className="font-display text-2xl font-bold italic text-foreground">
                  Lançamento guiado por feedback real
                </h3>
                <p className="text-sm leading-relaxed text-fg-muted">
                  As próximas etapas serão validadas com base nos fluxos já ativos, mantendo a experiência consistente.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-surface-card p-4">
                {[
                  "Discussões sobre estilo e manutenção",
                  "Eventos para clientes e barbeiros",
                  "Conteúdo editorial e recomendações",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 rounded-[2rem] border border-border bg-surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Próximo passo</p>
              <h2 className="font-display text-2xl font-bold italic text-foreground sm:text-3xl">
                Quer continuar no fluxo principal?
              </h2>
              <p className="max-w-2xl text-sm text-fg-muted sm:text-base">
                Agende seu atendimento e acompanhe a experiência mais completa da plataforma.
              </p>
            </div>

            <Link
              href="/scheduling"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-all duration-300 gold-shimmer hover:bg-accent/90"
            >
              Ir para agendamentos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
