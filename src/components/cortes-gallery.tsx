"use client";

import { Gallery } from "@/components/gallery";
import { galleryImages } from "@/components/gallery-images";

/**
 * Componente da seção de galeria de cortes
 * 
 * Exibe uma galeria organizada dos trabalhos realizados na barbearia
 */
export function CortesGallerySection() {
  return (
    <section className="w-full container space-y-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Gallery
          images={galleryImages}
          title="Nossos Trabalhos"
          subtitle="Confira todas fotos de cortes e estilos que já realizamos. Cada cliente é único e merece um atendimento personalizado."
          columns={3}
          showZoomOverlay={true}
          className="w-full"
        />
      </div>
    </section>
  );
}

/**
 * Variação compacta da galeria para usar em outras páginas
 */
export function CortesGalleryCompact() {
  // Mostra apenas os primeiros 6 cortes
  const featuredImages = galleryImages.slice(0, 6);

  return (
    <div className="w-full">
      <Gallery
        images={featuredImages}
        title="Alguns dos Nossos Cortes"
        columns={3}
        showZoomOverlay={true}
      />
    </div>
  );
}

/**
 * Galeria em formato carrossel para mobile
 */
export function CortesGalleryCarousel() {
  return (
    <div className="w-full">
      <Gallery
        images={galleryImages.slice(0, 8)}
        title="Galeria de Cortes"
        columns={2}
        showZoomOverlay={true}
        className="sm:hidden" // Apenas no mobile
      />
    </div>
  );
}
