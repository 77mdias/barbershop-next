"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Edit,
  Trash2,
  Calendar,
  User,
  DollarSign,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getReviews,
  deleteReview,
  getReviewStats,
} from "@/server/reviewActions";
import { ReviewForm } from "@/components/ReviewForm";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ReviewsListSkeleton } from "@/components/ui/review-skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Review {
  id: string;
  rating: number | null;
  feedback: string | null;
  images: string[];
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  finalPrice: number;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  service: {
    id: string;
    name: string;
    description: string | null;
    price: number;
  };
  appointments: Array<{
    barber: {
      id: string;
      name: string;
      image: string | null;
    };
  }>;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
}

interface ReviewsListProps {
  userId?: string;
  serviceId?: string;
  barberId?: string;
  showActions?: boolean;
  showStats?: boolean;
  limit?: number;
}

export function ReviewsList({
  userId,
  serviceId,
  barberId,
  showActions = true,
  showStats = true,
  limit = 10,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [expandedImages, setExpandedImages] = useState<Record<string, boolean>>(
    {}
  );

  const loadReviews = async () => {
    setLoading(true);
    try {
      const result = await getReviews({
        userId,
        serviceId,
        barberId,
        page: currentPage,
        limit,
      });

      if (result.success && result.data) {
        setReviews(result.data.reviews);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        toast.error("Erro ao carregar avaliações");
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      toast.error("Erro inesperado ao carregar avaliações");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!showStats) return;

    try {
      const result = await getReviewStats(serviceId, barberId);
      if (result.success && result.data) {
        setStats(result.data as ReviewStats);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [currentPage, userId, serviceId, barberId]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) {
      return;
    }

    try {
      const result = await deleteReview({ id: reviewId });
      if (result.success) {
        toast.success("Avaliação excluída com sucesso!");
        loadReviews();
        loadStats();
      } else {
        toast.error(result.error || "Erro ao excluir avaliação");
      }
    } catch (error) {
      console.error("Erro ao excluir avaliação:", error);
      toast.error("Erro inesperado ao excluir avaliação");
    }
  };

  const handleEditSuccess = () => {
    setEditingReview(null);
    loadReviews();
    loadStats();
  };

  const toggleImageExpanded = (reviewId: string) => {
    setExpandedImages((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  const renderStats = () => {
    if (!showStats || !stats) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estatísticas das Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Number(stats.averageRating).toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <p className="text-sm text-gray-600">
                Baseado em {stats.totalReviews} avaliações
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                Distribuição de Avaliações
              </h4>
              {stats.ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-2">
                  <span className="text-sm w-4">{item.rating}</span>
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${(item.count / stats.totalReviews) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (editingReview) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setEditingReview(null)}
          className="mb-4"
        >
          ← Voltar para a lista
        </Button>
        <ReviewForm
          serviceHistoryId={editingReview.id}
          existingReview={{
            id: editingReview.id,
            rating: editingReview.rating || 0,
            feedback: editingReview.feedback,
            images: editingReview.images || [],
          }}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingReview(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderStats()}

      {loading ? (
        <ReviewsListSkeleton />
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Nenhuma avaliação encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {review.user.image && (
                          <AvatarImage src={review.user.image} />
                        )}
                        <AvatarFallback>
                          {review.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{review.user.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {formatDistanceToNow(new Date(review.completedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                    </div>

                    {showActions && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingReview(review)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {review.rating && renderStars(review.rating)}
                      <Badge variant="secondary">{review.rating || 0}/5</Badge>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User size={14} />
                        {review.service.name}
                        <DollarSign size={14} />
                        R${" "}
                        {Number(
                          review.finalPrice || review.service.price
                        ).toFixed(2)}
                      </div>
                    </div>

                    {review.feedback && (
                      <p className="text-gray-700 leading-relaxed">
                        {review.feedback}
                      </p>
                    )}

                    {review.images.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Fotos ({review.images.length})
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleImageExpanded(review.id)}
                          >
                            {expandedImages[review.id] ? (
                              <>
                                <EyeOff size={14} className="mr-1" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <Eye size={14} className="mr-1" />
                                Mostrar
                              </>
                            )}
                          </Button>
                        </div>

                        {expandedImages[review.id] && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {review.images?.map(
                              (imageUrl: string, index: number) => (
                                <img
                                  key={index}
                                  src={imageUrl}
                                  alt={`Foto ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>

              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
