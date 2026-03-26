import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Gallery } from "@/components/gallery";

let reducedMotionValue = false;

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill: _fill, priority: _priority, ...props }: Record<string, unknown>) =>
    React.createElement("img", props),
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

describe("Gallery accessibility", () => {
  beforeEach(() => {
    reducedMotionValue = false;
  });

  test("opens lightbox from semantic thumbnail button and exposes labelled controls", () => {
    render(
      <Gallery
        images={[
          { src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" },
          { src: "/images/cortes/3.webp", alt: "Corte Contemporâneo", title: "Corte Contemporâneo" },
        ]}
      />,
    );

    const openButton = screen.getByRole("button", {
      name: /Abrir imagem Corte com Luzes em tela cheia/i,
    });
    fireEvent.click(openButton);

    expect(screen.getByRole("button", { name: /Fechar galeria/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Imagem anterior/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Próxima imagem/i })).toBeInTheDocument();
  });

  test("closes lightbox on Escape", () => {
    render(
      <Gallery
        images={[
          { src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" },
          { src: "/images/cortes/3.webp", alt: "Corte Contemporâneo", title: "Corte Contemporâneo" },
        ]}
      />,
    );

    const openButton = screen.getByRole("button", {
      name: /Abrir imagem Corte com Luzes em tela cheia/i,
    });

    openButton.focus();
    fireEvent.click(openButton);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("exposes scroll-depth contract for thumbnail grid", () => {
    const { container } = render(
      <Gallery
        images={[
          { src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" },
          { src: "/images/cortes/3.webp", alt: "Corte Contemporâneo", title: "Corte Contemporâneo" },
        ]}
      />,
    );

    const gridLayer = container.querySelector("[data-scroll-depth='gallery-grid']");
    expect(gridLayer).toBeInTheDocument();
    expect(gridLayer).toHaveAttribute("data-scroll-depth-profile");
    expect(gridLayer).toHaveAttribute("data-scroll-depth-disabled", "false");
  });

  test("keeps gallery scroll-depth static when reduced motion is enabled", () => {
    reducedMotionValue = true;

    const { container } = render(
      <Gallery
        images={[
          { src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" },
          { src: "/images/cortes/3.webp", alt: "Corte Contemporâneo", title: "Corte Contemporâneo" },
        ]}
      />,
    );

    const gridLayer = container.querySelector("[data-scroll-depth='gallery-grid']");
    expect(gridLayer).toHaveAttribute("data-scroll-depth-disabled", "true");
  });

  test("navigates lightbox images with ArrowLeft and ArrowRight keys", () => {
    render(
      <Gallery
        images={[
          { src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" },
          { src: "/images/cortes/3.webp", alt: "Corte Contemporâneo", title: "Corte Contemporâneo" },
          { src: "/images/cortes/images.jpg", alt: "Corte Estilizado", title: "Corte Estilizado" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Abrir imagem Corte com Luzes em tela cheia/i }));
    expect(screen.getByText("1 de 3")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("2 de 3")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("3 de 3")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("1 de 3")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("3 de 3")).toBeInTheDocument();
  });

  test("navigates via indicator dots in lightbox", () => {
    render(
      <Gallery
        images={[
          { src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" },
          { src: "/images/cortes/3.webp", alt: "Corte Contemporâneo", title: "Corte Contemporâneo" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Abrir imagem Corte com Luzes em tela cheia/i }));
    expect(screen.getByText("1 de 2")).toBeInTheDocument();

    const goToImage2 = screen.getByRole("button", { name: "Ir para imagem 2" });
    fireEvent.click(goToImage2);
    expect(screen.getByText("2 de 2")).toBeInTheDocument();
  });

  test("navigates via prev/next buttons in lightbox", () => {
    render(
      <Gallery
        images={[
          { src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" },
          { src: "/images/cortes/3.webp", alt: "Corte Contemporâneo", title: "Corte Contemporâneo" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Abrir imagem Corte com Luzes em tela cheia/i }));
    expect(screen.getByText("1 de 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Próxima imagem/i }));
    expect(screen.getByText("2 de 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Imagem anterior/i }));
    expect(screen.getByText("1 de 2")).toBeInTheDocument();
  });

  test("lightbox locks body scroll and unlocks on close", () => {
    render(
      <Gallery
        images={[
          { src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" },
        ]}
      />,
    );

    expect(document.body.style.overflow).not.toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: /Abrir imagem Corte com Luzes em tela cheia/i }));
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.body.style.overflow).toBe("unset");
  });

  test("lightbox dialog has proper accessibility attributes", () => {
    render(
      <Gallery
        images={[
          { src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Abrir imagem Corte com Luzes em tela cheia/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Visualização ampliada de Corte com Luzes");
  });

  test("renders gallery with title and subtitle when provided", () => {
    render(
      <Gallery
        images={[{ src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" }]}
        title="Nossos Cortes"
        subtitle="Explore os melhores estilos"
      />,
    );

    expect(screen.getByRole("heading", { name: "Nossos Cortes" })).toBeInTheDocument();
    expect(screen.getByText("Explore os melhores estilos")).toBeInTheDocument();
  });

  test("does not show navigation buttons for single image lightbox", () => {
    render(
      <Gallery
        images={[{ src: "/images/cortes/corteluz.jpg", alt: "Corte com Luzes", title: "Corte com Luzes" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Abrir imagem Corte com Luzes em tela cheia/i }));

    expect(screen.queryByRole("button", { name: /Imagem anterior/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Próxima imagem/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fechar galeria/i })).toBeInTheDocument();
  });
});
