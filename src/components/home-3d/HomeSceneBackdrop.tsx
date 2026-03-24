"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { SceneQualityTier, SceneTheme } from "@/components/home-3d/HomeSceneCanvas";

const DynamicHomeSceneCanvas = dynamic(
  () => import("@/components/home-3d/HomeSceneCanvas").then((mod) => mod.HomeSceneCanvas),
  { ssr: false },
);

function getInitialTier(): SceneQualityTier {
  if (typeof navigator === "undefined") return "medium";

  const cores = navigator.hardwareConcurrency ?? 4;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 4;

  if (cores <= 4 || memory <= 4) return "low";
  if (cores <= 8 || memory <= 8) return "medium";
  return "high";
}

export function HomeSceneBackdrop() {
  const shouldReduceMotion = useReducedMotion();
  const [tier, setTier] = useState<SceneQualityTier>("medium");
  const [theme, setTheme] = useState<SceneTheme>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTier(getInitialTier());
    setIsMounted(true);

    const root = document.documentElement;
    const updateTheme = () => {
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const showCanvas = useMemo(
    () => isMounted && !shouldReduceMotion,
    [isMounted, shouldReduceMotion],
  );

  return (
    <div
      data-testid="home-3d-backdrop"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(1200px_600px_at_50%_10%,hsl(var(--home-3d-accent-glow)/0.24),transparent_60%),linear-gradient(180deg,hsl(var(--home-3d-bg-1))_0%,hsl(var(--home-3d-bg-2))_52%,hsl(var(--home-3d-bg-3))_100%)]"
      aria-hidden
    >
      {showCanvas ? (
        <DynamicHomeSceneCanvas tier={tier} theme={theme} />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(700px_400px_at_80%_20%,hsl(var(--home-3d-accent-glow)/0.18),transparent_58%),radial-gradient(500px_320px_at_20%_80%,hsl(var(--home-3d-secondary-glow)/0.16),transparent_55%)]" />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,hsl(var(--background)/0.24)_30%,hsl(var(--background)/0.38)_100%)] opacity-30 dark:opacity-45" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.08),transparent_55%)]" />
    </div>
  );
}
