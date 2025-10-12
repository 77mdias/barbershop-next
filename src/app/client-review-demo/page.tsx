"use client";

import { useState, useEffect } from "react";
import { ClientReview } from "@/components/ClientReview";
import { getReviews } from "@/server/reviewActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Página de demonstração para o componente de avaliações de clientes
 * 
 * Esta página demonstra como usar o componente ClientReview
 * com dados mockados e dados reais do banco de dados.
 */
export default function ClientReviewDemo() {
  const [useRealData, setUseRealData] = useState(false);
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados reais do banco
  const loadRealReviews = async () => {
    setLoading(true);
    try {
      const result = await getReviews({
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      
      if (result.success && result.data?.reviews) {
        const clientReviewData = result.data.reviews.map((review: any) => ({
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
        
        setRealReviews(clientReviewData);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (useRealData) {
      loadRealReviews();
    }
  }, [useRealData]);

  return (
    <div className="min-h-screen mt-12 bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:py-6 md:py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
              🎨 Demo: Avaliações dos Clientes
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Demonstração do componente ClientReview com dados mockados e reais
            </p>
          </div>
        </div>
      </header>

      {/* Controls */}
      <section className="py-4 px-4 sm:py-6 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">⚙️ Controles de Demonstração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  variant={!useRealData ? "default" : "outline"}
                  onClick={() => setUseRealData(false)}
                  className="flex-1"
                >
                  📝 Dados Mockados
                </Button>
                <Button
                  variant={useRealData ? "default" : "outline"}
                  onClick={() => setUseRealData(true)}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "🔄 Carregando..." : "🔥 Dados Reais"}
                </Button>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Modo atual:</strong> {useRealData ? 
                    `Dados reais do banco (${realReviews.length} avaliações)` : 
                    "Dados mockados para demonstração"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Client Reviews Section */}
      <div className="-mx-4 sm:-mx-0">
        {useRealData && realReviews.length > 0 ? (
          <ClientReview reviews={realReviews} />
        ) : useRealData && realReviews.length === 0 && !loading ? (
          <section className="py-8 sm:py-12 md:py-16 px-4">
            <div className="container mx-auto max-w-md text-center space-y-4 sm:space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">📝</span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-slate-600">
                  Nenhuma avaliação encontrada
                </h2>
                <p className="text-sm sm:text-base text-slate-500">
                  Crie algumas avaliações no sistema para vê-las aqui!
                </p>
              </div>
              <a 
                href="/reviews" 
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir para Sistema de Avaliações
              </a>
            </div>
          </section>
        ) : (
          <ClientReview />
        )}
      </div>

      {/* Additional Info */}
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl text-center space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
            Quer fazer parte das nossas histórias de sucesso?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Agende seu horário e experimente o melhor atendimento da cidade. 
            Nossa equipe está pronta para transformar seu visual.
          </p>
          <a 
            href="/scheduling"
            className="inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Agendar Agora
          </a>
        </div>
      </section>
    </div>
  );
}