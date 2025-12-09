import "server-only";

import { cache } from "react";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { db } from "@/lib/prisma";
import { ServiceService } from "@/server/services/serviceService";
import { decimalToNumber } from "@/lib/serializers";
import { logger } from "@/lib/logger";
import {
  type BookingCtaContent,
  type HomePageData,
  type PopularServiceCard,
  type PopularServiceIcon,
  type PromotionCard,
  type ReviewCard,
  type SalonCard,
} from "@/types/home";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const fallbackServiceIcons: PopularServiceIcon[] = [
  "scissors",
  "beard",
  "sparkles",
  "razor",
];

const fallbackServices: PopularServiceCard[] = [
  {
    id: "fallback-service-1",
    name: "Corte de Cabelo",
    description: "Renove o visual com acabamento impecável.",
    durationLabel: "30 min",
    priceLabel: currencyFormatter.format(70),
    icon: "scissors",
    href: "/scheduling",
  },
  {
    id: "fallback-service-2",
    name: "Barba Completa",
    description: "Modelagem precisa com toalha quente.",
    durationLabel: "25 min",
    priceLabel: currencyFormatter.format(55),
    icon: "beard",
    href: "/scheduling",
  },
  {
    id: "fallback-service-3",
    name: "Combo Corte + Barba",
    description: "Experiência completa com cuidados premium.",
    durationLabel: "50 min",
    priceLabel: currencyFormatter.format(110),
    icon: "sparkles",
    href: "/scheduling",
  },
  {
    id: "fallback-service-4",
    name: "Pezinho / Acabamento",
    description: "Detalhes alinhados entre visitas.",
    durationLabel: "15 min",
    priceLabel: currencyFormatter.format(35),
    icon: "razor",
    href: "/scheduling",
  },
];

const fallbackPromotions: PromotionCard[] = [
  {
    id: "fallback-promo-1",
    badgeLabel: "Promoção",
    badgeTone: "success",
    title: "Boas-vindas 20% OFF",
    description: "Use no primeiro agendamento em qualquer serviço.",
    code: "BEMVINDO20",
    expiresLabel: "Válido até 30/12",
    href: "/promotions",
  },
  {
    id: "fallback-promo-2",
    badgeLabel: "Pacote",
    badgeTone: "neutral",
    title: "Pai & Filho 15% OFF",
    description: "Combine dois serviços e economize em família.",
    code: "PAIEFILHO15",
    expiresLabel: "Sem prazo determinado",
    href: "/promotions",
  },
  {
    id: "fallback-promo-3",
    badgeLabel: "Experiência",
    badgeTone: "neutral",
    title: "Dia do Noivo VIP",
    description: "Pacote completo com massagem e cuidados especiais.",
    code: "NOIVO-VIP",
    expiresLabel: "Consulte disponibilidade",
    href: "/promotions",
  },
];

const fallbackSalons: SalonCard[] = [
  {
    id: "fallback-salon-1",
    name: "Barbearia Centro",
    rating: 4.9,
    ratingLabel: "4.9 (120)",
    address: "Av. Paulista, 123 - Bela Vista",
    distanceLabel: "1,2 km",
    status: "OPEN",
    imageUrl: "/images/salon1.svg",
    href: "/salons",
  },
  {
    id: "fallback-salon-2",
    name: "Viking Cuts",
    rating: 4.7,
    ratingLabel: "4.7 (98)",
    address: "R. Augusta, 845 - Consolação",
    distanceLabel: "2,0 km",
    status: "CLOSING_SOON",
    imageUrl: "/images/salon2.svg",
    href: "/salons",
  },
  {
    id: "fallback-salon-3",
    name: "Gentleman's Lounge",
    rating: 4.8,
    ratingLabel: "4.8 (76)",
    address: "Al. Santos, 500 - Jardins",
    distanceLabel: "2,4 km",
    status: "OPEN",
    imageUrl: "/images/salon1.svg",
    href: "/salons",
  },
  {
    id: "fallback-salon-4",
    name: "Old School Barber",
    rating: 4.5,
    ratingLabel: "4.5 (54)",
    address: "R. Frei Caneca, 100",
    distanceLabel: "3,1 km",
    status: "CLOSED",
    imageUrl: "/images/salon2.svg",
    href: "/salons",
  },
];

const fallbackReviews: ReviewCard[] = [
  {
    id: "fallback-review-1",
    author: "Ricardo Mendes",
    serviceName: "Corte de Cabelo",
    rating: 5,
    comment: "Equipe incrível! Saí renovado e pronto para a semana.",
    avatarUrl: "/images/salon1.svg",
    mediaUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-review-2",
    author: "Ana Clara",
    serviceName: "Combo Corte + Barba",
    rating: 5,
    comment: "Adorei a experiência, o combo vale cada minuto.",
    avatarUrl: "/images/salon2.svg",
    mediaUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-review-3",
    author: "Felipe Costa",
    serviceName: "Barba Completa",
    rating: 4,
    comment: "Atendimento rápido e super profissional.",
    avatarUrl: "/images/salon1.svg",
    mediaUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-review-4",
    author: "Lucas Oliveira",
    serviceName: "Pezinho",
    rating: 5,
    comment: "Melhor acabamento da cidade, recomendo!",
    avatarUrl: "/images/salon2.svg",
    mediaUrl: null,
    createdAt: new Date().toISOString(),
  },
];

