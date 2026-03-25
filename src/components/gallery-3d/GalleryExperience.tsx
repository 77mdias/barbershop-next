"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Camera, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import { Gallery } from "@/components/gallery";
import { galleryCollections, galleryImages } from "@/components/gallery-images";
import { GallerySceneBackdrop } from "@/components/gallery-3d/GallerySceneBackdrop";
import { usePrefersReducedMotion, useScrollDepthMotion } from "@/hooks/useScrollDepthMotion";
import { motionDuration, motionEasing, motionIntensity, motionStagger } from "@/lib/motion-tokens";

const valuePillars = [
  {
    icon: Sparkles,
    title: "Curadoria editorial",
    description: "Seleção de cortes com direção visual premium para inspirar sua próxima visita.",
  },
  {
    icon: Camera,
    title: "Portfólio real",
    description: "Referências produzidas com clientes da casa, destacando textura e acabamento.",
  },
  {
    icon: ShieldCheck,
    title: "Padrão técnico",
    description: "Execução consistente, degradês precisos e desenho de barba alinhado ao rosto.",
  },
];

type GalleryStoryboardAct = {
  id: string;
  narrativeIntent: string;
  transitionTrigger: string;
  visualBehavior: string;
  timingByViewport: {
    mobile: string;
    desktop: string;
  };
  uxIntent: "discovery" | "focus" | "cta";
};

const galleryStoryboard = {
  hero: {
    id: "gallery-act-1-hero",
    narrativeIntent: "Contextualizar estilo da casa e abrir caminho para agendamento.",
    transitionTrigger: "Após leitura do hero, os pilares aprofundam confiança técnica.",
    visualBehavior: "Título central + CTAs imediatos com cartões de pilares em sequência.",
    timingByViewport: {
      mobile: "0-34vh (hero + pilares em ritmo linear)",
      desktop: "0-38vh (hero com pilares em três colunas)",
    },
    uxIntent: "discovery",
  },
  collections: {
    id: "gallery-act-2-collections",
    narrativeIntent: "Direcionar a exploração para coleções com linguagem visual distinta.",
    transitionTrigger: "Ao sair do hero, a grade assume protagonismo para comparação rápida.",
    visualBehavior: "Cards de coleção com thumbnails fortes e copy curta.",
    timingByViewport: {
      mobile: "34-70vh (cards em pilha para scanning rápido)",
      desktop: "38-72vh (grid com comparação lateral)",
    },
    uxIntent: "focus",
  },
  portfolio: {
    id: "gallery-act-3-portfolio",
    narrativeIntent: "Fechar descoberta com prova visual extensa e próxima ação.",
    transitionTrigger: "Após seleção de coleção, o portfólio completo consolida decisão.",
    visualBehavior: "Shell único para galeria completa com densidade controlada.",
    timingByViewport: {
      mobile: "70-100vh (imersão no acervo com menor ruído)",
      desktop: "72-100vh (exploração ampla e contínua)",
    },
    uxIntent: "cta",
  },
} satisfies Record<"hero" | "collections" | "portfolio", GalleryStoryboardAct>;

