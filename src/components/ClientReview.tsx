import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface ReviewData {
  id: string;
  mainImage?: string;
  overlayImage?: string;
  testimonial: string;
  clientName: string;
  clientTitle?: string;
  clientCompany?: string;
  rating: number;
  serviceDate?: string;
  serviceType?: string;
}

interface ClientReviewProps {
  reviews: ReviewData[];
}

export function ClientReview({ reviews }: ClientReviewProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma avaliação disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-6">
      {reviews.map((review) => (
        <Card key={review.id} className="h-full">
          <CardContent className="p-6">
            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {review.rating}/5
              </span>
            </div>

            {/* Testimonial */}
            <blockquote className="text-muted-foreground mb-4 text-sm leading-relaxed">
              &ldquo;{review.testimonial}&rdquo;
            </blockquote>

            {/* Client Info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                {review.mainImage && (
                  <AvatarImage src={review.mainImage} alt={review.clientName} />
                )}
                <AvatarFallback>
                  {review.clientName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {review.clientName}
                </p>
                {review.serviceType && (
                  <p className="text-xs text-muted-foreground truncate">
                    {review.serviceType}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}