const fallbackBookingCta: BookingCtaContent = {
  title: "Pronto para renovar seu visual?",
  description:
    "Agende em poucos cliques e acompanhe o status do seu atendimento em tempo real.",
  primaryLabel: "Agendar Agora",
  primaryHref: "/scheduling",
  secondaryLabel: "Criar Conta",
  secondaryHref: "/auth/signup",
  signinHref: "/auth/signin",
};

const fallbackFooter: HomePageData["footer"] = {
  brand: {
    name: "BARBER",
    highlight: "KINGS",
    description:
      "Cortes, barbas e experiências sob medida para quem valoriza estilo e conforto.",
  },
  columns: [
    {
      title: "Empresa",
      links: [
        { label: "Sobre Nós", href: "/about" },
        { label: "Carreiras", href: "/careers" },
        { label: "Blog", href: "/blog" },
        { label: "Parceiros", href: "/partners" },
      ],
    },
    {
      title: "Suporte",
      links: [
        { label: "Central de Ajuda", href: "/support" },
        { label: "Termos de Uso", href: "/legal/terms" },
        { label: "Privacidade", href: "/legal/privacy" },
        { label: "Fale Conosco", href: "/contact" },
      ],
    },
    {
      title: "Social",
      links: [
        { label: "Instagram", href: "https://instagram.com" },
        { label: "Facebook", href: "https://facebook.com" },
        { label: "YouTube", href: "https://youtube.com" },
        { label: "TikTok", href: "https://tiktok.com" },
      ],
    },
  ],
  legal: [
    { label: "Privacidade", href: "/legal/privacy" },
    { label: "Termos", href: "/legal/terms" },
    { label: "Cookies", href: "/legal/cookies" },
  ],
  copyright: "2025 © Barber Kings. Todos os direitos reservados.",
  social: [
    { icon: "instagram", href: "https://instagram.com" },
    { icon: "facebook", href: "https://facebook.com" },
    { icon: "youtube", href: "https://youtube.com" },
    { icon: "tiktok", href: "https://tiktok.com" },
  ],
};

function resolveServiceIcon(name: string): PopularServiceIcon {
  const normalized = name.toLowerCase();
  if (normalized.includes("combo")) return "sparkles";
  if (normalized.includes("barba")) return "beard";
  if (normalized.includes("pezinho") || normalized.includes("acabamento")) return "razor";
  if (normalized.includes("hidrata") || normalized.includes("spa")) return "brush";
  if (normalized.includes("color")) return "comb";
  return "scissors";
}

function formatExpiresLabel(expiresAt: Date | null | undefined): string | null {
  if (!expiresAt) return null;
  return `Válido até ${format(expiresAt, "dd/MM", { locale: ptBR })}`;
}

function buildPromotionCode(name: string, id: string): string {
  const fallback = id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
  if (!name) return fallback || "PROMO";
  const sanitized = name
    .normalize("NFD")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();
  return sanitized.slice(0, 12) || fallback || "PROMO";
}

function resolveBadgeTone(expiresAt: Date | null | undefined): PromotionCard["badgeTone"] {
  if (!expiresAt) return "neutral";
  const days = differenceInDays(expiresAt, new Date());
  if (days <= 3) return "danger";
  if (days <= 10) return "success";
  return "neutral";
}

async function loadPopularServices(): Promise<PopularServiceCard[]> {
  try {
    const services = await ServiceService.findPopular(4);
    if (!services.length) return [];

    return services.map((service, index) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      durationLabel: `${service.duration} min`,
      priceLabel: currencyFormatter.format(decimalToNumber(service.price)),
      icon: resolveServiceIcon(service.name) ?? fallbackServiceIcons[index % fallbackServiceIcons.length],
      href: `/services/${service.id}`,
    }));
  } catch (error) {
    logger.error("Falha ao carregar serviços populares", { error }, "HomePageData");
    return [];
  }
}

