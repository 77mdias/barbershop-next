import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeader } from "@/components/shared/SectionHeader";

const supportContacts = [
  {
    icon: Mail,
    title: "E-mail",
    value: "suporte@barberkings.com",
    description: "Para dúvidas mais detalhadas e acompanhamento de solicitações.",
    href: "mailto:suporte@barberkings.com",
  },
  {
    icon: Phone,
    title: "Telefone",
    value: "+55 (11) 99999-0000",
    description: "Atendimento humano durante o horário comercial.",
    href: "tel:+5511999990000",
  },
  {
    icon: MessageCircle,
    title: "Chat",
    value: "Abrir conversa",
    description: "Use o fluxo de chat para respostas rápidas e acompanhamento.",
    href: "/chat",
  },
];

const supportFaqs = [
  {
    question: "Como faço para reagendar um atendimento?",
    answer:
      "Entre em agendamentos, escolha o horário disponível e confirme a alteração no próprio fluxo. O processo mantém o mesmo padrão visual do restante da plataforma.",
  },
  {
    question: "Onde vejo meus serviços e histórico?",
    answer:
      "As informações principais ficam no perfil e no fluxo de atendimento. Se precisar de ajuda para localizar algo, fale com o suporte.",
  },
  {
    question: "Posso falar com a equipe antes de agendar?",
    answer:
      "Sim. O chat e as avaliações são os canais mais rápidos para tirar dúvidas antes de confirmar o horário.",
  },
  {
    question: "Como acompanho promoções válidas?",
    answer:
      "A página de promoções reúne os cupons e ofertas vigentes. Se uma oferta estiver ativa, ela também aparece durante o agendamento.",
  },
];

export default function SupportPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Suporte"
        title="Central de Ajuda"
        subtitle="Ajuda direta para agendamentos, conta, pagamentos e dúvidas operacionais. Mantemos o mesmo padrão editorial da experiência principal."
        actions={[
          { label: "Ir para agendamentos", href: "/scheduling" },
          { label: "Abrir chat", href: "/chat", variant: "outline" },
        ]}
      >
        <div className="grid w-full gap-3 sm:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              title: "Resposta humana",
              description: "Fale com a equipe durante o horário comercial e siga com o atendimento.",
            },
            {
              icon: Clock3,
              title: "Fluxo rápido",
              description: "Canal direto para resolver questões de agendamento com menos etapas.",
            },
            {
              icon: ShieldCheck,
              title: "Informação segura",
              description: "Orientações claras para conta, pagamentos e alterações de horário.",
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
          title="Canais de contato"
          subtitle="Escolha o canal mais apropriado para o tipo de suporte que você precisa."
          centered={false}
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {supportContacts.map((contact) => {
            const Icon = contact.icon;

            return (
              <article
                key={contact.title}
                className="card-hover rounded-[2rem] border border-border bg-surface-card p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.12)] text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{contact.title}</p>
                    <h2 className="font-display text-2xl font-bold italic text-foreground">{contact.value}</h2>
                    <p className="text-sm leading-relaxed text-fg-muted">{contact.description}</p>
                    <Link
                      href={contact.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                    >
                      Entrar em contato
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12 lg:pb-16">
        <SectionHeader
          title="Perguntas frequentes"
          subtitle="Respostas objetivas para os tópicos que mais aparecem no suporte."
          centered={false}
        />

        <div className="mt-8 space-y-4">
          {supportFaqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[2rem] border border-border bg-surface-card p-6 card-hover"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-display text-xl font-semibold italic text-foreground sm:text-2xl">
                  {faq.question}
                </span>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-1 text-accent transition-transform duration-300 group-open:rotate-180">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-fg-muted sm:text-base">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-[2rem] border border-border bg-surface-1 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Fluxo recomendado</p>
              <h2 className="font-display text-2xl font-bold italic text-foreground sm:text-3xl">
                Precisa resolver algo agora?
              </h2>
              <p className="max-w-2xl text-sm text-fg-muted sm:text-base">
                Acesse o fluxo de agendamento para revisar horários, serviços e confirmações em um só lugar.
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
