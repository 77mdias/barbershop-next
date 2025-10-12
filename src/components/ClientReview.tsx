"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClientReviewData, ClientReviewProps } from "@/types/client-review";

const mockReviews: ClientReviewData[] = [
  {
    id: "1",
    mainImage: "/images/cortes/corte1.jpg",
    overlayImage: "/images/cortes/corte2.jpg",
    testimonial: "Id urna, nisl, ut quam. Diam suspendisse fringilla quam arcu mattis est velit in. Nibh in purus sit convallis phasellus ut. At vel erat ultricies commodo. Neque suspendisse a habitasse commodo.",
    clientName: "Marie Poirot",
    clientTitle: "CEO",
    clientCompany: "Bigapp"
  },
  {
    id: "2",
    mainImage: "/images/cortes/corte3.jpg",
    overlayImage: "/images/cortes/corte4.jpg",
    testimonial: "                  &quot;Muito feliz com o resultado! Meu cabelo ficou exatamente como eu queria.&quot;",
    clientName: "João Silva",
    clientTitle: "Gerente",
    clientCompany: "Tech Solutions"
  },
  {
    id: "3",
    mainImage: "/images/cortes/corte5.jpg",
    overlayImage: "/images/cortes/corte6.jpg",
    testimonial: "Melhor barbearia da cidade! Sempre saio satisfeito com o resultado. A equipe é muito atenciosa e o local é sempre limpo e organizado. Recomendo para todos!",
    clientName: "Carlos Mendes",
    clientTitle: "Desenvolvedor",
    clientCompany: "StartupXYZ"
  }
];

export function ClientReview({ reviews = mockReviews, className }: ClientReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentReview = reviews[currentIndex];

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className={cn(
      "bg-slate-100 py-8 px-4 md:py-16 lg:py-20 lg:px-20",
      className
    )}>
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        {/* Images Section - Mobile */}
        <div className="mb-8">
          <div className="relative mx-auto w-full max-w-sm">
            {/* Main Image */}
            <div className="aspect-square w-full rounded-2xl bg-slate-200 overflow-hidden relative">
              <img
                src={currentReview.mainImage}
                alt="Cliente satisfeito"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/salon1.svg";
                }}
              />
              
              {/* Overlay Image - Mobile */}
              <div className="absolute top-4 right-4 bg-white border-2 border-red-500 border-dashed rounded-lg p-1.5 shadow-md">
                <div className="w-20 h-12 rounded-md bg-slate-200 overflow-hidden">
                  <img
                    src={currentReview.overlayImage}
                    alt="Trabalho realizado"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/salon2.svg";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section - Mobile */}
        <div className="space-y-6">
          {/* Caption */}
          <p className="text-slate-600 font-bold text-sm tracking-[0.15em] uppercase text-center">
            Success Stories
          </p>
          
          {/* Testimonial */}
          <blockquote className="text-slate-900 text-lg leading-relaxed font-normal text-center px-4">
            &ldquo;{currentReview.testimonial}&rdquo;
          </blockquote>
          
          {/* Author Info */}
          <div className="text-slate-900 text-base leading-relaxed text-center">
            <p className="font-medium">{currentReview.clientName},</p>
            <p>{currentReview.clientTitle} - {currentReview.clientCompany}</p>
          </div>
        </div>

        {/* Navigation Controls - Mobile */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={prevReview}
            className="w-10 h-10 rounded-lg bg-white hover:bg-slate-50 border-slate-200"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </Button>

          {/* Slider Indicators - Mobile */}
          <div className="flex items-center gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-6 h-1.5 rounded-full transition-all duration-200",
                  index === currentIndex 
                    ? "bg-blue-600" 
                    : "bg-slate-300 hover:bg-slate-400"
                )}
                aria-label={`Ir para avaliação ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextReview}
            className="w-10 h-10 rounded-lg bg-white hover:bg-slate-50 border-slate-200"
          >
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
        {/* Navigation Button - Previous */}
        <Button
          variant="outline"
          size="icon"
          onClick={prevReview}
          className="w-12 h-12 rounded-lg bg-white hover:bg-slate-50 border-slate-200"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </Button>

        {/* Main Content Area */}
        <div className="flex-1 flex items-stretch gap-12 xl:gap-20">
          {/* Images Column */}
          <div className="flex items-center gap-2.5 flex-1">
            {/* Main Image */}
            <div className="w-full max-w-md xl:w-[480px] aspect-square rounded-[20px] bg-slate-200 overflow-hidden relative">
              <img
                src={currentReview.mainImage}
                alt="Cliente satisfeito"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/salon1.svg";
                }}
              />
              
              {/* Overlay Image */}
              <div className="absolute top-8 right-8 xl:top-12 xl:right-12 bg-white border-2 border-red-500 border-dashed rounded-[10px] p-2 shadow-md">
                <div className="w-32 h-20 xl:w-[189px] xl:h-[113px] rounded-md bg-slate-200 overflow-hidden">
                  <img
                    src={currentReview.overlayImage}
                    alt="Trabalho realizado"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/salon2.svg";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="flex-1 flex flex-col gap-8 xl:gap-12">
            {/* Text Section */}
            <div className="flex flex-col gap-4">
              {/* Caption */}
              <p className="text-slate-600 font-bold text-lg xl:text-xl tracking-[0.15em] uppercase">
                Success Stories
              </p>
              
              {/* Testimonial */}
              <blockquote className="text-slate-900 text-xl xl:text-2xl leading-relaxed font-normal">
                &ldquo;{currentReview.testimonial}&rdquo;
              </blockquote>
              
              {/* Author Info */}
              <div className="text-slate-900 text-base xl:text-lg leading-relaxed">
                <p className="font-medium">{currentReview.clientName},</p>
                <p>{currentReview.clientTitle} - {currentReview.clientCompany}</p>
              </div>
            </div>

            {/* Slider Indicators */}
            <div className="flex items-center gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "w-8 h-2 rounded-full transition-all duration-200",
                    index === currentIndex 
                      ? "bg-blue-600" 
                      : "bg-slate-300 hover:bg-slate-400"
                  )}
                  aria-label={`Ir para avaliação ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Button - Next */}
        <Button
          variant="outline"
          size="icon"
          onClick={nextReview}
          className="w-12 h-12 rounded-lg bg-white hover:bg-slate-50 border-slate-200"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Button>
      </div>
    </section>
  );
}

export default ClientReview;