async function loadPromotions(): Promise<PromotionCard[]> {
  try {
    const now = new Date();
    const promotions = await db.promotion.findMany({
      where: {
        active: true,
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      include: {
        servicePromotions: {
          include: {
            service: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: [{ validUntil: "asc" }, { createdAt: "desc" }],
      take: 3,
    });

    if (!promotions.length) return [];

    return promotions.map((promotion) => {
      const firstService = promotion.servicePromotions[0]?.service?.name ?? null;
      const expiresLabel = formatExpiresLabel(promotion.validUntil);
      return {
        id: promotion.id,
        badgeLabel: firstService ? `Serviço: ${firstService}` : "Promoção",
        badgeTone: resolveBadgeTone(promotion.validUntil),
        title: promotion.name,
        description: promotion.description,
        code: buildPromotionCode(promotion.name, promotion.id),
        expiresLabel,
        href: `/promotions/${promotion.id}`,
      } satisfies PromotionCard;
    });
  } catch (error) {
    logger.error("Falha ao carregar promoções", { error }, "HomePageData");
    return [];
  }
}

async function loadSalons(): Promise<SalonCard[]> {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        status: "COMPLETED",
        serviceHistory: {
          isNot: null,
        },
        barber: {
          isActive: true,
        },
      },
      include: {
        barber: {
          select: {
            id: true,
            name: true,
            image: true,
            nickname: true,
          },
        },
        serviceHistory: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 80,
    });

    if (!appointments.length) return [];

    const grouped = appointments.reduce<Map<string, { name: string; image: string | null; nickname: string | null; ratings: number[] }>>((map, appointment) => {
      if (!appointment.barber) return map;
      const barberId = appointment.barber.id;
      const current = map.get(barberId) ?? {
        name: appointment.barber.name,
        image: appointment.barber.image,
        nickname: appointment.barber.nickname,
        ratings: [],
      };
      const rating = appointment.serviceHistory?.rating ?? null;
      if (rating) {
        current.ratings.push(rating);
      }
      map.set(barberId, current);
      return map;
    }, new Map());

    const salons = Array.from(grouped.entries()).map<SalonCard>(([id, value], index) => {
      const ratingMedia = value.ratings.length ? value.ratings.reduce((acc, current) => acc + current, 0) / value.ratings.length : null;
      const formattedRating = ratingMedia ? `${ratingMedia.toFixed(1)} (${value.ratings.length})` : "Sem avaliações";
      const baseDistance = (index + 1) * 0.8;
      const status: SalonCard["status"] = ratingMedia ? (ratingMedia >= 4.5 ? "OPEN" : "CLOSING_SOON") : "OPEN";
      return {
        id,
        name: value.name,
        rating: ratingMedia ? Number(ratingMedia.toFixed(1)) : null,
        ratingLabel: formattedRating,
        address: value.nickname ?? "Endereço em atualização",
        distanceLabel: `${baseDistance.toFixed(1)} km`,
        status,
        imageUrl: value.image ?? (index % 2 === 0 ? "/images/salon1.svg" : "/images/salon2.svg"),
        href: `/barbers/${id}`,
      };
    });

    return salons.slice(0, 4);
  } catch (error) {
    logger.error("Falha ao carregar barbeiros", { error }, "HomePageData");
    return [];
  }
}

async function loadReviews(): Promise<ReviewCard[]> {
  try {
    const histories = await db.serviceHistory.findMany({
      where: {
        feedback: {
          not: null,
        },
        rating: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ completedAt: "desc" }],
      take: 4,
    });

    if (!histories.length) return [];

    return histories.map((history) => ({
      id: history.id,
      author: history.user?.name ?? "Cliente",
      serviceName: history.service?.name ?? "Serviço",
      rating: history.rating ?? 5,
      comment: history.feedback ?? "",
      avatarUrl: history.user?.image ?? "/images/salon1.svg",
      mediaUrl: history.images?.[0] ?? null,
      createdAt: history.completedAt.toISOString(),
    }));
  } catch (error) {
    logger.error("Falha ao carregar avaliações", { error }, "HomePageData");
    return [];
  }
}

export const getHomePageData = cache(async (): Promise<HomePageData> => {
  const [popularServices, promotions, salons, reviews] = await Promise.all([
    loadPopularServices(),
    loadPromotions(),
    loadSalons(),
    loadReviews(),
  ]);

  return {
    hero: {
      title: "Encontre seu estilo.",
      subtitle: "Agende cortes, barbas e experiências premium com os melhores profissionais da cidade.",
      placeholder: "Buscar serviços, barbeiros ou promoções",
      ctaLabel: "Buscar",
      action: "/scheduling",
      align: "center",
    },
    services: {
      title: "Serviços Populares",
      subtitle: "Escolhas mais agendadas pelos nossos clientes.",
      items: popularServices.length ? popularServices : fallbackServices,
    },
    promotions: {
      title: "Ofertas Disponíveis",
      ctaLabel: "Ver todas",
      ctaHref: "/promotions",
      items: promotions.length ? promotions : fallbackPromotions,
    },
    salons: {
      title: "Salões Próximos",
      ctaLabel: "Ver todos",
      ctaHref: "/salons",
      items: salons.length ? salons : fallbackSalons,
    },
    bookingCta: fallbackBookingCta,
    reviews: {
      title: "Avaliações Recentes",
      subtitle: "O que clientes contam sobre a experiência Barber Kings.",
      items: reviews.length ? reviews : fallbackReviews,
    },
    footer: fallbackFooter,
  } satisfies HomePageData;
});
