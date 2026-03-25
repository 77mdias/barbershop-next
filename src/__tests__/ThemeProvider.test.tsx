import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@/providers/ThemeProvider";

type MatchMediaController = {
  setDarkMode: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
};

function createMatchMediaMock(initialDarkMode: boolean, initialReducedMotion: boolean): MatchMediaController {
  let darkMode = initialDarkMode;
  let reducedMotion = initialReducedMotion;

  const darkListeners = new Set<(event: MediaQueryListEvent) => void>();
  const motionListeners = new Set<(event: MediaQueryListEvent) => void>();

  const createMediaQueryList = (query: string): MediaQueryList => {
    const isDarkQuery = query === "(prefers-color-scheme: dark)";
    const listeners = isDarkQuery ? darkListeners : motionListeners;

    return {
      get matches() {
        return isDarkQuery ? darkMode : reducedMotion;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        if (typeof listener === "function") {
          listeners.add(listener as (event: MediaQueryListEvent) => void);
        }
      },
      removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        if (typeof listener === "function") {
          listeners.delete(listener as (event: MediaQueryListEvent) => void);
        }
      },
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as unknown as MediaQueryList;
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => createMediaQueryList(query)),
  });

  return {
    setDarkMode: (enabled: boolean) => {
      darkMode = enabled;
      darkListeners.forEach((listener) => listener({ matches: darkMode } as MediaQueryListEvent));
    },
    setReducedMotion: (enabled: boolean) => {
      reducedMotion = enabled;
      motionListeners.forEach((listener) => listener({ matches: reducedMotion } as MediaQueryListEvent));
    },
  };
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    delete document.documentElement.dataset.reducedMotion;
    document.documentElement.style.colorScheme = "";
  });

  test("applies resolved theme and reduced-motion preference to the root element", async () => {
    createMatchMediaMock(true, true);

    render(
      <ThemeProvider>
        <div>conteudo</div>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe("dark");
      expect(document.documentElement.dataset.reducedMotion).toBe("true");
    });
  });

  test("reacts to operating system preference changes", async () => {
    const mediaController = createMatchMediaMock(false, false);

    render(
      <ThemeProvider>
        <div>conteudo</div>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(document.documentElement.style.colorScheme).toBe("light");
      expect(document.documentElement.dataset.reducedMotion).toBe("false");
    });

    act(() => {
      mediaController.setDarkMode(true);
      mediaController.setReducedMotion(true);
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe("dark");
      expect(document.documentElement.dataset.reducedMotion).toBe("true");
    });
  });
});
