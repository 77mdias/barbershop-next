import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Termos</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Termos de Uso (versão demo)</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Conteúdo institucional para navegação segura. As políticas completas são fornecidas no ambiente de produção.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Transparência e privacidade
        </div>
        <p>
          • Reservamo-nos o direito de ajustar funcionalidades e conteúdos sem aviso prévio nesta versão demonstrativa.
        </p>
        <p>• Dados sensíveis não são coletados neste ambiente; informações exibidas podem ser fictícias.</p>
        <p>• Agendamentos e pagamentos reais devem ser realizados apenas em ambientes autorizados.</p>
        <Link href="/legal/privacy" className="text-accent font-semibold hover:text-accent/80">
          Ler política de privacidade
        </Link>
      </section>
    </main>
  );
}
