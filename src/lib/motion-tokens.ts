export type MotionEasing = [number, number, number, number];

export const motionEasing = {
  emphasized: [0.22, 1, 0.36, 1] as MotionEasing,
} as const;

export const motionDuration = {
  instant: 0.35,
  quick: 0.5,
  base: 0.55,
  smooth: 0.6,
  narrative: 0.65,
  hero: 0.7,
} as const;

export const motionDelay = {
  none: 0,
  micro: 0.04,
  tight: 0.05,
  compact: 0.07,
  relaxed: 0.08,
  standard: 0.1,
  soft: 0.12,
  section: 0.14,
  strong: 0.16,
  pronounced: 0.18,
  heroAside: 0.2,
  deferred: 0.26,
} as const;

export const motionIntensity = {
  revealY: {
    default: 28,
    subtle: 12,
    soft: 14,
    medium: 16,
    strong: 18,
    hero: 20,
    deep: 22,
    deeper: 24,
    dramatic: 30,
  },
  hover: {
    liftSubtle: -3,
    liftSoft: -5,
    liftStrong: -6,
    shiftSoft: 4,
  },
  viewportAmount: {
    focused: 0.16,
    soft: 0.18,
    standard: 0.2,
    section: 0.22,
    hero: 0.24,
    heroMobile: 0.28,
    galleryCard: 0.25,
    galleryPillar: 0.3,
  },
} as const;

export const motionStagger = {
  reviews: (index: number) => index * motionDelay.tight,
  galleryPillars: (index: number) => index * motionDelay.relaxed,
  galleryCollections: (index: number) => index * motionDelay.compact,
} as const;
