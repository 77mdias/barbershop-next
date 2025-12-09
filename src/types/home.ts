export type HeroSectionContent = {
  title: string;
  subtitle: string;
  placeholder: string;
  ctaLabel: string;
  action: string;
  defaultQuery?: string;
  align?: "center" | "left";
};

export type PopularServiceCard = {
  id: string;
  name: string;
  description?: string | null;
  durationLabel: string;
  priceLabel: string;
  icon?: PopularServiceIcon | null;
  href: string;
};

export type PopularServiceIcon =
  | "scissors"
  | "beard"
  | "sparkles"
  | "comb"
  | "razor"
  | "brush"
  | "clock";

export type PromotionCard = {
  id: string;
  badgeLabel: string;
  badgeTone: "neutral" | "success" | "danger";
  title: string;
  description?: string | null;
  code: string;
  expiresLabel?: string | null;
  href: string;
};

export type SalonCard = {
  id: string;
  name: string;
  rating: number | null;
  ratingLabel: string;
  address: string;
  distanceLabel: string;
  status: "OPEN" | "CLOSING_SOON" | "CLOSED";
  imageUrl: string;
  href: string;
};

export type ReviewCard = {
  id: string;
  author: string;
  serviceName: string;
  rating: number;
  comment: string;
  avatarUrl: string;
  mediaUrl?: string | null;
  createdAt: string;
};

export type BookingCtaContent = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  signinHref: string;
};

export type HomePageData = {
  hero: HeroSectionContent;
  services: {
    title: string;
    subtitle?: string;
    items: PopularServiceCard[];
  };
  promotions: {
    title: string;
    ctaLabel: string;
    ctaHref: string;
    items: PromotionCard[];
  };
  salons: {
    title: string;
    ctaLabel: string;
    ctaHref: string;
    items: SalonCard[];
  };
  bookingCta: BookingCtaContent;
  reviews: {
    title: string;
    subtitle?: string;
    items: ReviewCard[];
  };
  footer: {
    brand: {
      name: string;
      highlight: string;
      description: string;
    };
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    legal: Array<{ label: string; href: string }>;
    copyright: string;
    social: Array<{ icon: "instagram" | "facebook" | "youtube" | "tiktok"; href: string }>;
  };
};
