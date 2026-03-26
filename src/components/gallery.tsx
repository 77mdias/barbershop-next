"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion, useScrollDepthMotion } from "@/hooks/useScrollDepthMotion";

export interface GalleryImage {
  /** Caminho da imagem */
  src: string;
  /** Texto alternativo da imagem */
  alt: string;
  /** Título da imagem (opcional) */
  title?: string;
}

interface GalleryProps {
  /** Array de imagens para exibir */
  images: GalleryImage[];
  /** Título da galeria */
  title?: string;
  /** Subtítulo da galeria */
  subtitle?: string;
  /** Número de colunas na grid (1-4) */
  columns?: 1 | 2 | 3 | 4;
  /** Classes CSS adicionais */
  className?: string;
  /** Se deve mostrar overlay com zoom ao hover */
  showZoomOverlay?: boolean;
}

/**
 * Componente Gallery
 * 
 * Uma galeria de imagens moderna e responsiva com lightbox integrado.
 * Suporta navegação por teclado e é otimizada para mobile.
 */
export function Gallery({
  images,
  title,
  subtitle,
  columns = 3,
  className,
  showZoomOverlay = true,
}: GalleryProps) {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState<Record<number, boolean>>({});
  const [lastTriggerIndex, setLastTriggerIndex] = React.useState<number | null>(null);
  const reducedMotionFromMotion = useReducedMotion();
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldReduceMotion = reducedMotionFromMotion || prefersReducedMotion;
  const galleryGridRef = React.useRef<HTMLDivElement | null>(null);
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const thumbnailButtonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const scrollDepthDisabled = shouldReduceMotion ? "true" : "false";

  const galleryGridDepth = useScrollDepthMotion({
    target: galleryGridRef,
    rangeByViewport: {
      mobile: {
        y: [8, 0, -8],
        scale: [0.998, 1, 1.012],
      },
      desktop: {
        y: [14, 0, -14],
        scale: [0.994, 1, 1.018],
      },
    },
  });

  // Navegação por teclado
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedImage === null) return;

      switch (event.key) {
        case "Escape":
          setSelectedImage(null);
          break;
        case "ArrowLeft":
          setSelectedImage(prev => 
            prev !== null ? (prev > 0 ? prev - 1 : images.length - 1) : null
          );
          break;
        case "ArrowRight":
          setSelectedImage(prev => 
            prev !== null ? (prev < images.length - 1 ? prev + 1 : 0) : null
          );
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, images.length]);

  // Previne scroll quando lightbox está aberto
  React.useEffect(() => {
    if (selectedImage !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedImage]);

  React.useEffect(() => {
    if (selectedImage !== null) {
      closeButtonRef.current?.focus();
      return;
    }

    if (lastTriggerIndex !== null) {
      thumbnailButtonRefs.current[lastTriggerIndex]?.focus();
    }
  }, [lastTriggerIndex, selectedImage]);

  const handleImageLoad = (index: number) => {
    setIsLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index: number) => {
    setIsLoading(prev => ({ ...prev, [index]: true }));
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImage === null) return;
    
    if (direction === "prev") {
      setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1);
    } else {
      setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0);
    }
  };

  const closeLightbox = () => setSelectedImage(null);

  const openLightbox = (index: number) => {
    setLastTriggerIndex(index);
    setSelectedImage(index);
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])",
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header da Galeria */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-3xl font-bold text-[var(--primary)] dark:text-white mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Grid de Imagens */}
      <motion.div
        ref={galleryGridRef}
        className={cn(
          "grid gap-4",
          gridCols[columns]
        )}
        style={
          shouldReduceMotion
            ? undefined
            : {
                y: galleryGridDepth.y,
                scale: galleryGridDepth.scale,
                willChange: "transform",
              }
        }
        data-scroll-depth="gallery-grid"
        data-scroll-depth-profile={galleryGridDepth.profile}
        data-scroll-depth-disabled={scrollDepthDisabled}
      >
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            ref={(element) => {
              thumbnailButtonRefs.current[index] = element;
            }}
            type="button"
            aria-label={`Abrir imagem ${image.title || image.alt} em tela cheia`}
            className="group relative w-full overflow-hidden rounded-xl bg-gray-100 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] dark:bg-gray-800"
            onClick={() => openLightbox(index)}
          >
            {/* Loading Skeleton */}
            {isLoading[index] && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            
            {/* Imagem */}
            <div className="aspect-square relative">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110 group-focus-visible:scale-105"
                onLoad={() => handleImageLoad(index)}
                onLoadStart={() => handleImageLoadStart(index)}
                quality={85}
              />
              
              {/* Overlay com zoom */}
              {showZoomOverlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30 group-focus-visible:bg-black/25">
                  <ZoomIn className="h-8 w-8 scale-75 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100" />
                </div>
              )}
            </div>

            {/* Título da imagem */}
            {image.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium truncate">
                  {image.title}
                </p>
              </div>
            )}
          </button>
        ))}
      </motion.div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Visualização ampliada de ${images[selectedImage].title || images[selectedImage].alt}`}
          tabIndex={-1}
          className="fixed inset-0 z-[var(--layer-modal)] flex items-center justify-center bg-black/90 p-4"
          onKeyDown={handleDialogKeyDown}
          onClick={closeLightbox}
        >
          {/* Botão Fechar */}
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            aria-label="Fechar galeria"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navegação Anterior */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Imagem anterior"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); navigateImage("prev"); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* Navegação Próxima */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Próxima imagem"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); navigateImage("next"); }}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Imagem Ampliada */}
          <div
            className="relative flex h-full max-h-[90vh] w-full max-w-4xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              fill
              sizes="90vw"
              className="object-contain"
              quality={95}
              priority
            />
          </div>

          {/* Informações da Imagem */}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-white text-lg font-medium mb-1">
              {images[selectedImage].title || images[selectedImage].alt}
            </p>
            <p className="text-white/70 text-sm">
              {selectedImage + 1} de {images.length}
            </p>
          </div>

          {/* Indicadores */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Ir para imagem ${index + 1}`}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-90",
                    selectedImage === index 
                      ? "bg-white scale-125" 
                      : "bg-white/50 hover:bg-white/75"
                  )}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(index); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
