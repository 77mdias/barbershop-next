import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiesPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Cookies</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Preferências de Cookies (demo)</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Utilizamos apenas cookies essenciais neste ambiente de demonstração. Configurações adicionais são exibidas no
          ambiente de produção.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Cookie className="h-4 w-4 text-accent" />
          Controle e transparência
        </div>
        <p>• Cookies de sessão são usados para manter navegação básica.</p>
        <p>• Não utilizamos rastreamento de terceiros nesta versão.</p>
        <p>
          • Para dúvidas, fale conosco pela{" "}
          <Link href="/support" className="text-accent hover:text-accent/80">
            Central de Ajuda
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
