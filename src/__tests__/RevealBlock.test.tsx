import { render, screen } from "@testing-library/react";
import React from "react";
import { RevealBlock } from "@/components/home-3d/RevealBlock";

let reducedMotion = false;

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

  return {
    motion: {
      div: ReactLib.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ children, ...props }, ref) =>
        ReactLib.createElement("div", { ...stripMotionProps(props), ref }, children),
      ),
    },
    useReducedMotion: () => reducedMotion,
  };
});

const createMatchMediaMock = (matches: boolean) =>
  jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

describe("RevealBlock", () => {
  beforeEach(() => {
    reducedMotion = false;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: createMatchMediaMock(false),
    });
  });

  test("uses mobile reveal profile metadata by default", () => {
    render(
      <RevealBlock
        narrativeLabel="Ato 1 - Hero"
        revealByViewport={{
          mobile: { delay: 0.05, y: 12 },
          desktop: { delay: 0.25, y: 24 },
        }}
      >
        <span>Conteudo</span>
      </RevealBlock>,
    );

    const revealElement = screen.getByText("Conteudo").parentElement;
    expect(revealElement).toHaveAttribute("data-reveal-label", "Ato 1 - Hero");
    expect(revealElement).toHaveAttribute("data-reveal-profile", "mobile");
  });

  test("detects desktop viewport profile through matchMedia", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: createMatchMediaMock(true),
    });

    render(
      <RevealBlock
        narrativeLabel="Ato 2 - Services"
        revealByViewport={{
          mobile: { delay: 0.08, y: 14 },
          desktop: { delay: 0.18, y: 28 },
        }}
      >
        <span>Cards</span>
      </RevealBlock>,
    );

    const revealElement = screen.getByText("Cards").parentElement;
    expect(revealElement).toHaveAttribute("data-reveal-profile", "desktop");
  });

  test("keeps metadata when reduced motion is enabled", () => {
    reducedMotion = true;

    render(
      <RevealBlock narrativeLabel="Ato 5 - CTA">
        <span>Conversao</span>
      </RevealBlock>,
    );

    const revealElement = screen.getByText("Conversao").parentElement;
    expect(revealElement).toHaveAttribute("data-reveal-label", "Ato 5 - CTA");
    expect(revealElement).toHaveAttribute("data-reveal-profile", "mobile");
  });
});
