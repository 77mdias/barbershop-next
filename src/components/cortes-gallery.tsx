"use client";

import { Gallery, type GalleryImage } from "@/components/gallery";

// Dados das imagens da galeria
const galleryImages: GalleryImage[] = [
  {
    src: "/images/cortes/corte-americano2.jpg",
    alt: "Corte Americano Clássico",
    title: "Corte Americano Clássico"
  },
  {
    src: "/images/cortes/corte-americano3.jpg",
    alt: "Corte Americano Moderno",
    title: "Corte Americano Moderno"
  },
  {
    src: "/images/cortes/cortes-americano.jpg",
    alt: "Corte Americano Tradicional",
    title: "Corte Americano Tradicional"
  },
  {
    src: "/images/cortes/corte.jpg",
    alt: "Corte Clássico",
    title: "Corte Clássico"
  },
  {
    src: "/images/cortes/corteluz.jpg",
    alt: "Corte com Luzes",
    title: "Corte com Luzes"
  },
  {
    src: "/images/cortes/corte moner.jpeg",
    alt: "Corte Moderno",
    title: "Corte Moderno"
  },
  {
    src: "/images/cortes/images.jpg",
    alt: "Corte Estilizado",
    title: "Corte Estilizado"
  },
  {
    src: "/images/cortes/imagescorte.jpg",
    alt: "Corte Premium",
    title: "Corte Premium"
  },
  {
    src: "/images/cortes/ook.jpg",
    alt: "Corte Personalizado",
    title: "Corte Personalizado"
  },
  {
    src: "/images/cortes/dqeasd.jpg",
    alt: "Corte Exclusivo",
    title: "Corte Exclusivo"
  },
  {
    src: "/images/cortes/3.webp",
    alt: "Corte Contemporâneo",
    title: "Corte Contemporâneo"
  },
  {
    src: "/images/cortes/men-hairstyle-2022-cortes-de-cabelo-masculino-2022-liso-cacheado-crespo-curto-longo-01.webp",
    alt: "Tendências 2022",
    title: "Tendências 2022"
  },
  {
    src: "/images/cortes/cdn.manualdohomem.com.webp",
    alt: "Corte Profissional",
    title: "Corte Profissional"
  }
];

/**
 * Componente da seção de galeria de cortes
 * 
 * Exibe uma galeria organizada dos trabalhos realizados na barbearia
 */
export function CortesGallerySection() {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto text-white">
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