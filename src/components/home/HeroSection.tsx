"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HERO_VIDEO_SRC = "/videos/Machine_disassembling_into_202603241956.mp4";
const HERO_TITLE = "Precisão em cada detalhe";
const HERO_SUBTITLE = "Tecnologia, estilo e performance para o seu corte perfeito";

type HeroSectionProps = {
  className?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function HeroSection({ className }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoFrameRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const durationRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const videoFrame = videoFrameRef.current;

    if (!section || !video || !videoFrame) return;

    let isActive = true;
    let gsapContext: { revert: () => void } | undefined;

    const handleLoadedMetadata = () => {
      durationRef.current = Number.isFinite(video.duration) ? video.duration : 0;
      if (durationRef.current > 0) video.currentTime = 0;
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    if (shouldReduceMotion) {
      video.currentTime = 0;
      videoFrame.style.transform = "scale(1)";
      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }

    const startSmoothingLoop = () => {
      // Smoothly interpolate toward scroll progress to avoid abrupt time jumps in the video.
      const tick = () => {
        if (!isActive) return;
        const target = targetProgressRef.current;
        const next = currentProgressRef.current + (target - currentProgressRef.current) * 0.14;
        const progress = clamp(next, 0, 1);
        currentProgressRef.current = progress;

        if (durationRef.current > 0) {
          const nextTime = progress * durationRef.current;
          if (Math.abs(video.currentTime - nextTime) > 0.01) {
            video.currentTime = nextTime;
          }
        }

        const scale = 1 + progress * 0.08;
        videoFrame.style.transform = `scale(${scale})`;
        rafIdRef.current = window.requestAnimationFrame(tick);
      };

      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    const setupScrollAnimation = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (!isActive || !sectionRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      gsapContext = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=200%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            targetProgressRef.current = self.progress;
          },
        });

        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=200%",
            scrub: true,
          },
        })
          .fromTo(titleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22 }, 0.04)
          .to(titleRef.current, { y: -24, opacity: 0.35, duration: 0.24 }, 0.58)
          .fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18 }, 0.18)
          .to(subtitleRef.current, { y: -16, opacity: 0.2, duration: 0.22 }, 0.62)
          .fromTo(ctaRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.16 }, 0.32)
          .to(ctaRef.current, { y: -10, opacity: 0.08, duration: 0.2 }, 0.82);
      }, section);

      startSmoothingLoop();
      ScrollTrigger.refresh();
    };

    void setupScrollAnimation();

    return () => {
      isActive = false;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      gsapContext?.revert();
    };
  }, [shouldReduceMotion]);

  return (
    <section
      ref={sectionRef}
      data-testid="premium-hero"
      className={cn(
        "relative h-screen w-full overflow-hidden bg-[hsl(var(--hero-bg))] text-[hsl(var(--hero-fg))]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_640px_at_50%_18%,hsl(var(--accent)/0.25),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(0_0%_0%/0.1)_0%,hsl(0_0%_0%/0.65)_100%)]" />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div
          ref={videoFrameRef}
          className="relative h-[70vh] w-full max-w-6xl overflow-hidden rounded-[1.9rem] border border-white/10 bg-black/60 shadow-[0_35px_120px_-48px_rgba(0,0,0,0.92)] will-change-transform"
        >
          <video
            ref={videoRef}
            data-testid="hero-scroll-video"
            className="h-full w-full object-cover"
            src={HERO_VIDEO_SRC}
            muted
            preload="auto"
            playsInline
            autoPlay={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(0_0%_100%/0.03)_0%,transparent_56%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(0_0%_0%/0.08)_0%,hsl(0_0%_0%/0.5)_85%,hsl(0_0%_0%/0.75)_100%)]" />
        </div>
      </div>

      <div className="relative z-10 flex h-full items-end justify-center px-4 pb-14 sm:pb-20">
        <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/[0.07] px-6 py-6 text-center backdrop-blur-xl sm:px-8 sm:py-8">
          <h1 ref={titleRef} className="font-display text-4xl font-bold italic tracking-tight sm:text-5xl lg:text-6xl">
            {HERO_TITLE}
          </h1>
          <p ref={subtitleRef} className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[hsl(var(--hero-muted))] sm:text-lg">
            {HERO_SUBTITLE}
          </p>
          <div ref={ctaRef} className="mt-7">
            <Button asChild className="h-12 rounded-xl bg-accent px-8 font-semibold text-on-accent hover:bg-accent/90">
              <Link href="/scheduling">Agendar horário</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
