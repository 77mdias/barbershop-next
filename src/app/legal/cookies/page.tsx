import Link from "next/link";
import { Cookie, FileText, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";

export default function CookiesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Legal"
        title="Preferências de Cookies"
        subtitle="Utilizamos apenas cookies essenciais neste ambiente de demonstração."
        actions={[{ label: "Voltar para a Home", href: "/" }]}
      />

      <section className="bg-surface-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6">
            <article className="rounded-2xl border border-border bg-surface-card p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                  <Cookie className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold italic text-foreground">
                  Controle e transparência
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
                <p>Cookies de sessão são usados para manter navegação básica.</p>
                <p>Não utilizamos rastreamento de terceiros nesta versão.</p>
                <p>
                  Para dúvidas, fale conosco pela{" "}
                  <Link href="/support" className="font-semibold text-accent hover:text-accent/80">
                    Central de Ajuda
                  </Link>
                  .
                </p>
              </div>
            </article>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/legal/terms"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
              >
                <FileText className="h-4 w-4" />
                Termos de Uso
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/legal/privacy"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
              >
                <FileText className="h-4 w-4" />
                Política de Privacidade
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
