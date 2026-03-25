"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { getSceneTierBudget } from "@/components/scene-3d/performanceBudget";

export type GallerySceneQualityTier = "high" | "medium" | "low";
export type GallerySceneTheme = "light" | "dark";

type GallerySceneCanvasProps = {
  tier: GallerySceneQualityTier;
  theme: GallerySceneTheme;
  pointerMode: "enabled" | "limited" | "disabled";
};

type ScenePalette = {
  fog: string;
  keyLight: string;
  fillLight: string;
  poleBody: string;
  poleStripe: string;
  metal: string;
};

type FloatingObject = {
  kind: "pole" | "shear";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
};

function MovingFillLight({ color }: { color: string }) {
  const fillRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!fillRef.current) return;

    const t = clock.getElapsedTime();
    fillRef.current.position.x = Math.sin(t * 0.25) * 3.8;
    fillRef.current.position.y = Math.cos(t * 0.22) * 1.6;
    fillRef.current.position.z = 5 + Math.cos(t * 0.31) * 1.2;
  });

  return <pointLight ref={fillRef} intensity={1.1} position={[0, 0.8, 5]} color={color} />;
}

function CameraRig({ tier, pointerMode }: { tier: GallerySceneQualityTier; pointerMode: GallerySceneCanvasProps["pointerMode"] }) {
  const smoothFactor = tier === "high" ? 3.4 : tier === "medium" ? 2.9 : 2.2;
  const targetMultiplier =
    pointerMode === "disabled" ? 0 : pointerMode === "limited" ? (tier === "high" ? 0.14 : 0.1) : tier === "high" ? 0.24 : 0.18;

  useFrame(({ camera, pointer }, delta) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * targetMultiplier, delta * smoothFactor);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * targetMultiplier, delta * smoothFactor);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function BarberPole({
  position,
  rotation,
  scale,
  speed,
  rotationIntensity,
  floatIntensity,
  cylinderSegments,
  capSegments,
  palette,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  rotationIntensity: number;
  floatIntensity: number;
  cylinderSegments: number;
  capSegments: number;
  palette: ScenePalette;
}) {
  const stripeAngles = useMemo(() => [0, 0.85, 1.7, 2.55], []);

  return (
    <Float speed={speed} rotationIntensity={rotationIntensity} floatIntensity={floatIntensity}>
      <group position={position} rotation={rotation} scale={scale}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 2.2, cylinderSegments]} />
          <meshStandardMaterial color={palette.poleBody} metalness={0.1} roughness={0.3} />
        </mesh>

        {stripeAngles.map((angle) => (
          <mesh key={`stripe-${angle}`} rotation={[0, angle, Math.PI / 4]}>
            <boxGeometry args={[0.09, 2.15, 0.3]} />
            <meshStandardMaterial color={palette.poleStripe} metalness={0.14} roughness={0.32} />
          </mesh>
        ))}

        <mesh position={[0, -1.18, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.16, capSegments]} />
          <meshStandardMaterial color={palette.metal} metalness={0.24} roughness={0.25} />
        </mesh>

        <mesh position={[0, 1.18, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.16, capSegments]} />
          <meshStandardMaterial color={palette.metal} metalness={0.24} roughness={0.25} />
        </mesh>
      </group>
    </Float>
  );
}

