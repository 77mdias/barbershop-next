import {
  motionDelay,
  motionDuration,
  motionEasing,
  motionIntensity,
  motionStagger,
} from "@/lib/motion-tokens";

describe("motionTokens", () => {
  test("exposes a consistent timing scale for narrative flows", () => {
    expect(motionDuration.instant).toBe(0.35);
    expect(motionDuration.quick).toBe(0.5);
    expect(motionDuration.base).toBe(0.55);
    expect(motionDuration.smooth).toBe(0.6);
    expect(motionDuration.narrative).toBe(0.65);
    expect(motionDuration.hero).toBe(0.7);
  });

  test("keeps easing, delay and intensity contracts centralized", () => {
    expect(motionEasing.emphasized).toEqual([0.22, 1, 0.36, 1]);
    expect(motionDelay.none).toBe(0);
    expect(motionDelay.section).toBe(0.14);
    expect(motionIntensity.revealY.soft).toBe(14);
    expect(motionIntensity.hover.liftStrong).toBe(-6);
  });

  test("applies deterministic stagger helpers", () => {
    expect(motionStagger.reviews(0)).toBe(0);
    expect(motionStagger.reviews(3)).toBeCloseTo(0.15);
    expect(motionStagger.galleryPillars(2)).toBeCloseTo(0.16);
    expect(motionStagger.galleryCollections(4)).toBeCloseTo(0.28);
  });
});
