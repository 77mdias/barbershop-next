import { ClientReview } from "@/components/ClientReview";

/**
 * Página de demonstração para o componente de avaliações de clientes
 * 
 * Esta página demonstra como usar o componente ClientReview
 * com dados mockados para visualizar avaliações de clientes.
 */
export default function ClientReviewDemo() {
  return (
    <div className="min-h-screen mt-12 bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 text-center">
            Avaliações dos Nossos Clientes
          </h1>
          <p className="text-slate-600 text-center mt-2 md:mt-4 text-base md:text-lg max-w-2xl mx-auto">
            Veja o que nossos clientes estão falando sobre nossos serviços
          </p>
        </div>
      </header>

      {/* Client Reviews Section */}
      <ClientReview />

      {/* Additional Info */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">
            Quer fazer parte das nossas histórias de sucesso?
          </h2>
          <p className="text-slate-600 mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base">
            Agende seu horário e experimente o melhor atendimento da cidade. 
            Nossa equipe está pronta para transformar seu visual.
          </p>
          <a 
            href="/scheduling"
            className="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Agendar Agora
          </a>
        </div>
      </section>
    </div>
  );
}