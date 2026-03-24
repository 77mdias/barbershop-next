import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Gallery } from "@/components/gallery";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill: _fill, priority: _priority, ...props }: Record<string, unknown>) =>
    React.createElement("img", props),
}));

describe("Gallery accessibility", () => {
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
});
