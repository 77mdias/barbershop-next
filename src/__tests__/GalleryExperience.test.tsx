import React from "react";
import { render, screen } from "@testing-library/react";
import { GalleryExperience } from "@/components/gallery-3d/GalleryExperience";

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
    useReducedMotion: () => false,
  };
});

jest.mock("@/components/gallery-3d/GallerySceneBackdrop", () => ({
  GallerySceneBackdrop: () => <div data-testid="gallery-3d-backdrop" />,
}));

describe("GalleryExperience", () => {
  test("renders redesigned gallery narrative and primary CTAs", () => {
    render(<GalleryExperience />);

    expect(screen.getByRole("heading", { name: "Galeria de Estilos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Coleções em destaque" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Portfólio completo" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Agendar agora/i })).toHaveAttribute("href", "/scheduling");
    expect(screen.getByRole("link", { name: /Ver promoções/i })).toHaveAttribute("href", "/promotions");
    expect(screen.getByTestId("gallery-3d-backdrop")).toBeInTheDocument();
  });
});
