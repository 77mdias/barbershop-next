import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star } from "lucide-react";
import type { ReviewCard } from "@/types/home";
import { cn } from "@/lib/utils";

const ratingSteps = [1, 2, 3, 4, 5];

type ReviewsProps = {
  title: string;
  subtitle?: string;
  reviews: ReviewCard[];
  className?: string;
};

export function Reviews({ title, subtitle, reviews, className }: ReviewsProps) {
  return (
    <section className={cn("w-full bg-surface-1 py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto max-w-2xl text-base text-fg-muted sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface-card p-6 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={review.avatarUrl}
                  alt={review.author}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-foreground">{review.author}</span>
                  <span className="text-xs uppercase tracking-wide text-fg-subtle">
                    {review.serviceName}
                  </span>
                  <span className="text-xs text-fg-subtle">
                    {format(new Date(review.createdAt), "dd MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {ratingSteps.map((step) => (
                  <Star
                    key={step}
                    className={cn(
                      "h-4 w-4",
                      step <= review.rating
                        ? "fill-accent text-accent"
                        : "text-fg-subtle",
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-foreground sm:text-base">
                {review.comment}
              </p>
              {review.mediaUrl ? (
                <Image
                  src={review.mediaUrl}
                  alt={`Resultado do serviço de ${review.author}`}
                  width={320}
                  height={224}
                  className="mt-auto h-40 w-full rounded-xl object-cover"
                />
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
