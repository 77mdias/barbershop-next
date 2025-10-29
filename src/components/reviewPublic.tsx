"use client";

import { getPublicReviews } from "@/server/reviewActions";
import { useState, useEffect } from "react";
import { ClientReview } from "@/components/ClientReview";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewPublic() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Carregar avaliações reais do banco
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const result = await getPublicReviews(6);

        if (result.success && result.data) {
          // Os dados já vêm formatados da função getPublicReviews
          const clientReviewData = result.data.map((review: any) => ({
            id: review.id,
            mainImage: review.images[0] || "/images/salon1.svg",
            overlayImage: review.images[1] || "/images/salon2.svg",
            testimonial: review.comment || "Excelente serviço!",
            clientName: review.name,
            clientTitle: "Cliente",
            clientCompany: review.service,
            rating: review.rating,
            serviceDate: review.date,
            serviceType: review.service,
          }));

          setReviews(clientReviewData);
        } else {
          console.error("Erro ao carregar avaliações:", result.error);
          setReviews([]);
        }
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
        // Em caso de erro, usar dados fallback vazios
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, []);

  return (
    <div className="container mx-auto px-4">
      {/* Avaliações dos Clientes - Modo Público */}
      {!reviewsLoading && reviews.length > 0 && (
        <section className="my-8 -mx-4 sm:-mx-6">
          {/* Header da seção */}
          <div className="px-4 sm:px-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[--text]">
                💬 Avaliações dos Clientes
              </h2>
              <a
                href="/reviews"
                className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
              >
                Ver todas
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {reviews.length > 0
                ? `${reviews.length} avaliações reais de nossos clientes`
                : "Veja o que nossos clientes estão falando"}
            </p>
          </div>

          {/* Componente ClientReview */}
          <ClientReview reviews={reviews} />
        </section>
      )}

      {/* Estado vazio para avaliações */}
      {!reviewsLoading && reviews.length === 0 && (
        <section className="my-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[--text]">
              💬 Avaliações dos Clientes
            </h2>
            <a
              href="/reviews"
              className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
            >
              Ver todas
            </a>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">⭐</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Primeiras avaliações em breve!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Seja um dos primeiros a deixar sua opinião sobre nossos serviços.
            </p>
            <a
              href="/reviews"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ver avaliações →
            </a>
          </div>
        </section>
      )}

      {/* Loading state para avaliações */}
      {reviewsLoading && (
        <section className="my-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[--text]">
              Avaliações dos Clientes
            </h2>
          </div>
          <div className="bg-muted rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <Skeleton className="w-16 h-16 rounded-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