function ShearMark({
  position,
  rotation,
  scale,
  speed,
  rotationIntensity,
  floatIntensity,
  torusRadialSegments,
  torusTubularSegments,
  palette,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  rotationIntensity: number;
  floatIntensity: number;
  torusRadialSegments: number;
  torusTubularSegments: number;
  palette: ScenePalette;
}) {
  return (
    <Float speed={speed} rotationIntensity={rotationIntensity} floatIntensity={floatIntensity}>
      <group position={position} rotation={rotation} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 5]}>
          <boxGeometry args={[1.9, 0.08, 0.08]} />
          <meshStandardMaterial color={palette.metal} metalness={0.52} roughness={0.25} />
        </mesh>

        <mesh rotation={[0, 0, -Math.PI / 5]}>
          <boxGeometry args={[1.9, 0.08, 0.08]} />
          <meshStandardMaterial color={palette.metal} metalness={0.52} roughness={0.25} />
        </mesh>

        <mesh position={[-0.42, -0.32, 0]}>
          <torusGeometry args={[0.22, 0.05, torusRadialSegments, torusTubularSegments]} />
          <meshStandardMaterial color={palette.poleStripe} metalness={0.26} roughness={0.35} />
        </mesh>

        <mesh position={[0.42, -0.32, 0]}>
          <torusGeometry args={[0.22, 0.05, torusRadialSegments, torusTubularSegments]} />
          <meshStandardMaterial color={palette.poleStripe} metalness={0.26} roughness={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

function SceneObjects({ tier, palette }: { tier: GallerySceneQualityTier; palette: ScenePalette }) {
  const budget = getSceneTierBudget("gallery", tier);
  const objects: FloatingObject[] =
    tier === "high"
      ? [
          { kind: "pole", position: [-3.1, 1.5, -1.8], rotation: [0.06, 0.34, -0.08], scale: 0.96, speed: 1.1 },
          { kind: "shear", position: [2.5, 1.9, -2.4], rotation: [0.24, -0.46, 0.16], scale: 0.74, speed: 0.88 },
          { kind: "pole", position: [2.9, -1.2, -2], rotation: [-0.08, -0.26, 0.1], scale: 0.84, speed: 0.95 },
          { kind: "shear", position: [-1.8, -2.2, -3.4], rotation: [-0.18, 0.32, -0.14], scale: 0.62, speed: 0.82 },
        ]
      : tier === "medium"
        ? [
            { kind: "pole", position: [-2.6, 1.3, -1.5], rotation: [0.06, 0.28, -0.06], scale: 0.9, speed: 1.02 },
            { kind: "shear", position: [2.2, 1.7, -2.2], rotation: [0.2, -0.42, 0.12], scale: 0.66, speed: 0.82 },
            { kind: "pole", position: [2.4, -1.1, -1.8], rotation: [-0.06, -0.24, 0.08], scale: 0.76, speed: 0.9 },
          ]
      : [
            { kind: "pole", position: [-2.1, 1.2, -1.3], rotation: [0.05, 0.25, -0.04], scale: 0.8, speed: 0.84 },
            { kind: "shear", position: [1.9, -1.2, -1.8], rotation: [0.16, -0.32, 0.08], scale: 0.58, speed: 0.72 },
          ];
  const visibleObjects = objects.slice(0, budget.maxAnimatedObjects);

  return (
    <>
      {visibleObjects.map((item, index) => {
        if (item.kind === "pole") {
          return (
            <BarberPole
              key={`pole-${index}`}
              position={item.position}
              rotation={item.rotation}
              scale={item.scale}
              speed={item.speed * budget.speedMultiplier}
              rotationIntensity={budget.rotationIntensity}
              floatIntensity={budget.floatIntensity}
              cylinderSegments={budget.cylinderSegments}
              capSegments={budget.capSegments}
              palette={palette}
            />
          );
        }

        return (
          <ShearMark
            key={`shear-${index}`}
            position={item.position}
            rotation={item.rotation}
            scale={item.scale}
            speed={item.speed * budget.speedMultiplier}
            rotationIntensity={budget.rotationIntensity}
            floatIntensity={budget.floatIntensity}
            torusRadialSegments={budget.torusRadialSegments}
            torusTubularSegments={budget.torusTubularSegments}
            palette={palette}
          />
        );
      })}
    </>
  );
}

export function GallerySceneCanvas({ tier, theme, pointerMode }: GallerySceneCanvasProps) {
  const budget = getSceneTierBudget("gallery", tier);
  const palette: ScenePalette =
    theme === "dark"
      ? {
          fog: "#070b12",
          keyLight: "#bdc9ff",
          fillLight: "#de9f57",
          poleBody: "#f4f4f4",
          poleStripe: "#ba3042",
          metal: "#8ca6d7",
        }
      : {
          fog: "#d6e3f5",
          keyLight: "#6372a7",
          fillLight: "#bc7b2b",
          poleBody: "#ffffff",
          poleStripe: "#c44e5e",
          metal: "#506fa6",
        };

  return (
    <Canvas
      dpr={[1, budget.maxDpr]}
      camera={{ position: [0, 0, 7.2], fov: 40 }}
      gl={{ antialias: budget.antialias, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <fog attach="fog" args={[palette.fog, theme === "dark" ? 5.8 : 7.2, theme === "dark" ? 13 : 16]} />
      <ambientLight intensity={theme === "dark" ? 0.48 : 0.44} />
      <directionalLight intensity={0.8} position={[2.2, 2.5, 2.8]} color={palette.keyLight} />
      <MovingFillLight color={palette.fillLight} />
      <CameraRig tier={tier} pointerMode={pointerMode} />
      <SceneObjects tier={tier} palette={palette} />
    </Canvas>
  );
}
