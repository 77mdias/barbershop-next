export interface ClientReviewData {
  id: string;
  mainImage: string;
  overlayImage: string;
  testimonial: string;
  clientName: string;
  clientTitle: string;
  clientCompany: string;
  rating?: number; // Para futuras funcionalidades de estrelas
  serviceDate?: string; // Para mostrar quando o serviço foi realizado
  serviceType?: string; // Tipo de serviço (corte, barba, etc.)
}

export interface ClientReviewProps {
  reviews?: ClientReviewData[];
  className?: string;
  autoPlay?: boolean; // Para rotação automática
  autoPlayInterval?: number; // Intervalo da rotação automática em ms
}

export interface ReviewNavigationProps {
  currentIndex: number;
  totalReviews: number;
  onNext: () => void;
  onPrevious: () => void;
  onGoToSlide: (index: number) => void;
}
