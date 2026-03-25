"use client";

import { useEffect, useState, type RefObject } from "react";
import { useScroll, useTransform } from "motion/react";

type ScrollDepthAxisRange = [number, number, number];

export type ScrollDepthRange = {
  x?: ScrollDepthAxisRange;
  y: ScrollDepthAxisRange;
  scale: ScrollDepthAxisRange;
};

export type ScrollDepthRangeByViewport = {
  mobile: ScrollDepthRange;
  desktop: ScrollDepthRange;
};

type UseScrollDepthMotionOptions = {
  target: RefObject<HTMLElement | null>;
  rangeByViewport: ScrollDepthRangeByViewport;
  offset?: readonly ["start end", "end start"];
};

const DEFAULT_OFFSET = ["start end", "end start"] as const;

function getInitialMediaQueryState(query: string): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(query).matches;
}

function useMediaQueryMatches(query: string): boolean {
  const [matches, setMatches] = useState(() => getInitialMediaQueryState(query));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    const syncMatchState = (event?: MediaQueryListEvent) => {
      setMatches(event ? event.matches : mediaQuery.matches);
    };

    syncMatchState();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncMatchState);
      return () => mediaQuery.removeEventListener("change", syncMatchState);
    }

    mediaQuery.addListener(syncMatchState);
    return () => mediaQuery.removeListener(syncMatchState);
  }, [query]);

  return matches;
}

export function useDesktopViewport(): boolean {
  return useMediaQueryMatches("(min-width: 1024px)");
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQueryMatches("(prefers-reduced-motion: reduce)");
}

export function useScrollDepthMotion({
  target,
  rangeByViewport,
  offset = DEFAULT_OFFSET,
}: UseScrollDepthMotionOptions) {
  const isDesktopViewport = useDesktopViewport();
  const activeRange = isDesktopViewport ? rangeByViewport.desktop : rangeByViewport.mobile;
  const resolvedOffset: ["start end", "end start"] = [offset[0], offset[1]];
  const { scrollYProgress } = useScroll({
    target,
    offset: resolvedOffset,
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], activeRange.y);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], activeRange.scale);
  const xRange: ScrollDepthAxisRange = activeRange.x ?? [0, 0, 0];
  const xValue = useTransform(scrollYProgress, [0, 0.5, 1], xRange);
  const x = activeRange.x ? xValue : undefined;
  const profile = isDesktopViewport ? "desktop" : "mobile";

  return {
    x,
    y,
    scale,
    profile,
  };
}
