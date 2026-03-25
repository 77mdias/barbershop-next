"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Camera, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import { Gallery } from "@/components/gallery";
import { galleryCollections, galleryImages } from "@/components/gallery-images";
import { GallerySceneBackdrop } from "@/components/gallery-3d/GallerySceneBackdrop";

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

export function GalleryExperience() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <GallerySceneBackdrop />

      <div className="relative z-10">
        <section className="layout-3d-shell pb-14 pt-[calc(65px+3.5rem)] lg:pb-20 lg:pt-[calc(65px+4.2rem)]">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.38)] bg-[hsl(var(--accent)/0.12)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <Scissors className="h-3.5 w-3.5" />
              Curadoria 3D
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold italic tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Galeria de Estilos
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-fg-muted sm:text-lg">
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
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-[hsl(var(--surface-card)/0.75)] px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Ver promoções
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {valuePillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <motion.article
                  key={pillar.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                  className="rounded-2xl border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--surface-card)/0.74)] p-5 backdrop-blur-md"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.16)] text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 font-display text-xl font-semibold italic text-foreground">{pillar.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{pillar.description}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="layout-3d-shell py-12 lg:py-16">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Narrativa visual</p>
              <h2 className="mt-2 font-display text-3xl font-bold italic text-foreground sm:text-4xl">
                Coleções em destaque
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted sm:text-base">
                Três direções estéticas para facilitar a escolha do estilo: clássico preciso, textura urbana e
                combinação corte + barba.
              </p>
            </div>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
            >
              Ver avaliações
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-3">
            {galleryCollections.map((collection, index) => (
              <motion.article
                key={collection.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                className="overflow-hidden rounded-3xl border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--surface-card)/0.82)] shadow-[0_24px_70px_-32px_rgba(0,0,0,0.28)]"
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
                <div className="space-y-2 p-5">
                  <h3 className="font-display text-2xl font-semibold italic text-foreground">{collection.title}</h3>
                  <p className="text-sm leading-relaxed text-fg-muted">{collection.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="layout-3d-shell pb-14 lg:pb-20">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--surface-card)/0.82)] p-3 shadow-[0_28px_80px_-32px_rgba(0,0,0,0.25)] sm:p-6"
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Arquivo da barbearia</p>
                <h2 className="mt-2 font-display text-3xl font-bold italic text-foreground sm:text-4xl">
                  Portfólio completo
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-base">
                  Navegue por toda a coleção, amplie os detalhes no lightbox e traga sua referência para o próximo
                  atendimento.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--surface-emphasis)/0.52)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
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
