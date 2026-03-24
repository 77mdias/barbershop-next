"use client";

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
import { RevealBlock } from "@/components/home-3d/RevealBlock";

type HomeExperienceProps = {
  data: HomePageData;
};

const sectionTitles = {
  ritual: "Ritual de precisão",
  schedule: "Agenda orientada por disponibilidade",
  socialProof: "Confiança validada pela comunidade",
};

export function HomeExperience({ data }: HomeExperienceProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <HomeSceneBackdrop />

      <div className="relative z-10 flex flex-col">
        <section className="container mx-auto w-full px-4 pb-16 pt-16 sm:pt-24 lg:pb-20 lg:pt-28">
          <RevealBlock>
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent)/0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
              <Sparkles className="h-3.5 w-3.5" />
              Nova Home 3D
            </span>

            <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
              <div>
                <h1 className="max-w-4xl font-display text-4xl font-bold italic leading-tight text-foreground sm:text-5xl lg:text-7xl">
                  {data.hero.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
                  {data.hero.subtitle}
                </p>

                <form action={data.hero.action} method="GET" className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
                  <label className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                    <Input
                      name="query"
                      defaultValue={data.hero.defaultQuery}
                      placeholder={data.hero.placeholder}
                      className={cn(
                        "h-13 border-[hsl(var(--border)/0.55)] bg-[hsl(var(--surface-card)/0.74)] pl-11 text-foreground placeholder:text-fg-subtle",
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
                className="rounded-2xl border border-[hsl(var(--border)/0.45)] bg-[hsl(var(--surface-card)/0.72)] p-6 backdrop-blur-md"
              >
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-fg-subtle">
                  {sectionTitles.ritual}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  Corte, barba e acabamento em fluxo contínuo: escolha serviço, compare unidades e confirme no mesmo percurso.
                </p>
                <div className="mt-6 grid gap-3 text-sm text-foreground">
                  {data.services.items.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--surface-emphasis)/0.58)] px-3 py-2"
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

        <section className="container mx-auto w-full px-4 py-16 lg:py-20">
          <RevealBlock>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold italic text-foreground sm:text-4xl">
                  {data.services.title}
                </h2>
                <p className="mt-2 max-w-2xl text-fg-muted">{data.services.subtitle}</p>
              </div>
              <p className="rounded-full border border-[hsl(var(--border)/0.45)] bg-[hsl(var(--surface-emphasis)/0.58)] px-4 py-2 text-xs uppercase tracking-[0.16em] text-fg-subtle">
                {sectionTitles.schedule}
              </p>
            </div>
          </RevealBlock>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {data.services.items.map((service, index) => (
              <motion.article
                key={service.id}
                whileHover={shouldReduceMotion ? undefined : { y: -6, rotateX: 3, rotateY: index % 2 === 0 ? -2 : 2 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="group rounded-2xl border border-[hsl(var(--border)/0.45)] bg-[hsl(var(--surface-card)/0.72)] p-6 backdrop-blur-md"
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
                <h3 className="mt-5 font-display text-xl font-semibold italic text-foreground">{service.name}</h3>
                <p className="mt-2 min-h-12 text-sm text-fg-muted">{service.description || "Atendimento sob medida para seu estilo."}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-lg font-semibold text-[hsl(var(--accent))]">{service.priceLabel}</span>
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-[hsl(var(--accent))]"
                  >
                    Ver
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="container mx-auto w-full px-4 py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_minmax(0,1fr)]">
            <RevealBlock className="rounded-3xl border border-[hsl(var(--border)/0.45)] bg-[hsl(var(--surface-card)/0.76)] p-7 backdrop-blur-md lg:p-9">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-display text-3xl font-bold italic text-foreground sm:text-4xl">
                  {data.promotions.title}
                </h2>
                <Link
                  href={data.promotions.ctaHref}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] hover:text-[hsl(var(--accent)/0.84)]"
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
                    className="rounded-xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--surface-emphasis)/0.6)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent)/0.16)] px-2.5 py-1 text-xs uppercase tracking-[0.12em] text-[hsl(var(--accent))]">
                        <Percent className="h-3 w-3" />
                        {promo.badgeLabel}
                      </span>
                      {promo.expiresLabel ? (
                        <span className="text-xs text-fg-subtle">{promo.expiresLabel}</span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{promo.title}</h3>
                    {promo.description ? <p className="mt-1 text-sm text-fg-muted">{promo.description}</p> : null}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <code className="rounded-lg border border-dashed border-[hsl(var(--accent)/0.45)] bg-[hsl(var(--accent)/0.12)] px-3 py-1.5 text-xs font-bold tracking-[0.14em] text-[hsl(var(--accent))]">
                        {promo.code}
                      </code>
                      <Link
                        href={promo.href}
                        className="text-sm font-semibold text-foreground transition-colors hover:text-[hsl(var(--accent))]"
                      >
                        Aplicar oferta
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </RevealBlock>

            <RevealBlock
              className="rounded-3xl border border-[hsl(var(--border)/0.45)] bg-[hsl(var(--surface-card)/0.72)] p-7 backdrop-blur-md lg:p-9"
              delay={0.1}
            >
              <h2 className="font-display text-3xl font-bold italic text-foreground sm:text-4xl">
                {data.salons.title}
              </h2>
              <p className="mt-2 text-sm text-fg-muted">Navegue pelas unidades com melhor avaliação e proximidade.</p>
              <div className="mt-6 space-y-4">
                {data.salons.items.slice(0, 3).map((salon) => (
                  <motion.article
                    key={salon.id}
                    whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                    className="overflow-hidden rounded-xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--surface-emphasis)/0.6)]"
                  >
                    <div className="relative h-28 w-full">
                      <Image src={salon.imageUrl} alt={salon.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-2 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-foreground">{salon.name}</h3>
                        <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--accent))]">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {salon.ratingLabel}
                        </span>
                      </div>
                      <p className="inline-flex items-start gap-1.5 text-xs text-fg-muted">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{salon.address}</span>
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-fg-subtle">{salon.distanceLabel}</span>
                        <Link href={salon.href} className="text-xs font-semibold text-foreground hover:text-[hsl(var(--accent))]">
                          Ver unidade
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
              <Link
                href={data.salons.ctaHref}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--accent))] hover:text-[hsl(var(--accent)/0.84)]"
              >
                {data.salons.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </RevealBlock>
          </div>
        </section>

        <section className="container mx-auto w-full px-4 py-16 lg:py-20">
          <RevealBlock className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl font-bold italic text-foreground sm:text-4xl">{data.reviews.title}</h2>
            <p className="max-w-sm text-right text-xs uppercase tracking-[0.16em] text-fg-subtle">
              {sectionTitles.socialProof}
            </p>
          </RevealBlock>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {data.reviews.items.map((review, reviewIndex) => (
              <RevealBlock
                key={review.id}
                className="rounded-2xl border border-[hsl(var(--border)/0.45)] bg-[hsl(var(--surface-card)/0.72)] p-5 backdrop-blur-md"
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
                    <p className="font-semibold text-foreground">{review.author}</p>
                    <p className="text-xs text-[hsl(var(--accent))]">{review.serviceName}</p>
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
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">&ldquo;{review.comment}&rdquo;</p>
              </RevealBlock>
            ))}
          </div>
        </section>

        <section className="container mx-auto w-full px-4 pb-20 pt-12 lg:pb-24">
          <RevealBlock className="rounded-3xl border border-[hsl(var(--border)/0.45)] bg-[hsl(var(--surface-card)/0.76)] p-8 text-center backdrop-blur-md lg:p-12">
            <h2 className="font-display text-3xl font-bold italic text-foreground sm:text-4xl lg:text-5xl">
              {data.bookingCta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-fg-muted">{data.bookingCta.description}</p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-12 bg-accent px-8 font-semibold text-on-accent hover:bg-accent/90">
                <Link href={data.bookingCta.primaryHref}>{data.bookingCta.primaryLabel}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 border-[hsl(var(--border)/0.55)] bg-transparent px-8 text-foreground hover:bg-[hsl(var(--surface-emphasis)/0.58)] hover:text-foreground"
              >
                <Link href={data.bookingCta.secondaryHref}>{data.bookingCta.secondaryLabel}</Link>
              </Button>
            </div>

            <p className="mt-5 text-sm text-fg-subtle">
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
