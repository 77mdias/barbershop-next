import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { HomeSceneBackdrop } from "@/components/home-3d/HomeSceneBackdrop";

let reducedMotionValue = false;

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
  });

  test("renders static fallback when reduced motion is enabled", async () => {
    reducedMotionValue = true;

    render(<HomeSceneBackdrop />);

    expect(screen.getByTestId("home-3d-backdrop")).toBeInTheDocument();
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
});
