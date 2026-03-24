import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/home/HeroSection";

jest.mock("motion/react", () => ({
  useReducedMotion: () => true,
}));

describe("HeroSection", () => {
  test("renders static premium hero content when reduced motion is enabled", () => {
    render(<HeroSection />);

    expect(screen.getByRole("heading", { name: "Precisão em cada detalhe" })).toBeInTheDocument();
    expect(screen.getByText("Tecnologia, estilo e performance para o seu corte perfeito")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agendar horário" })).toHaveAttribute("href", "/scheduling");

    const video = screen.getByTestId("hero-scroll-video") as HTMLVideoElement;
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "auto");
  });
});
