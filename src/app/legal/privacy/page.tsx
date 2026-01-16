import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Privacidade</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Política de Privacidade (versão demo)</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Este ambiente não coleta dados reais. A política completa está disponível no ambiente de produção.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Lock className="h-4 w-4 text-accent" />
          Segurança e dados
        </div>
        <p>• Logs e métricas exibidos aqui são apenas para demonstração.</p>
        <p>• Não armazenamos informações financeiras neste ambiente.</p>
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
