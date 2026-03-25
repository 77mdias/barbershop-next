"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Search, ArrowRight, Star, MapPin, Sparkles, Scissors, Percent, Clock3 } from "lucide-react";
import type { HomePageData } from "@/types/home";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/home/Footer";
import { HomeSceneBackdrop } from "@/components/home-3d/HomeSceneBackdrop";
import { RevealBlock, type RevealViewportTiming } from "@/components/home-3d/RevealBlock";
import { usePrefersReducedMotion, useScrollDepthMotion } from "@/hooks/useScrollDepthMotion";

type HomeExperienceProps = {
  data: HomePageData;
};

const sectionTitles = {
  ritual: "Ritual de precisão",
  schedule: "Agenda orientada por disponibilidade",
  socialProof: "Confiança validada pela comunidade",
};

type HomeStoryboardActKey = "hero" | "services" | "discovery" | "socialProof" | "cta";

type HomeStoryboardAct = {
  id: string;
  label: string;
  narrativeIntent: string;
  transitionTrigger: string;
  visualBehavior: string;
  timingByViewport: {
    mobile: string;
    desktop: string;
  };
  revealByViewport: RevealViewportTiming;
};

const homeStoryboard: Record<HomeStoryboardActKey, HomeStoryboardAct> = {
  hero: {
    id: "act-1-hero",
    label: "Ato 1 - Hero de intenção",
    narrativeIntent: "Apresentar proposta de valor e iniciar a busca já no primeiro bloco.",
    transitionTrigger: "Ao avançar ~20% da viewport, o card de ritual prepara a leitura para o catálogo.",
    visualBehavior: "Headline dominante + busca com card lateral em profundidade curta.",
    timingByViewport: {
      mobile: "0-22vh (reveal linear para leitura sem ruído)",
      desktop: "0-28vh (reveal com composição em duas colunas)",
    },
    revealByViewport: {
      mobile: { delay: 0, y: 20, duration: 0.56, viewportAmount: 0.28 },
      desktop: { delay: 0.04, y: 30, duration: 0.7, viewportAmount: 0.24 },
    },
  },
  services: {
    id: "act-2-services",
    label: "Ato 2 - Serviços em foco",
    narrativeIntent: "Transformar interesse em comparação objetiva de serviços e duração.",
    transitionTrigger: "Depois da busca inicial, o scroll revela cards com feedback de hover em camadas leves.",
    visualBehavior: "Grid de serviços com microparallax de hover e tag de agenda como âncora.",
    timingByViewport: {
      mobile: "22-48vh (cards em sequência para scanning rápido)",
      desktop: "28-52vh (grid completo com leitura paralela por colunas)",
    },
    revealByViewport: {
      mobile: { delay: 0.05, y: 18, duration: 0.54, viewportAmount: 0.22 },
      desktop: { delay: 0.1, y: 26, duration: 0.66, viewportAmount: 0.2 },
    },
  },
  discovery: {
    id: "act-3-discovery",
    label: "Ato 3 - Valor tangível",
    narrativeIntent: "Reforçar decisão com ofertas imediatas e prova de presença local (unidades).",
    transitionTrigger: "Ao fim da grade de serviços, o layout abre duas superfícies para valor e conveniência.",
    visualBehavior: "Bloco duplo (promoções + unidades) com deslocamentos curtos e ênfase de superfície.",
    timingByViewport: {
      mobile: "48-70vh (prioridade ofertas, depois unidades)",
      desktop: "52-74vh (promoções e unidades em paralelo)",
    },
    revealByViewport: {
      mobile: { delay: 0.09, y: 16, duration: 0.54, viewportAmount: 0.2 },
      desktop: { delay: 0.14, y: 24, duration: 0.64, viewportAmount: 0.2 },
    },
  },
  socialProof: {
    id: "act-4-social-proof",
    label: "Ato 4 - Prova social",
    narrativeIntent: "Reduzir fricção final com evidência de satisfação e consistência de atendimento.",
    transitionTrigger: "Após valor/conveniência, o bloco de reviews confirma confiança antes do CTA final.",
    visualBehavior: "Cards de depoimento em malha com reveal progressivo e destaque de avaliação.",
    timingByViewport: {
      mobile: "70-86vh (depoimentos em sequência única)",
      desktop: "74-88vh (malha de reviews com densidade equilibrada)",
    },
    revealByViewport: {
      mobile: { delay: 0.11, y: 14, duration: 0.5, viewportAmount: 0.18 },
      desktop: { delay: 0.16, y: 22, duration: 0.6, viewportAmount: 0.18 },
    },
  },
  cta: {
    id: "act-5-cta",
    label: "Ato 5 - Conversão",
    narrativeIntent: "Encerrar a narrativa com duplo caminho de ação (agendar ou criar conta).",
    transitionTrigger: "O CTA surge após prova social para converter no pico de confiança.",
    visualBehavior: "Painel central com CTA primário, secundário e acesso de retorno para clientes.",
    timingByViewport: {
      mobile: "86-100vh (foco em um CTA por vez)",
      desktop: "88-100vh (bloco amplo com hierarquia de ações)",
    },
    revealByViewport: {
      mobile: { delay: 0.12, y: 12, duration: 0.5, viewportAmount: 0.16 },
      desktop: { delay: 0.18, y: 18, duration: 0.62, viewportAmount: 0.16 },
    },
  },
};

