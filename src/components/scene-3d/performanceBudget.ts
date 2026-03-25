export type SceneQualityTier = "high" | "medium" | "low";
export type SceneRoute = "home" | "gallery";

export type SceneBudgetTargets = {
  desktopFpsTarget: [number, number];
  mobileFpsTarget: number;
};

export type SceneTierBudget = {
  maxDpr: number;
  antialias: boolean;
  maxAnimatedObjects: number;
  cylinderSegments: number;
  capSegments: number;
  ringSegments: number;
  torusRadialSegments: number;
  torusTubularSegments: number;
  speedMultiplier: number;
  rotationIntensity: number;
  floatIntensity: number;
};

type SceneBudgetConfig = Record<SceneRoute, Record<SceneQualityTier, SceneTierBudget>>;

export const SCENE_BUDGET_TARGETS: SceneBudgetTargets = {
  desktopFpsTarget: [50, 60],
  mobileFpsTarget: 30,
};

const SCENE_BUDGET_CONFIG: SceneBudgetConfig = {
  home: {
    high: {
      maxDpr: 1.45,
      antialias: true,
      maxAnimatedObjects: 4,
      cylinderSegments: 28,
      capSegments: 22,
      ringSegments: 0,
      torusRadialSegments: 0,
      torusTubularSegments: 0,
      speedMultiplier: 1,
      rotationIntensity: 0.24,
      floatIntensity: 0.62,
    },
    medium: {
      maxDpr: 1.2,
      antialias: true,
      maxAnimatedObjects: 3,
      cylinderSegments: 22,
      capSegments: 18,
      ringSegments: 0,
      torusRadialSegments: 0,
      torusTubularSegments: 0,
      speedMultiplier: 0.92,
      rotationIntensity: 0.18,
      floatIntensity: 0.5,
    },
    low: {
      maxDpr: 1,
      antialias: false,
      maxAnimatedObjects: 2,
      cylinderSegments: 16,
      capSegments: 12,
      ringSegments: 0,
      torusRadialSegments: 0,
      torusTubularSegments: 0,
      speedMultiplier: 0.78,
      rotationIntensity: 0.12,
      floatIntensity: 0.38,
    },
  },
  gallery: {
    high: {
      maxDpr: 1.4,
      antialias: true,
      maxAnimatedObjects: 4,
      cylinderSegments: 26,
      capSegments: 20,
      ringSegments: 12,
      torusRadialSegments: 12,
      torusTubularSegments: 24,
      speedMultiplier: 1,
      rotationIntensity: 0.22,
      floatIntensity: 0.58,
    },
    medium: {
      maxDpr: 1.15,
      antialias: true,
      maxAnimatedObjects: 3,
      cylinderSegments: 20,
      capSegments: 16,
      ringSegments: 10,
      torusRadialSegments: 10,
      torusTubularSegments: 20,
      speedMultiplier: 0.9,
      rotationIntensity: 0.16,
      floatIntensity: 0.48,
    },
    low: {
      maxDpr: 1,
      antialias: false,
      maxAnimatedObjects: 2,
      cylinderSegments: 14,
      capSegments: 10,
      ringSegments: 8,
      torusRadialSegments: 8,
      torusTubularSegments: 14,
      speedMultiplier: 0.76,
      rotationIntensity: 0.12,
      floatIntensity: 0.36,
    },
  },
};

export function getSceneTierBudget(route: SceneRoute, tier: SceneQualityTier): SceneTierBudget {
  return SCENE_BUDGET_CONFIG[route][tier];
}
