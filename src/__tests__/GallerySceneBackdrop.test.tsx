import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { GallerySceneBackdrop } from "@/components/gallery-3d/GallerySceneBackdrop";

let reducedMotionValue = false;
let getContextSpy: jest.SpiedFunction<HTMLCanvasElement["getContext"]>;

jest.mock("motion/react", () => ({
  useReducedMotion: () => reducedMotionValue,
}));

jest.mock("next/dynamic", () => {
  return () =>
    function MockDynamicGalleryScene() {
      return (
        <div
          data-testid="dynamic-gallery-scene"
          data-theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
        />
      );
    };
});

describe("GallerySceneBackdrop", () => {
  beforeEach(() => {
    reducedMotionValue = false;
    document.documentElement.classList.remove("dark");
    getContextSpy = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((contextId) => {
      if (contextId === "webgl2" || contextId === "webgl") {
        return {} as WebGLRenderingContext;
      }

      return null;
    });
  });

  afterEach(() => {
    getContextSpy.mockRestore();
  });

  test("renders static fallback when reduced motion is enabled", async () => {
    reducedMotionValue = true;

    render(<GallerySceneBackdrop />);

    expect(screen.getByTestId("gallery-3d-backdrop")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId("dynamic-gallery-scene")).not.toBeInTheDocument();
    });
  });

  test("renders dynamic scene when reduced motion is disabled in light mode", async () => {
    render(<GallerySceneBackdrop />);

    await waitFor(() => {
      expect(screen.getByTestId("dynamic-gallery-scene")).toBeInTheDocument();
      expect(screen.getByTestId("dynamic-gallery-scene")).toHaveAttribute("data-theme", "light");
    });
  });

  test("updates dynamic scene when dark theme is active", async () => {
    document.documentElement.classList.add("dark");

    render(<GallerySceneBackdrop />);

    await waitFor(() => {
      expect(screen.getByTestId("dynamic-gallery-scene")).toBeInTheDocument();
      expect(screen.getByTestId("dynamic-gallery-scene")).toHaveAttribute("data-theme", "dark");
    });
  });
});
