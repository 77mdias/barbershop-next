import { render, screen } from "@testing-library/react";
import type { HomePageData } from "@/types/home";
import { HomeExperience } from "@/components/home-3d/HomeExperience";
import React from "react";

let reducedMotionValue = false;

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill: _fill, ...props }: Record<string, unknown>) => React.createElement("img", props),
}));

jest.mock("motion/react", () => {
  const ReactLib = jest.requireActual<typeof import("react")>("react");
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      initial: _initial,
      animate: _animate,
      whileInView: _whileInView,
      whileHover: _whileHover,
      transition: _transition,
      viewport: _viewport,
      ...rest
    } = props;

    return rest;
  };

  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        ReactLib.forwardRef(({ children, ...props }: any, ref) =>
          ReactLib.createElement(tag, { ...stripMotionProps(props), ref }, children),
        ),
    },
  );

  return {
    motion,
    useReducedMotion: () => reducedMotionValue,
    useScroll: () => ({ scrollYProgress: 0 }),
    useTransform: (_value: unknown, _input: number[], output: number[]) => output[1] ?? output[0] ?? 0,
  };
});

jest.mock("@/components/home-3d/HomeSceneBackdrop", () => ({
  HomeSceneBackdrop: () => <div data-testid="home-3d-backdrop" />,
}));

const sampleData: HomePageData = {
  hero: {
    title: "Seu ritual começa aqui",
    subtitle: "Agende com precisão e estilo.",
    placeholder: "Buscar serviço",
    ctaLabel: "Encontrar horários",
    action: "/scheduling",
    defaultQuery: "corte",
  },
  services: {
    title: "Serviços assinatura",
    subtitle: "Cortes e barba com padrão premium.",
    items: [
      {
        id: "service-1",
        name: "Corte executivo",
        description: "Acabamento com navalha.",
        durationLabel: "45 min",
        priceLabel: "R$ 95,00",
        icon: "scissors",
        href: "/services/service-1",
      },
    ],
  },
  promotions: {
    title: "Ofertas da semana",
    ctaLabel: "Ver promoções",
    ctaHref: "/promotions",
    items: [
      {
        id: "promo-1",
        badgeLabel: "Oferta",
        badgeTone: "success",
        title: "Combo corte + barba",
        description: "Economize 20% no combo.",
        code: "BARBER20",
        expiresLabel: "Válido até 30/04",
        href: "/promotions/promo-1",
      },
    ],
  },
  salons: {
    title: "Unidades em destaque",
    ctaLabel: "Explorar unidades",
    ctaHref: "/salons",
    items: [
      {
        id: "salon-1",
        name: "Barber Kings Centro",
        rating: 4.9,
        ratingLabel: "4.9 (120)",
        address: "Av. Paulista, 1000",
        distanceLabel: "1,2 km",
        status: "OPEN",
        imageUrl: "/images/salon1.svg",
        href: "/salons/salon-1",
      },
    ],
  },
  bookingCta: {
    title: "Reserve sem espera",
    description: "Confirme seu atendimento em segundos.",
    primaryLabel: "Agendar agora",
    primaryHref: "/scheduling",
    secondaryLabel: "Criar conta",
    secondaryHref: "/auth/signup",
    signinHref: "/auth/signin",
  },
  reviews: {
    title: "Quem corta com a gente recomenda",
    subtitle: "Avaliações reais.",
    items: [
      {
        id: "review-1",
        author: "Lucas",
        serviceName: "Barba completa",
        rating: 5,
        comment: "Atendimento excelente.",
        avatarUrl: "/images/salon2.svg",
        mediaUrl: null,
        createdAt: new Date("2026-03-01").toISOString(),
      },
    ],
  },
  footer: {
    brand: {
      name: "BARBER",
      highlight: "KINGS",
      description: "Barbearia contemporânea com técnica clássica.",
    },
    columns: [
      {
        title: "Empresa",
        links: [{ label: "Sobre", href: "/about" }],
      },
    ],
    legal: [{ label: "Privacidade", href: "/legal/privacy" }],
    copyright: "2026 © Barber Kings",
    social: [{ icon: "instagram", href: "https://instagram.com" }],
  },
};

