import { SCENE_BUDGET_TARGETS, getSceneTierBudget } from "@/components/scene-3d/performanceBudget";

describe("PH6-PQA-001 scene performance budget", () => {
  test("defines desktop and mobile fps targets for home/gallery 3D scenes", () => {
    expect(SCENE_BUDGET_TARGETS.desktopFpsTarget).toEqual([50, 60]);
    expect(SCENE_BUDGET_TARGETS.mobileFpsTarget).toBe(30);
  });

  test("keeps render limits progressively lower on mobile-oriented tiers", () => {
    const homeHigh = getSceneTierBudget("home", "high");
    const homeMedium = getSceneTierBudget("home", "medium");
    const homeLow = getSceneTierBudget("home", "low");

    expect(homeHigh.maxDpr).toBeGreaterThan(homeMedium.maxDpr);
    expect(homeMedium.maxDpr).toBeGreaterThan(homeLow.maxDpr - 0.0001);
    expect(homeHigh.maxAnimatedObjects).toBeGreaterThan(homeLow.maxAnimatedObjects);
    expect(homeLow.antialias).toBe(false);
  });

  test("applies conservative geometry budgets for low tier in gallery scene", () => {
    const galleryHigh = getSceneTierBudget("gallery", "high");
    const galleryLow = getSceneTierBudget("gallery", "low");

    expect(galleryLow.cylinderSegments).toBeLessThan(galleryHigh.cylinderSegments);
    expect(galleryLow.capSegments).toBeLessThan(galleryHigh.capSegments);
    expect(galleryLow.torusTubularSegments).toBeLessThan(galleryHigh.torusTubularSegments);
    expect(galleryLow.maxAnimatedObjects).toBeLessThan(galleryHigh.maxAnimatedObjects);
  });
});
