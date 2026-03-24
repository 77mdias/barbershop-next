"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { GallerySceneQualityTier, GallerySceneTheme } from "@/components/gallery-3d/GallerySceneCanvas";

const DynamicGallerySceneCanvas = dynamic(
  () => import("@/components/gallery-3d/GallerySceneCanvas").then((mod) => mod.GallerySceneCanvas),
  { ssr: false },
);

function getInitialTier(): GallerySceneQualityTier {
  if (typeof navigator === "undefined") return "medium";

  const cores = navigator.hardwareConcurrency ?? 4;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 4;

  if (cores <= 4 || memory <= 4) return "low";
  if (cores <= 8 || memory <= 8) return "medium";
  return "high";
}

export function GallerySceneBackdrop() {
  const shouldReduceMotion = useReducedMotion();
  const [tier, setTier] = useState<GallerySceneQualityTier>("medium");
  const [theme, setTheme] = useState<GallerySceneTheme>("light");
  const [webglEnabled, setWebglEnabled] = useState(true);
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

    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setWebglEnabled(Boolean(context));
    } catch {
      setWebglEnabled(false);
    }

    return () => observer.disconnect();
  }, []);

  const showCanvas = useMemo(
    () => isMounted && !shouldReduceMotion && webglEnabled,
    [isMounted, shouldReduceMotion, webglEnabled],
  );

  return (
    <div
      data-testid="gallery-3d-backdrop"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(900px_420px_at_18%_18%,hsl(var(--accent)/0.18),transparent_62%),radial-gradient(860px_420px_at_82%_8%,hsl(var(--primary)/0.12),transparent_64%),linear-gradient(180deg,hsl(var(--surface-1))_0%,hsl(var(--surface-2))_52%,hsl(var(--background))_100%)]"
      aria-hidden
    >
      {showCanvas ? (
        <DynamicGallerySceneCanvas tier={tier} theme={theme} />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(720px_420px_at_80%_16%,hsl(var(--accent)/0.16),transparent_58%),radial-gradient(520px_320px_at_18%_78%,hsl(var(--primary)/0.14),transparent_56%)]" />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.08)_0%,hsl(var(--background)/0.42)_44%,hsl(var(--background)/0.8)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,hsl(var(--accent)/0.1),transparent_56%)] dark:bg-[radial-gradient(ellipse_at_50%_18%,hsl(var(--accent)/0.14),transparent_58%)]" />
    </div>
  );
}
