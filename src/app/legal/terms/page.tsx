import Link from "next/link";
import { ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";

export default function TermsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Legal"
        title="Termos de Uso"
        subtitle="Transparência e clareza sobre o uso da plataforma BarberKings."
        actions={[{ label: "Voltar para a Home", href: "/" }]}
      />

      <section className="bg-surface-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6">
            <article className="rounded-2xl border border-border bg-surface-card p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold italic text-foreground">
                  Transparência e privacidade
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
                <p>Reservamo-nos o direito de ajustar funcionalidades e conteúdos sem aviso prévio nesta versão demonstrativa.</p>
                <p>Dados sensíveis não são coletados neste ambiente; informações exibidas podem ser fictícias.</p>
                <p>Agendamentos e pagamentos reais devem ser realizados apenas em ambientes autorizados.</p>
              </div>
            </article>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/legal/privacy"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
              >
                <FileText className="h-4 w-4" />
                Política de Privacidade
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/legal/cookies"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
              >
                <FileText className="h-4 w-4" />
                Política de Cookies
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