describe("HomeExperience", () => {
  beforeEach(() => {
    reducedMotionValue = false;
  });

  test("renders the redesigned narrative sections and primary actions", () => {
    const { container } = render(<HomeExperience data={sampleData} />);
    const expectedStoryboardActs = [
      "act-1-hero",
      "act-2-services",
      "act-3-discovery",
      "act-4-social-proof",
      "act-5-cta",
    ] as const;

    const heroTitle = screen.getByRole("heading", { name: sampleData.hero.title });
    const servicesTitle = screen.getByRole("heading", { name: sampleData.services.title });
    const promotionsTitle = screen.getByRole("heading", { name: sampleData.promotions.title });
    const salonsTitle = screen.getByRole("heading", { name: sampleData.salons.title });
    const reviewsTitle = screen.getByRole("heading", { name: sampleData.reviews.title });

    expect(heroTitle).toBeInTheDocument();
    expect(heroTitle).toHaveClass("type-3d-display");
    expect(servicesTitle).toHaveClass("type-3d-title");
    expect(promotionsTitle).toHaveClass("type-3d-title");
    expect(salonsTitle).toHaveClass("type-3d-title");
    expect(reviewsTitle).toHaveClass("type-3d-title");

    expect(screen.getByRole("button", { name: sampleData.hero.ctaLabel })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: sampleData.bookingCta.primaryLabel })).toHaveAttribute(
      "href",
      sampleData.bookingCta.primaryHref,
    );
    expect(screen.getByRole("link", { name: sampleData.bookingCta.secondaryLabel })).toHaveAttribute(
      "href",
      sampleData.bookingCta.secondaryHref,
    );

    expect(screen.getByTestId("home-3d-backdrop")).toBeInTheDocument();
    expect(container.querySelectorAll(".surface-3d-card").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".surface-3d-emphasis").length).toBeGreaterThan(0);
    expect(container.querySelector(".surface-3d-1")).toBeInTheDocument();

    const sections = container.querySelectorAll("section");
    expect(sections.length).toBe(5);
    sections.forEach((section, index) => {
      expect(section).toHaveClass("layout-3d-shell");
      expect(section).toHaveClass("rhythm-3d-section");
      expect(section).toHaveAttribute("data-storyboard-act", expectedStoryboardActs[index]);
      expect(section).toHaveAttribute("data-storyboard-intent");
      expect(section).toHaveAttribute("data-storyboard-transition");
      expect(section).toHaveAttribute("data-storyboard-visual");
      expect(section).toHaveAttribute("data-storyboard-timing-mobile");
      expect(section).toHaveAttribute("data-storyboard-timing-desktop");
    });

    expect(container.querySelectorAll("[data-reveal-label]").length).toBeGreaterThanOrEqual(5);
    const depthLayers = container.querySelectorAll("[data-scroll-depth]");
    expect(depthLayers.length).toBeGreaterThanOrEqual(4);
    depthLayers.forEach((layer) => {
      expect(layer).toHaveAttribute("data-scroll-depth-profile");
      expect(layer).toHaveAttribute("data-scroll-depth-disabled", "false");
    });
    expect(container.querySelector("section.container")).not.toBeInTheDocument();
  });

  test("keeps layout usable with static scroll-depth layers when reduced motion is enabled", () => {
    reducedMotionValue = true;

    const { container } = render(<HomeExperience data={sampleData} />);
    const depthLayers = container.querySelectorAll("[data-scroll-depth]");

    expect(depthLayers.length).toBeGreaterThan(0);
    depthLayers.forEach((layer) => {
      expect(layer).toHaveAttribute("data-scroll-depth-disabled", "true");
    });
  });

  test("falls back to local assets when dynamic image URLs are invalid or not allowed", () => {
    const dataWithUnsafeImages: HomePageData = {
      ...sampleData,
      salons: {
        ...sampleData.salons,
        items: sampleData.salons.items.map((salon, index) =>
          index === 0
            ? {
                ...salon,
                imageUrl: "https://unknown-image-host.invalid/salon.jpg",
              }
            : salon,
        ),
      },
      reviews: {
        ...sampleData.reviews,
        items: sampleData.reviews.items.map((review, index) =>
          index === 0
            ? {
                ...review,
                avatarUrl: "javascript:alert('xss')",
              }
            : review,
        ),
      },
    };

    const { container } = render(<HomeExperience data={dataWithUnsafeImages} />);
    const allImages = Array.from(container.querySelectorAll("img"));
    const salonImage = allImages.find((img) => img.getAttribute("alt") === dataWithUnsafeImages.salons.items[0]?.name);
    const reviewAvatarImage = allImages.find((img) => img.getAttribute("alt") === dataWithUnsafeImages.reviews.items[0]?.author);

    expect(salonImage).toHaveAttribute("src", "/images/salon1.svg");
    expect(reviewAvatarImage).toHaveAttribute("src", "/images/salon2.svg");
  });
});
