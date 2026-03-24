import type { GalleryImage } from "@/components/gallery";

export type GalleryCollection = {
  id: string;
  title: string;
  description: string;
  badge: string;
  heroImage: string;
};

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/cortes/corteluz.jpg",
    alt: "Corte com luzes e acabamento texturizado",
    title: "Corte com Luzes",
  },
  {
    src: "/images/cortes/corte moner.jpeg",
    alt: "Corte moderno com topo volumoso",
    title: "Corte Moderno",
  },
  {
    src: "/images/cortes/images.jpg",
    alt: "Corte estilizado com laterais em degradê",
    title: "Corte Estilizado",
  },
  {
    src: "/images/cortes/imagescorte.jpg",
    alt: "Corte premium com acabamento limpo",
    title: "Corte Premium",
  },
  {
    src: "/images/cortes/ook.jpg",
    alt: "Corte personalizado com assinatura clássica",
    title: "Corte Personalizado",
  },
  {
    src: "/images/cortes/dqeasd.jpg",
    alt: "Corte exclusivo com variação de textura",
    title: "Corte Exclusivo",
  },
  {
    src: "/images/cortes/3.webp",
    alt: "Corte contemporâneo com volume controlado",
    title: "Corte Contemporâneo",
  },
  {
    src: "/images/cortes/men-hairstyle-2022-cortes-de-cabelo-masculino-2022-liso-cacheado-crespo-curto-longo-01.webp",
    alt: "Tendências de cortes masculinos em diferentes estilos",
    title: "Tendências em Alta",
  },
  {
    src: "/images/cortes/cdn.manualdohomem.com.webp",
    alt: "Corte profissional com acabamento de barbearia premium",
    title: "Corte Profissional",
  },
];

export const galleryCollections: GalleryCollection[] = [
  {
    id: "classic-tailoring",
    title: "Classic Tailoring",
    description: "Degradês limpos e linhas precisas para um visual executivo com presença.",
    badge: "Assinatura da casa",
    heroImage: "/images/cortes/corte-americano2.jpg",
  },
  {
    id: "urban-texture",
    title: "Urban Texture",
    description: "Camadas, textura e acabamento matte para estilos urbanos contemporâneos.",
    badge: "Mais pedidos",
    heroImage: "/images/cortes/corte-americano3.jpg",
  },
  {
    id: "beard-fusion",
    title: "Beard Fusion",
    description: "Integração de corte e barba para desenho facial equilibrado e refinado.",
    badge: "Experiência premium",
    heroImage: "/images/cortes/cortes-americano.jpg",
  },
];
