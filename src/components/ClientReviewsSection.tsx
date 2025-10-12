import { getReviews } from "@/server/reviewActions";
import { ClientReview } from "@/components/ClientReview";

export async function ClientReviewsSection() {
  let reviews: any[] = [];
  
  try {
    // Buscar avaliações públicas (sem autenticação necessária)
    const result = await getReviews({
      limit: 5,
      sortBy: "createdAt",
      sortOrder: "desc"
    });
    
    if (result.success && result.data?.reviews) {
      reviews = result.data.reviews.map((review: any) => ({
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
    }
  } catch (error) {
    console.error('Erro ao carregar avaliações para homepage:', error);
    // Em caso de erro, retorna array vazio para não quebrar a página
    reviews = [];
  }

  // Se não houver avaliações, não renderiza a seção
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="my-8 -mx-4 sm:-mx-6">
      {/* Header da seção */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[--text]">Avaliações dos Clientes</h2>
          <a 
            href="/reviews"
            className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
          >
            Ver todas
          </a>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Veja o que nossos clientes estão falando
        </p>
      </div>
      
      {/* Componente ClientReview */}
      <ClientReview reviews={reviews} />
    </section>
  );
}