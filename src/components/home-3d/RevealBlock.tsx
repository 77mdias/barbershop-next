"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { motionDelay, motionDuration, motionEasing, motionIntensity, type MotionEasing } from "@/lib/motion-tokens";

type RevealMotionConfig = {
  delay?: number;
  y?: number;
  duration?: number;
  viewportAmount?: number;
  ease?: MotionEasing;
};

export type RevealViewportTiming = {
  mobile?: RevealMotionConfig;
  desktop?: RevealMotionConfig;
};

type RevealBlockProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  revealByViewport?: RevealViewportTiming;
  narrativeLabel?: string;
};

export function RevealBlock({
  children,
  className,
  delay = motionDelay.none,
  revealByViewport,
  narrativeLabel,
}: RevealBlockProps) {
  const shouldReduceMotion = useReducedMotion();
  const [canAnimate, setCanAnimate] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }

    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    const hasIntersectionObserver =
      typeof window !== "undefined" && typeof window.IntersectionObserver === "function";

    setCanAnimate(hasIntersectionObserver);
  }, []);

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
  const resolvedDelay = viewportConfig?.delay ?? delay ?? motionDelay.none;
  const resolvedDuration = viewportConfig?.duration ?? motionDuration.narrative;
  const resolvedViewportAmount = viewportConfig?.viewportAmount ?? motionIntensity.viewportAmount.standard;
  const resolvedEase = viewportConfig?.ease ?? motionEasing.emphasized;
  const revealProfile = isDesktopViewport ? "desktop" : "mobile";

  if (shouldReduceMotion || !canAnimate) {
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
      initial={false}
      style={{ opacity: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: resolvedViewportAmount }}
      transition={{ duration: resolvedDuration, delay: resolvedDelay, ease: resolvedEase }}
    >
      {children}
    </motion.div>
  );
}
