import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, MessageSquareQuote } from "lucide-react";
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
    <section className={cn("w-full bg-surface-1 py-20 lg:py-28", className)}>
      <div className="container mx-auto px-4">
        <div className="stagger-reveal flex flex-col gap-4 text-center">
          <h2 className="font-display text-3xl font-bold italic tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto max-w-2xl text-base text-fg-muted sm:text-lg">
              {subtitle}
            </p>
          ) : null}
          <div className="mx-auto mt-1 h-0.5 w-12 bg-accent" />
        </div>

        <div className="stagger-reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className={cn(
                "group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface-card p-7 transition-all duration-500",
                "hover:border-[hsl(var(--accent)/0.3)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]",
              )}
            >
              {/* Decorative quote */}
              <MessageSquareQuote className="absolute -right-2 -top-2 h-16 w-16 rotate-180 text-[hsl(var(--accent)/0.06)]" />

              {/* Author info */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src={review.avatarUrl}
                    alt={review.author}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-[hsl(var(--accent)/0.15)]"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-foreground">{review.author}</span>
                  <span className="text-xs text-accent">{review.serviceName}</span>
                  <span className="text-xs text-fg-subtle">
                    {format(new Date(review.createdAt), "dd MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Rating stars */}
              <div className="flex items-center gap-1">
                {ratingSteps.map((step) => (
                  <Star
                    key={step}
                    className={cn(
                      "h-4 w-4",
                      step <= review.rating
                        ? "fill-accent text-accent"
                        : "text-fg-subtle/30",
                    )}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="relative z-10 text-sm leading-relaxed text-foreground/80 sm:text-base">
                &ldquo;{review.comment}&rdquo;
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
