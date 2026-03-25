"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type RevealMotionConfig = {
  delay?: number;
  y?: number;
  duration?: number;
  viewportAmount?: number;
};

export type RevealViewportTiming = {
  mobile?: RevealMotionConfig;
  desktop?: RevealMotionConfig;
};

type RevealBlockProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  revealByViewport?: RevealViewportTiming;
  narrativeLabel?: string;
};

export function RevealBlock({
  children,
  className,
  delay = 0,
  y = 28,
  revealByViewport,
  narrativeLabel,
}: RevealBlockProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }

    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncViewport = (event?: MediaQueryListEvent) => {
      setIsDesktopViewport(event ? event.matches : mediaQuery.matches);
    };

    syncViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  const viewportConfig = isDesktopViewport ? revealByViewport?.desktop : revealByViewport?.mobile;
  const resolvedDelay = viewportConfig?.delay ?? delay;
  const resolvedY = viewportConfig?.y ?? y;
  const resolvedDuration = viewportConfig?.duration ?? 0.65;
  const resolvedViewportAmount = viewportConfig?.viewportAmount ?? 0.2;
  const revealProfile = isDesktopViewport ? "desktop" : "mobile";

  if (shouldReduceMotion) {
    return (
      <div
        className={cn(className)}
        data-reveal-label={narrativeLabel}
        data-reveal-profile={revealProfile}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      data-reveal-label={narrativeLabel}
      data-reveal-profile={revealProfile}
      initial={{ opacity: 0, y: resolvedY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: resolvedViewportAmount }}
      transition={{ duration: resolvedDuration, delay: resolvedDelay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
