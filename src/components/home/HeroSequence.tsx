"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FRAME_COUNT = 40;
const currentFrame = (index: number) =>
  `/machine/ezgif-frame-${(index + 1).toString().padStart(3, "0")}.jpg`;

export function HeroSequence() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef({ frame: 0 });

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
        if (loadedCount === FRAME_COUNT) {
          setIsReady(true);
        }
      };
      // For immediate render if cached
      if (img.complete && img.naturalHeight > 0) {
        // count might be off if we don't handle sync load properly
        // but onload still fires correctly in most browsers, or we just rely on react state.
      }
      images.push(img);
    }
    imagesRef.current = images;

    return () => {
      imagesRef.current = [];
    };
  }, []);

  // Set up canvas and GSAP
  useEffect(() => {
    if (!isReady || !containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const render = (index: number) => {
      const img = imagesRef.current[index];
      if (!img || !img.complete) return;
      
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        img,
        0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
      );
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(Math.round(frameRef.current.frame));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const ctx = gsap.context(() => {
      gsap.to(frameRef.current, {
        frame: FRAME_COUNT - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=250%",
          scrub: 0.5,
          pin: true,
        },
        onUpdate: () => render(Math.round(frameRef.current.frame)),
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=250%",
          scrub: true,
        }
      });

      tl.to(".hero-content-layer", { opacity: 0, scale: 1.05, y: -50, ease: "power1.inOut" });
    }, containerRef);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [isReady]);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--accent))]" />
          <p className="mt-4 text-sm font-medium tracking-widest text-fg-subtle uppercase">
            Carregando Experiência... {Math.round((imagesLoaded / FRAME_COUNT) * 100)}%
          </p>
        </div>
      )}

      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        style={{ filter: "brightness(0.65)" }}
      />

      {/* Content Overlay */}
      <div 
        ref={textRef} 
        className={cn(
          "hero-content-layer absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center",
          !isReady ? "opacity-0" : "opacity-100 transition-opacity duration-1000"
        )}
      >
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.35)] bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))] backdrop-blur-md">
          A Evolução do Estilo
        </span>
        
        <h1 className="max-w-4xl font-display text-5xl font-bold italic leading-tight text-white sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-2xl">
          Precisão em <br/> <span className="text-[hsl(var(--accent))]">cada detalhe</span>
        </h1>
        
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg md:text-xl drop-shadow-md">
          Tecnologia, estilo e performance para o seu corte perfeito
        </p>

        <div className="mt-10">
          <Button className="h-14 bg-accent px-10 text-base font-bold uppercase tracking-wider text-on-accent transition-all hover:scale-105 hover:bg-accent/90 shadow-[0_0_20px_rgba(var(--accent),0.3)]">
            Agendar horário
          </Button>
        </div>
      </div>
      
      {/* Gradient Bottom overlay to seamlessly transition to the next section */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
