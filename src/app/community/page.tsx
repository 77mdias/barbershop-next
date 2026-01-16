import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function CommunityPage() {
  return (
    <main className="container mt-8 mx-auto flex min-h-screen flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Home
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">Comunidade</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Em breve: espaço para a comunidade</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Estamos preparando fóruns, dicas de estilo e eventos exclusivos para clientes e barbeiros. Enquanto isso,
          continue explorando os serviços e promoções disponíveis.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Quer falar com a gente?</h2>
            <p className="text-sm text-muted-foreground">
              Use o chat ou as avaliações para compartilhar feedback. Avisaremos quando a área da comunidade estiver
              liberada.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/chat" className="text-accent hover:text-accent/80">
                Ir para o chat
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/reviews" className="text-accent hover:text-accent/80">
                Enviar feedback
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
