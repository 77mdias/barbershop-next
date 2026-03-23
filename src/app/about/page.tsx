import Link from "next/link";
import { Award, Users, Sparkles } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeader } from "@/components/shared/SectionHeader";

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Nossa História"
        title="Sobre o BarberKings"
        subtitle="Construímos uma experiência de grooming premium com foco em precisão, conforto e relacionamento duradouro entre cliente e barbeiro."
        actions={[
          {
            label: "Agendar agora",
            href: "/scheduling",
          },
        ]}
      />

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Os pilares da experiência"
            subtitle="Cada ponto de contato foi pensado para transmitir presença, cuidado e consistência."
          />

          <div className="stagger-reveal mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Award,
                title: "Excelência",
                description:
                  "Execução refinada, curadoria de serviços e acabamento consistente em cada atendimento.",
              },
              {
                icon: Sparkles,
                title: "Conforto",
                description:
                  "Atmosfera acolhedora, navegação clara e jornadas que reduzem atrito do agendamento ao pós-atendimento.",
              },
              {
                icon: Users,
                title: "Comunidade",
                description:
                  "Uma rede de clientes, barbeiros e experiências compartilhadas que valoriza recorrência e confiança.",
              },
            ].map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="card-hover group rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.16)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-2xl font-bold italic text-foreground">{value.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-fg-muted">{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface-1 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="card-hover rounded-2xl border border-border bg-surface-card p-6 lg:p-8">
              <SectionHeader
                title="Missão e equipe"
                subtitle="Nossa missão é elevar o atendimento masculino com design, técnica e hospitalidade. O time atua de forma coordenada para manter padrão visual e operacional em todas as etapas."
                centered={false}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  "Curadoria de serviços com foco em resultado e clareza de preço.",
                  "Ambiente premium com comunicação simples e acolhedora.",
                  "Atendimento pensado para recorrência, fidelização e conveniência.",
                  "Evolução contínua baseada em feedback e dados de uso.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-border bg-surface-1 p-4 text-sm leading-relaxed text-fg-muted"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <aside className="card-hover rounded-2xl border border-border bg-surface-card p-6 lg:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                  <Users className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-display text-2xl font-bold italic text-foreground">
                    Atendimento com presença
                  </h3>
                  <p className="text-sm leading-relaxed text-fg-muted">
                    A proposta da plataforma é dar ao cliente a mesma sensação de cuidado que ele espera da barbearia:
                    ritual, precisão e resposta rápida quando precisa de ajuda.
                  </p>
                  <Link
                    href="/scheduling"
                    className="gold-shimmer inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
                  >
                    Agendar atendimento
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
