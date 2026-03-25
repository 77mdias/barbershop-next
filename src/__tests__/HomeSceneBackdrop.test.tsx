import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { HomeSceneBackdrop } from "@/components/home-3d/HomeSceneBackdrop";

let reducedMotionValue: boolean | null = false;
let getContextSpy: jest.SpiedFunction<HTMLCanvasElement["getContext"]>;

jest.mock("motion/react", () => ({
  useReducedMotion: () => reducedMotionValue,
}));

jest.mock("next/dynamic", () => {
  return () => function MockDynamicHomeScene() {
    return <div data-testid="dynamic-home-scene" data-theme={document.documentElement.classList.contains("dark") ? "dark" : "light"} />;
  };
});

describe("HomeSceneBackdrop", () => {
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

    render(<HomeSceneBackdrop />);

    expect(screen.getByTestId("home-3d-backdrop")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId("dynamic-home-scene")).not.toBeInTheDocument();
    });
  });

  test("renders static fallback while reduced motion preference is unresolved", async () => {
    reducedMotionValue = null;

    render(<HomeSceneBackdrop />);

    await waitFor(() => {
      expect(screen.queryByTestId("dynamic-home-scene")).not.toBeInTheDocument();
    });
  });

  test("renders dynamic scene when reduced motion is disabled in light mode", async () => {
    reducedMotionValue = false;

    render(<HomeSceneBackdrop />);

    await waitFor(() => {
      expect(screen.getByTestId("dynamic-home-scene")).toBeInTheDocument();
      expect(screen.getByTestId("dynamic-home-scene")).toHaveAttribute("data-theme", "light");
    });
  });

  test("updates dynamic scene when dark theme is active", async () => {
    document.documentElement.classList.add("dark");

    render(<HomeSceneBackdrop />);

    await waitFor(() => {
      expect(screen.getByTestId("dynamic-home-scene")).toBeInTheDocument();
      expect(screen.getByTestId("dynamic-home-scene")).toHaveAttribute("data-theme", "dark");
    });
  });

  test("renders static fallback when WebGL is unavailable", async () => {
    getContextSpy.mockReturnValue(null);

    render(<HomeSceneBackdrop />);

    await waitFor(() => {
      expect(screen.queryByTestId("dynamic-home-scene")).not.toBeInTheDocument();
    });
  });
});
