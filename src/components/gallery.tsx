                                                      "use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryImage {
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
  const [isLoading, setIsLoading] = React.useState<{ [key: number]: boolean }>({});

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
      <div className={cn(
        "grid gap-4",
        gridCols[columns]
      )}>
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all duration-300 hover:shadow-xl"
            onClick={() => setSelectedImage(index)}
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
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onLoad={() => handleImageLoad(index)}
                onLoadStart={() => handleImageLoadStart(index)}
                quality={85}
              />
              
              {/* Overlay com zoom */}
              {showZoomOverlay && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100" />
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
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          {/* Botão Fechar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navegação Anterior */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateImage("prev")}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* Navegação Próxima */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateImage("next")}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Imagem Ampliada */}
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
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
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    selectedImage === index 
                      ? "bg-white scale-125" 
                      : "bg-white/50 hover:bg-white/75"
                  )}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export do tipo para uso externo
export type { GalleryImage };