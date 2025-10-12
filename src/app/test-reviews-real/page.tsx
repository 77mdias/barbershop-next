import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReviews } from "@/server/reviewActions";
import { ClientReview } from "@/components/ClientReview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReviewsTestPage() {
  // Verificar autenticação
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Buscar avaliações reais do banco
  const reviewsResult = await getReviews({
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const reviews = reviewsResult.success ? reviewsResult.data?.reviews || [] : [];

  // Converter avaliações para o formato do ClientReview
  const clientReviewData = reviews.map((review: any, index: number) => ({
    id: review.id,
    mainImage: review.images[0] || "/images/salon1.svg",
    overlayImage: review.images[1] || "/images/salon2.svg", 
    testimonial: review.feedback || "Excelente serviço!",
    clientName: review.user.name,
    clientTitle: "Cliente",
    clientCompany: review.service.name,
    rating: review.rating,
    serviceDate: review.completedAt,
    serviceType: review.service.name
  }));

  return (
    <div className="min-h-screen mt-12 bg-white">
      {/* Header - Mobile First */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:py-6 md:py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-2 sm:space-y-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
              🔥 Sistema de Avaliações Real
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto">
              Testando integração com dados reais do banco de dados
            </p>
          </div>
        </div>
      </header>

      {/* Status Cards - Mobile First Grid */}
      <section className="py-4 px-4 sm:py-6 md:py-8 bg-slate-50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Card 1 - Usuário */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2 px-3 sm:px-4">
                <CardTitle className="text-xs sm:text-sm text-slate-600 font-medium">
                  👤 Usuário Logado
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 truncate">
                  {session.user?.email}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Role: {session.user?.role}
                </p>
              </CardContent>
            </Card>

            {/* Card 2 - Avaliações */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2 px-3 sm:px-4">
                <CardTitle className="text-xs sm:text-sm text-slate-600 font-medium">
                  📊 Avaliações Encontradas
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {reviews.length}
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  {reviews.length > 0 ? "Dados reais do banco" : "Nenhuma avaliação"}
                </p>
              </CardContent>
            </Card>

            {/* Card 3 - Status */}
            <Card className="bg-white shadow-sm sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2 px-3 sm:px-4">
                <CardTitle className="text-xs sm:text-sm text-slate-600 font-medium">
                  ⚡ Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <p className="text-base sm:text-lg font-bold text-green-600">
                  ✅ Funcionando
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  Todas as APIs conectadas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Client Reviews Section - Mobile First */}
      {clientReviewData.length > 0 ? (
        <section className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Section Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8 space-y-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                🌟 Avaliações Reais dos Clientes
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
                Dados vindos diretamente do banco de dados
              </p>
            </div>
            
            {/* ClientReview Component */}
            <ClientReview reviews={clientReviewData} />
          </div>
        </section>
      ) : (
        <section className="py-8 sm:py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-md text-center space-y-4 sm:space-y-6">
            {/* Empty State */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">📝</span>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-600">
                Nenhuma avaliação encontrada
              </h2>
              <p className="text-sm sm:text-base text-slate-500">
                Crie algumas avaliações para vê-las aqui!
              </p>
            </div>
            
            <a 
              href="/reviews" 
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors min-w-[140px]"
            >
              Ir para Sistema de Avaliações
            </a>
          </div>
        </section>
      )}

      {/* Debug Section - Mobile First */}
      <section className="py-4 sm:py-6 md:py-8 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-white shadow-sm">
            <CardHeader className="px-3 sm:px-4 md:px-6">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                🔍 Informações de Debug
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
              
              {/* Server Actions Status */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  Server Actions Status:
                </h3>
                <div className="bg-green-50 p-2 sm:p-3 rounded-md">
                  <p className="text-xs sm:text-sm text-green-700">
                    ✅ getReviews() - {reviewsResult.success ? 'Sucesso' : 'Erro: ' + reviewsResult.error}
                  </p>
                </div>
              </div>
              
              {/* Primeira Avaliação - Mobile Optimized */}
              {reviews.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                    Primeira Avaliação:
                  </h3>
                  <div className="bg-slate-100 p-2 sm:p-3 rounded-md overflow-hidden">
                    <pre className="text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(reviews[0], null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Links Úteis - Mobile Grid */}
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  🔗 Links Úteis:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  
                  <a 
                    href="/reviews" 
                    className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
                  >
                    <div className="text-xs sm:text-sm font-medium text-blue-800 group-hover:text-blue-900">
                      🏢 Sistema Completo
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Interface completa de avaliações
                    </div>
                  </a>
                  
                  <a 
                    href="/test-upload" 
                    className="block p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group"
                  >
                    <div className="text-xs sm:text-sm font-medium text-orange-800 group-hover:text-orange-900">
                      📸 Teste Upload
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Sistema de upload de imagens
                    </div>
                  </a>
                  
                  <a 
                    href="/client-review-demo" 
                    className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group sm:col-span-2 lg:col-span-1"
                  >
                    <div className="text-xs sm:text-sm font-medium text-purple-800 group-hover:text-purple-900">
                      🎨 Demo ClientReview
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      Demonstração com dados mock
                    </div>
                  </a>
                  
                </div>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}