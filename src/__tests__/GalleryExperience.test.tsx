import React from "react";
import { render, screen } from "@testing-library/react";
import { GalleryExperience } from "@/components/gallery-3d/GalleryExperience";

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

jest.mock("@/components/gallery-3d/GallerySceneBackdrop", () => ({
  GallerySceneBackdrop: () => <div data-testid="gallery-3d-backdrop" />,
}));

describe("GalleryExperience", () => {
  beforeEach(() => {
    reducedMotionValue = false;
  });

  test("renders redesigned gallery narrative and primary CTAs", () => {
    const { container } = render(<GalleryExperience />);
    const expectedStoryboardActs = [
      "gallery-act-1-hero",
      "gallery-act-2-collections",
      "gallery-act-3-portfolio",
    ] as const;

    const galleryTitle = screen.getByRole("heading", { name: "Galeria de Estilos" });
    const collectionsTitle = screen.getByRole("heading", { name: "Coleções em destaque" });
    const portfolioTitle = screen.getByRole("heading", { name: "Portfólio completo" });

    expect(galleryTitle).toBeInTheDocument();
    const rootMain = container.querySelector("main");
    expect(rootMain).toHaveAttribute("data-layout-contract", "ph6-rsp-001-gallery");
    expect(rootMain).toHaveAttribute("data-layout-breakpoints", "390|768|1024|1440");
    expect(galleryTitle).toHaveClass("type-3d-display");
    expect(collectionsTitle).toHaveClass("type-3d-title");
    expect(portfolioTitle).toHaveClass("type-3d-title");

    expect(screen.getByRole("link", { name: /Agendar agora/i })).toHaveAttribute("href", "/scheduling");
    expect(screen.getByRole("link", { name: /Agendar agora/i })).toHaveClass("w-full");
    expect(screen.getByRole("link", { name: /Ver promoções/i })).toHaveAttribute("href", "/promotions");
    expect(screen.getByTestId("gallery-3d-backdrop")).toBeInTheDocument();
    expect(container.querySelectorAll(".surface-3d-card").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".surface-3d-emphasis").length).toBeGreaterThan(0);
    expect(container.querySelector(".surface-3d-1")).toBeInTheDocument();

    const sections = container.querySelectorAll("section");
    expect(sections.length).toBe(3);
    sections.forEach((section, index) => {
      expect(section).toHaveClass("layout-3d-shell");
      expect(section).toHaveClass("rhythm-3d-section");
      expect(section).toHaveAttribute("data-storyboard-act", expectedStoryboardActs[index]);
      expect(section).toHaveAttribute("data-storyboard-intent");
      expect(section).toHaveAttribute("data-storyboard-transition");
      expect(section).toHaveAttribute("data-storyboard-visual");
      expect(section).toHaveAttribute("data-storyboard-timing-mobile");
      expect(section).toHaveAttribute("data-storyboard-timing-desktop");
      expect(section).toHaveAttribute("data-ux-intent-primary");
      expect(section).toHaveAttribute("data-layout-contract-step");
    });
    const depthLayerSelectors = [
      "[data-scroll-depth='gallery-hero-intro']",
      "[data-scroll-depth='gallery-value-pillars']",
      "[data-scroll-depth='gallery-collections-grid']",
      "[data-scroll-depth='gallery-portfolio-shell']",
    ] as const;
    const depthLayers = depthLayerSelectors.map((selector) => container.querySelector(selector));

    depthLayers.forEach((layer) => {
      expect(layer).toBeInTheDocument();
      expect(layer).toHaveAttribute("data-scroll-depth-profile");
      expect(layer).toHaveAttribute("data-scroll-depth-disabled", "false");
      expect(layer).toHaveAttribute("data-ux-intent");
      expect(layer).toHaveAttribute("data-ux-purpose");
    });
    expect(container.querySelector("section.container")).not.toBeInTheDocument();
  });

  test("renders value pillar cards with title and description", () => {
    render(<GalleryExperience />);

    expect(screen.getByRole("heading", { name: "Curadoria editorial" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Portfólio real" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Padrão técnico" })).toBeInTheDocument();
    expect(screen.getByText(/Seleção de cortes com direção visual premium/i)).toBeInTheDocument();
  });

  test("renders collection cards with title, description and hero image", () => {
    const { container } = render(<GalleryExperience />);

    expect(screen.getByRole("heading", { name: "Classic Tailoring" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Urban Texture" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Beard Fusion" })).toBeInTheDocument();

    const collectionImages = container.querySelectorAll("article img");
    expect(collectionImages.length).toBeGreaterThanOrEqual(3);

    expect(screen.getByText("Assinatura da casa")).toBeInTheDocument();
    expect(screen.getByText("Mais pedidos")).toBeInTheDocument();
    expect(screen.getByText("Experiência premium")).toBeInTheDocument();
  });

  test("renders portfolio section with gallery component and item count", () => {
    render(<GalleryExperience />);

    expect(screen.getByRole("heading", { name: "Portfólio completo" })).toBeInTheDocument();
    expect(screen.getByText(/estilos disponíveis/i)).toBeInTheDocument();
    expect(screen.getByText(/Arquivo da barbearia/i)).toBeInTheDocument();
  });

  test("renders secondary navigation links (reviews, promotions)", () => {
    render(<GalleryExperience />);

    expect(screen.getByRole("link", { name: /Ver avaliações/i })).toHaveAttribute("href", "/reviews");
    expect(screen.getByRole("link", { name: /Ver promoções/i })).toHaveAttribute("href", "/promotions");
  });

  test("keeps static depth layers when reduced motion is enabled", () => {
    reducedMotionValue = true;
    const { container } = render(<GalleryExperience />);
    const depthLayers = container.querySelectorAll("[data-scroll-depth]");

    expect(depthLayers.length).toBeGreaterThan(0);
    depthLayers.forEach((layer) => {
      expect(layer).toHaveAttribute("data-scroll-depth-disabled", "true");
    });
  });
});