export function HomeExperience({ data }: HomeExperienceProps) {
  const reducedMotionFromMotion = useReducedMotion();
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldReduceMotion = reducedMotionFromMotion || prefersReducedMotion;
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const servicesSectionRef = useRef<HTMLElement | null>(null);
  const discoverySectionRef = useRef<HTMLElement | null>(null);
  const socialProofSectionRef = useRef<HTMLElement | null>(null);
  const heroAct = homeStoryboard.hero;
  const servicesAct = homeStoryboard.services;
  const discoveryAct = homeStoryboard.discovery;
  const socialProofAct = homeStoryboard.socialProof;
  const ctaAct = homeStoryboard.cta;
  const scrollDepthDisabled = shouldReduceMotion ? "true" : "false";

  const heroAsideDepth = useScrollDepthMotion({
    target: heroSectionRef,
    rangeByViewport: {
      mobile: {
        x: [4, 0, -4],
        y: [10, 0, -10],
        scale: [0.996, 1, 1.012],
      },
      desktop: {
        x: [12, 0, -12],
        y: [20, 0, -20],
        scale: [0.99, 1, 1.024],
      },
    },
  });

  const servicesGridDepth = useScrollDepthMotion({
    target: servicesSectionRef,
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

  const discoveryOffersDepth = useScrollDepthMotion({
    target: discoverySectionRef,
    rangeByViewport: {
      mobile: {
        x: [-4, 0, 4],
        y: [10, 0, -10],
        scale: [0.996, 1, 1.014],
      },
      desktop: {
        x: [-10, 0, 10],
        y: [18, 0, -18],
        scale: [0.992, 1, 1.022],
      },
    },
  });

  const discoverySalonsDepth = useScrollDepthMotion({
    target: discoverySectionRef,
    rangeByViewport: {
      mobile: {
        x: [4, 0, -4],
        y: [12, 0, -12],
        scale: [0.996, 1, 1.014],
      },
      desktop: {
        x: [10, 0, -10],
        y: [20, 0, -20],
        scale: [0.992, 1, 1.022],
      },
    },
  });

  const socialGridDepth = useScrollDepthMotion({
    target: socialProofSectionRef,
    rangeByViewport: {
      mobile: {
        y: [8, 0, -8],
        scale: [0.998, 1, 1.012],
      },
      desktop: {
        y: [14, 0, -14],
        scale: [0.995, 1, 1.018],
      },
    },
  });

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <HomeSceneBackdrop />

      <div className="relative z-10 flex flex-col">
        <section
          ref={heroSectionRef}
          className="layout-3d-shell rhythm-3d-section pt-[calc(65px+var(--space-3d-xl))] lg:pt-[calc(65px+var(--space-3d-2xl))]"
          aria-label={heroAct.label}
          data-storyboard-act={heroAct.id}
          data-storyboard-intent={heroAct.narrativeIntent}
          data-storyboard-transition={heroAct.transitionTrigger}
          data-storyboard-visual={heroAct.visualBehavior}
          data-storyboard-timing-mobile={heroAct.timingByViewport.mobile}
          data-storyboard-timing-desktop={heroAct.timingByViewport.desktop}
        >
          <RevealBlock narrativeLabel={heroAct.label} revealByViewport={heroAct.revealByViewport}>
            <span className="type-3d-label inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent)/0.12)] px-4 py-2 text-[hsl(var(--accent))]">
              <Sparkles className="h-3.5 w-3.5" />
              Nova Home 3D
            </span>

            <div className="mt-3d-xl grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
              <div className="rhythm-3d-stack-md">
                <h1 className="type-3d-display max-w-4xl text-foreground">
                  {data.hero.title}
                </h1>
                <p className="type-3d-body-lg max-w-2xl text-fg-muted">
                  {data.hero.subtitle}
                </p>

                <form action={data.hero.action} method="GET" className="flex max-w-2xl flex-col gap-3d-sm sm:flex-row">
                  <label className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                    <Input
                      name="query"
                      defaultValue={data.hero.defaultQuery}
                      placeholder={data.hero.placeholder}
                      className={cn(
                        "h-13 border-surface-border-3d bg-surface-3d-card pl-11 text-foreground placeholder:text-fg-subtle",
                        "focus:border-[hsl(var(--accent)/0.9)] focus:ring-[hsl(var(--accent)/0.4)]",
                      )}
                    />
                  </label>
                  <Button className="h-13 min-w-48 bg-accent px-6 font-semibold text-on-accent hover:bg-accent/90">
                    {data.hero.ctaLabel}
                  </Button>
                </form>
              </div>

              <motion.aside
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={
                  shouldReduceMotion
                    ? undefined
                    : {
                        x: heroAsideDepth.x,
                        y: heroAsideDepth.y,
                        scale: heroAsideDepth.scale,
                        willChange: "transform",
                      }
                }
                data-scroll-depth="home-hero-aside"
                data-scroll-depth-profile={heroAsideDepth.profile}
                data-scroll-depth-disabled={scrollDepthDisabled}
                className="surface-3d-card rhythm-3d-stack-md rounded-2xl p-6"
              >
                <h2 className="type-3d-label text-fg-subtle">
                  {sectionTitles.ritual}
                </h2>
                <p className="type-3d-body text-fg-muted">
                  Corte, barba e acabamento em fluxo contínuo: escolha serviço, compare unidades e confirme no mesmo percurso.
                </p>
                <div className="grid gap-3d-sm text-sm text-foreground">
                  {data.services.items.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="surface-3d-emphasis flex items-center justify-between rounded-xl px-3 py-2"
                    >
                      <span className="truncate pr-3">{service.name}</span>
                      <span className="text-[hsl(var(--accent))]">{service.durationLabel}</span>
                    </div>
                  ))}
                </div>
              </motion.aside>
            </div>
          </RevealBlock>
        </section>

        <section
          ref={servicesSectionRef}
          className="layout-3d-shell rhythm-3d-section"
          aria-label={servicesAct.label}
          data-storyboard-act={servicesAct.id}
          data-storyboard-intent={servicesAct.narrativeIntent}
          data-storyboard-transition={servicesAct.transitionTrigger}
          data-storyboard-visual={servicesAct.visualBehavior}
          data-storyboard-timing-mobile={servicesAct.timingByViewport.mobile}
          data-storyboard-timing-desktop={servicesAct.timingByViewport.desktop}
        >
          <RevealBlock narrativeLabel={servicesAct.label} revealByViewport={servicesAct.revealByViewport}>
            <div className="mb-3d-xl flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="rhythm-3d-stack-sm">
                <h2 className="type-3d-title text-foreground">
                  {data.services.title}
                </h2>
                <p className="type-3d-body max-w-2xl text-fg-muted">{data.services.subtitle}</p>
              </div>
              <p className="surface-3d-emphasis type-3d-label rounded-full px-4 py-2 text-fg-subtle">
                {sectionTitles.schedule}
              </p>
            </div>
          </RevealBlock>

          <motion.div
            className="grid gap-3d-md md:grid-cols-2 xl:grid-cols-4"
            style={
              shouldReduceMotion
                ? undefined
                : {
                    y: servicesGridDepth.y,
                    scale: servicesGridDepth.scale,
                    willChange: "transform",
                  }
            }
            data-scroll-depth="home-services-grid"
            data-scroll-depth-profile={servicesGridDepth.profile}
            data-scroll-depth-disabled={scrollDepthDisabled}
          >
            {data.services.items.map((service, index) => (
              <motion.article
                key={service.id}
                whileHover={shouldReduceMotion ? undefined : { y: -6, rotateX: 3, rotateY: index % 2 === 0 ? -2 : 2 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="surface-3d-card group rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.25)] text-[hsl(var(--accent))]">
                    <Scissors className="h-4 w-4" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.55)] px-2.5 py-1 text-xs text-fg-subtle">
                    <Clock3 className="h-3 w-3" />
                    {service.durationLabel}
                  </span>
                </div>
                <h3 className="type-3d-title-sm mt-5 text-foreground">{service.name}</h3>
                <p className="type-3d-body mt-2 min-h-12 text-fg-muted">{service.description || "Atendimento sob medida para seu estilo."}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="type-3d-price text-[hsl(var(--accent))]">{service.priceLabel}</span>
                  <Link
                    href={service.href}
                    className="type-3d-meta inline-flex items-center gap-1 font-semibold text-foreground transition-colors hover:text-[hsl(var(--accent))]"
                  >
                    Ver
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section
          ref={discoverySectionRef}
          className="layout-3d-shell rhythm-3d-section"
          aria-label={discoveryAct.label}
          data-storyboard-act={discoveryAct.id}
          data-storyboard-intent={discoveryAct.narrativeIntent}
          data-storyboard-transition={discoveryAct.transitionTrigger}
          data-storyboard-visual={discoveryAct.visualBehavior}
          data-storyboard-timing-mobile={discoveryAct.timingByViewport.mobile}
          data-storyboard-timing-desktop={discoveryAct.timingByViewport.desktop}
        >
          <div className="grid gap-8 lg:grid-cols-[1.3fr_minmax(0,1fr)]">
            <motion.div
              style={
                shouldReduceMotion
                  ? undefined
                  : {
                      x: discoveryOffersDepth.x,
                      y: discoveryOffersDepth.y,
                      scale: discoveryOffersDepth.scale,
                      willChange: "transform",
                    }
              }
              data-scroll-depth="home-discovery-offers"
              data-scroll-depth-profile={discoveryOffersDepth.profile}
              data-scroll-depth-disabled={scrollDepthDisabled}
            >
              <RevealBlock
                className="surface-3d-1 rounded-3xl p-3d-lg lg:p-3d-xl"
                narrativeLabel={`${discoveryAct.label} / ofertas`}
                revealByViewport={discoveryAct.revealByViewport}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="type-3d-title text-foreground">
                    {data.promotions.title}
                  </h2>
                  <Link
                    href={data.promotions.ctaHref}
                    className="type-3d-meta inline-flex items-center gap-2 font-semibold text-[hsl(var(--accent))] hover:text-[hsl(var(--accent)/0.84)]"
                  >
                    {data.promotions.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-7 space-y-4">
                  {data.promotions.items.map((promo) => (
                    <motion.div
                      key={promo.id}
                      whileHover={shouldReduceMotion ? undefined : { x: 4 }}
                      className="surface-3d-emphasis rounded-xl p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="type-3d-label inline-flex items-center gap-1 rounded-full border border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent)/0.16)] px-2.5 py-1 text-[hsl(var(--accent))]">
                          <Percent className="h-3 w-3" />
                          {promo.badgeLabel}
                        </span>
                        {promo.expiresLabel ? (
                          <span className="type-3d-meta text-fg-subtle">{promo.expiresLabel}</span>
                        ) : null}
                      </div>
                      <h3 className="type-3d-title-sm mt-3 text-foreground">{promo.title}</h3>
                      {promo.description ? <p className="type-3d-body mt-1 text-fg-muted">{promo.description}</p> : null}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <code className="type-3d-label rounded-lg border border-dashed border-[hsl(var(--accent)/0.45)] bg-[hsl(var(--accent)/0.12)] px-3 py-1.5 text-[hsl(var(--accent))]">
                          {promo.code}
                        </code>
                        <Link
                          href={promo.href}
                          className="type-3d-meta font-semibold text-foreground transition-colors hover:text-[hsl(var(--accent))]"
                        >
                          Aplicar oferta
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </RevealBlock>
            </motion.div>

            <motion.div
              style={
                shouldReduceMotion
                  ? undefined
                  : {
                      x: discoverySalonsDepth.x,
                      y: discoverySalonsDepth.y,
                      scale: discoverySalonsDepth.scale,
                      willChange: "transform",
                    }
              }
              data-scroll-depth="home-discovery-salons"
              data-scroll-depth-profile={discoverySalonsDepth.profile}
              data-scroll-depth-disabled={scrollDepthDisabled}
            >
              <RevealBlock
                className="surface-3d-1 rounded-3xl p-3d-lg lg:p-3d-xl"
                narrativeLabel={`${discoveryAct.label} / unidades`}
                revealByViewport={{
                  mobile: { delay: 0.18, y: 14, duration: 0.52, viewportAmount: 0.18 },
                  desktop: { delay: 0.26, y: 22, duration: 0.62, viewportAmount: 0.18 },
                }}
              >
                <h2 className="type-3d-title text-foreground">
                  {data.salons.title}
                </h2>
                <p className="type-3d-body mt-2 text-fg-muted">Navegue pelas unidades com melhor avaliação e proximidade.</p>
                <div className="mt-6 space-y-4">
                  {data.salons.items.slice(0, 3).map((salon) => (
                    <motion.article
                      key={salon.id}
                      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                      className="surface-3d-emphasis overflow-hidden rounded-xl"
                    >
                      <div className="relative h-28 w-full">
                        <Image src={salon.imageUrl} alt={salon.name} fill className="object-cover" />
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="type-3d-body-lg font-semibold text-foreground">{salon.name}</h3>
                          <span className="type-3d-meta inline-flex items-center gap-1 text-[hsl(var(--accent))]">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {salon.ratingLabel}
                          </span>
                        </div>
                        <p className="type-3d-meta inline-flex items-start gap-1.5 text-fg-muted">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>{salon.address}</span>
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="type-3d-meta text-fg-subtle">{salon.distanceLabel}</span>
                          <Link href={salon.href} className="type-3d-meta font-semibold text-foreground hover:text-[hsl(var(--accent))]">
                            Ver unidade
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
                <Link
                  href={data.salons.ctaHref}
                  className="type-3d-meta mt-5 inline-flex items-center gap-1 font-semibold text-[hsl(var(--accent))] hover:text-[hsl(var(--accent)/0.84)]"
                >
                  {data.salons.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </RevealBlock>
            </motion.div>
          </div>
        </section>

        <section
          ref={socialProofSectionRef}
          className="layout-3d-shell rhythm-3d-section"
          aria-label={socialProofAct.label}
          data-storyboard-act={socialProofAct.id}
          data-storyboard-intent={socialProofAct.narrativeIntent}
          data-storyboard-transition={socialProofAct.transitionTrigger}
          data-storyboard-visual={socialProofAct.visualBehavior}
          data-storyboard-timing-mobile={socialProofAct.timingByViewport.mobile}
          data-storyboard-timing-desktop={socialProofAct.timingByViewport.desktop}
        >
          <RevealBlock
            className="mb-8 flex items-center justify-between gap-4"
            narrativeLabel={socialProofAct.label}
            revealByViewport={socialProofAct.revealByViewport}
          >
            <h2 className="type-3d-title text-foreground">{data.reviews.title}</h2>
            <p className="type-3d-label max-w-sm text-right text-fg-subtle">
              {sectionTitles.socialProof}
            </p>
          </RevealBlock>

          <motion.div
            className="grid gap-3d-md md:grid-cols-2 xl:grid-cols-4"
            style={
              shouldReduceMotion
                ? undefined
                : {
                    y: socialGridDepth.y,
                    scale: socialGridDepth.scale,
                    willChange: "transform",
                  }
            }
            data-scroll-depth="home-social-grid"
            data-scroll-depth-profile={socialGridDepth.profile}
            data-scroll-depth-disabled={scrollDepthDisabled}
          >
            {data.reviews.items.map((review, reviewIndex) => (
              <RevealBlock
                key={review.id}
                className="surface-3d-card rounded-2xl p-5"
                delay={reviewIndex * 0.05}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={review.avatarUrl}
                    alt={review.author}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="type-3d-body-lg font-semibold text-foreground">{review.author}</p>
                    <p className="type-3d-meta text-[hsl(var(--accent))]">{review.serviceName}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[hsl(var(--accent))]">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={`${review.id}-star-${idx}`}
                      className={cn("h-3.5 w-3.5", idx < review.rating ? "fill-current" : "text-[hsl(var(--fg-subtle)/0.5)]")}
                    />
                  ))}
                </div>
                <p className="type-3d-body mt-3 text-fg-muted">&ldquo;{review.comment}&rdquo;</p>
              </RevealBlock>
            ))}
          </motion.div>
        </section>

        <section
          className="layout-3d-shell rhythm-3d-section rhythm-3d-section-tight"
          aria-label={ctaAct.label}
          data-storyboard-act={ctaAct.id}
          data-storyboard-intent={ctaAct.narrativeIntent}
          data-storyboard-transition={ctaAct.transitionTrigger}
          data-storyboard-visual={ctaAct.visualBehavior}
          data-storyboard-timing-mobile={ctaAct.timingByViewport.mobile}
          data-storyboard-timing-desktop={ctaAct.timingByViewport.desktop}
        >
          <RevealBlock
            className="surface-3d-1 rounded-3xl p-8 text-center lg:p-12"
            narrativeLabel={ctaAct.label}
            revealByViewport={ctaAct.revealByViewport}
          >
            <h2 className="type-3d-title text-foreground lg:text-5xl">
              {data.bookingCta.title}
            </h2>
            <p className="type-3d-body mx-auto mt-4 max-w-2xl text-fg-muted">{data.bookingCta.description}</p>

            <div className="mt-8 flex flex-col justify-center gap-3d-sm sm:flex-row">
              <Button asChild className="h-12 bg-accent px-8 font-semibold text-on-accent hover:bg-accent/90">
                <Link href={data.bookingCta.primaryHref}>{data.bookingCta.primaryLabel}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 border-surface-border-3d bg-transparent px-8 text-foreground hover:bg-surface-3d-emphasis hover:text-foreground"
              >
                <Link href={data.bookingCta.secondaryHref}>{data.bookingCta.secondaryLabel}</Link>
              </Button>
            </div>

            <p className="type-3d-body mt-5 text-fg-subtle">
              Já é cliente?
              <Link
                href={data.bookingCta.signinHref}
                className="ml-1.5 font-semibold text-[hsl(var(--accent))] hover:text-[hsl(var(--accent)/0.84)]"
              >
                Entrar
              </Link>
            </p>
          </RevealBlock>
        </section>

        <Footer {...data.footer} className="relative z-10 bg-transparent text-foreground" />
      </div>
    </main>
  );
}