export function GalleryExperience() {
  const reducedMotionFromMotion = useReducedMotion();
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldReduceMotion = reducedMotionFromMotion || prefersReducedMotion;
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const collectionsSectionRef = useRef<HTMLElement | null>(null);
  const portfolioSectionRef = useRef<HTMLElement | null>(null);
  const scrollDepthDisabled = shouldReduceMotion ? "true" : "false";
  const heroAct = galleryStoryboard.hero;
  const collectionsAct = galleryStoryboard.collections;
  const portfolioAct = galleryStoryboard.portfolio;

  const heroIntroDepth = useScrollDepthMotion({
    target: heroSectionRef,
    rangeByViewport: {
      mobile: {
        y: [10, 0, -10],
        scale: [0.996, 1, 1.012],
      },
      desktop: {
        y: [18, 0, -18],
        scale: [0.992, 1, 1.02],
      },
    },
  });

  const pillarsDepth = useScrollDepthMotion({
    target: heroSectionRef,
    rangeByViewport: {
      mobile: {
        y: [8, 0, -8],
        scale: [0.998, 1, 1.012],
      },
      desktop: {
        y: [14, 0, -14],
        scale: [0.994, 1, 1.018],
      },
    },
  });

  const collectionsDepth = useScrollDepthMotion({
    target: collectionsSectionRef,
    rangeByViewport: {
      mobile: {
        y: [10, 0, -10],
        scale: [0.996, 1, 1.014],
      },
      desktop: {
        y: [20, 0, -20],
        scale: [0.992, 1, 1.024],
      },
    },
  });

  const portfolioDepth = useScrollDepthMotion({
    target: portfolioSectionRef,
    rangeByViewport: {
      mobile: {
        y: [8, 0, -8],
        scale: [0.998, 1, 1.012],
      },
      desktop: {
        y: [16, 0, -16],
        scale: [0.994, 1, 1.02],
      },
    },
  });

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <GallerySceneBackdrop />

      <div className="relative z-10">
        <section
          ref={heroSectionRef}
          className="layout-3d-shell rhythm-3d-section pt-[calc(65px+var(--space-3d-2xl))] lg:pt-[calc(65px+var(--space-3d-3xl))]"
          data-storyboard-act={heroAct.id}
          data-storyboard-intent={heroAct.narrativeIntent}
          data-storyboard-transition={heroAct.transitionTrigger}
          data-storyboard-visual={heroAct.visualBehavior}
          data-storyboard-timing-mobile={heroAct.timingByViewport.mobile}
          data-storyboard-timing-desktop={heroAct.timingByViewport.desktop}
          data-ux-intent-primary={heroAct.uxIntent}
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: motionIntensity.revealY.deeper }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: motionDuration.narrative, ease: motionEasing.emphasized }}
            style={
              shouldReduceMotion
                ? undefined
                : {
                    y: heroIntroDepth.y,
                    scale: heroIntroDepth.scale,
                    willChange: "transform",
                  }
            }
            data-scroll-depth="gallery-hero-intro"
            data-ux-intent="discovery"
            data-ux-purpose="orient-primary-message-and-cta"
            data-scroll-depth-profile={heroIntroDepth.profile}
            data-scroll-depth-disabled={scrollDepthDisabled}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="type-3d-label inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.38)] bg-[hsl(var(--accent)/0.12)] px-4 py-1.5 text-accent">
              <Scissors className="h-3.5 w-3.5" />
              Curadoria 3D
            </span>
            <h1 className="type-3d-display mt-6 tracking-tight text-foreground">
              Galeria de Estilos
            </h1>
            <p className="type-3d-body-lg mx-auto mt-4 max-w-3xl text-fg-muted">
              Explore cortes, textura e acabamento em uma experiência imersiva pensada para destacar o repertório da
              barbearia e acelerar sua decisão de agendamento.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/scheduling"
                className="gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent/90"
              >
                Agendar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/promotions"
                className="surface-3d-card inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Ver promoções
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="mt-3d-xl grid gap-3d-md lg:grid-cols-3"
            style={
              shouldReduceMotion
                ? undefined
                : {
                    y: pillarsDepth.y,
                    scale: pillarsDepth.scale,
                    willChange: "transform",
                  }
            }
            data-scroll-depth="gallery-value-pillars"
            data-ux-intent="focus"
            data-ux-purpose="reinforce-technical-trust"
            data-scroll-depth-profile={pillarsDepth.profile}
            data-scroll-depth-disabled={scrollDepthDisabled}
          >
            {valuePillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <motion.article
                  key={pillar.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: motionIntensity.revealY.deeper }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: motionIntensity.viewportAmount.galleryPillar }}
                  transition={{
                    duration: motionDuration.base,
                    delay: motionStagger.galleryPillars(index),
                    ease: motionEasing.emphasized,
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: motionIntensity.hover.liftSoft }}
                  className="surface-3d-card rhythm-3d-stack-sm rounded-2xl p-5"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.16)] text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="type-3d-title-sm mt-4 text-foreground">{pillar.title}</h2>
                  <p className="type-3d-body text-fg-muted">{pillar.description}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </section>

        <section
          ref={collectionsSectionRef}
          className="layout-3d-shell rhythm-3d-section"
          data-storyboard-act={collectionsAct.id}
          data-storyboard-intent={collectionsAct.narrativeIntent}
          data-storyboard-transition={collectionsAct.transitionTrigger}
          data-storyboard-visual={collectionsAct.visualBehavior}
          data-storyboard-timing-mobile={collectionsAct.timingByViewport.mobile}
          data-storyboard-timing-desktop={collectionsAct.timingByViewport.desktop}
          data-ux-intent-primary={collectionsAct.uxIntent}
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: motionIntensity.revealY.deep }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: motionIntensity.viewportAmount.standard }}
            transition={{ duration: motionDuration.smooth, ease: motionEasing.emphasized }}
            className="mb-3d-xl flex flex-col gap-3d-sm sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="rhythm-3d-stack-sm">
              <p className="type-3d-label text-accent">Narrativa visual</p>
              <h2 className="type-3d-title text-foreground">
                Coleções em destaque
              </h2>
              <p className="type-3d-body max-w-3xl text-fg-muted">
                Três direções estéticas para facilitar a escolha do estilo: clássico preciso, textura urbana e
                combinação corte + barba.
              </p>
            </div>
            <Link
              href="/reviews"
              className="type-3d-meta inline-flex items-center gap-2 font-semibold text-accent transition-colors hover:text-accent/80"
            >
              Ver avaliações
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            className="grid gap-3d-md lg:grid-cols-3"
            style={
              shouldReduceMotion
                ? undefined
                : {
                    y: collectionsDepth.y,
                    scale: collectionsDepth.scale,
                    willChange: "transform",
                  }
            }
            data-scroll-depth="gallery-collections-grid"
            data-ux-intent="focus"
            data-ux-purpose="compare-styles-before-full-portfolio"
            data-scroll-depth-profile={collectionsDepth.profile}
            data-scroll-depth-disabled={scrollDepthDisabled}
          >
            {galleryCollections.map((collection, index) => (
              <motion.article
                key={collection.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: motionIntensity.revealY.deep }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: motionIntensity.viewportAmount.galleryCard }}
                transition={{
                  duration: motionDuration.base,
                  delay: motionStagger.galleryCollections(index),
                  ease: motionEasing.emphasized,
                }}
                whileHover={shouldReduceMotion ? undefined : { y: motionIntensity.hover.liftStrong }}
                className="surface-3d-1 overflow-hidden rounded-3xl"
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={collection.heroImage}
                    alt={collection.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    quality={86}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                    {collection.badge}
                  </span>
                </div>
                <div className="rhythm-3d-stack-sm p-5">
                  <h3 className="type-3d-title-sm text-foreground">{collection.title}</h3>
                  <p className="type-3d-body text-fg-muted">{collection.description}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section
          ref={portfolioSectionRef}
          className="layout-3d-shell rhythm-3d-section"
          data-storyboard-act={portfolioAct.id}
          data-storyboard-intent={portfolioAct.narrativeIntent}
          data-storyboard-transition={portfolioAct.transitionTrigger}
          data-storyboard-visual={portfolioAct.visualBehavior}
          data-storyboard-timing-mobile={portfolioAct.timingByViewport.mobile}
          data-storyboard-timing-desktop={portfolioAct.timingByViewport.desktop}
          data-ux-intent-primary={portfolioAct.uxIntent}
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: motionIntensity.revealY.hero }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: motionIntensity.viewportAmount.standard }}
            transition={{ duration: motionDuration.smooth, ease: motionEasing.emphasized }}
            style={
              shouldReduceMotion
                ? undefined
                : {
                    y: portfolioDepth.y,
                    scale: portfolioDepth.scale,
                    willChange: "transform",
                  }
            }
            data-scroll-depth="gallery-portfolio-shell"
            data-ux-intent="cta"
            data-ux-purpose="support-final-selection-and-booking"
            data-scroll-depth-profile={portfolioDepth.profile}
            data-scroll-depth-disabled={scrollDepthDisabled}
            className="surface-3d-1 rounded-[2rem] p-3 sm:p-6"
          >
            <div className="mb-6 flex flex-col gap-3d-sm sm:flex-row sm:items-end sm:justify-between">
              <div className="rhythm-3d-stack-sm">
                <p className="type-3d-label text-accent">Arquivo da barbearia</p>
                <h2 className="type-3d-title text-foreground">
                  Portfólio completo
                </h2>
                <p className="type-3d-body max-w-2xl text-fg-muted">
                  Navegue por toda a coleção, amplie os detalhes no lightbox e traga sua referência para o próximo
                  atendimento.
                </p>
              </div>
              <span className="surface-3d-emphasis type-3d-label inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-fg-subtle">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {galleryImages.length} estilos disponíveis
              </span>
            </div>

            <Gallery
              images={galleryImages}
              columns={3}
              showZoomOverlay
              className="w-full"
            />
          </motion.div>
        </section>
      </div>
    </main>
  );
}
