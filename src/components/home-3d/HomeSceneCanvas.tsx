"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

export type SceneQualityTier = "high" | "medium" | "low";
export type SceneTheme = "light" | "dark";

type HomeSceneCanvasProps = {
  tier: SceneQualityTier;
  theme: SceneTheme;
};

type ScenePalette = {
  fog: string;
  keyLight: string;
  pointLight: string;
  poleBody: string;
  poleStripe: string;
  poleCap: string;
};

function MovingLight({ color }: { color: string }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();
    lightRef.current.position.x = Math.sin(t * 0.3) * 4;
    lightRef.current.position.z = 5 + Math.cos(t * 0.25) * 1.2;
  });

  return <pointLight ref={lightRef} intensity={1.2} position={[0, 2.5, 5]} color={color} />;
}

type PoleProps = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
};

function BarberPole({ position, rotation, scale, speed, palette }: PoleProps & { palette: ScenePalette }) {
  const stripeAngles = useMemo(() => [0, 0.85, 1.7, 2.55], []);

  return (
    <Float speed={speed} rotationIntensity={0.25} floatIntensity={0.65}>
      <group position={position} rotation={rotation} scale={scale}>
        <mesh castShadow>
          <cylinderGeometry args={[0.24, 0.24, 2.5, 32]} />
          <meshStandardMaterial color={palette.poleBody} metalness={0.12} roughness={0.32} />
        </mesh>

        {stripeAngles.map((angle) => (
          <mesh key={angle} rotation={[0, angle, Math.PI / 4]}>
            <boxGeometry args={[0.11, 2.45, 0.32]} />
            <meshStandardMaterial color={palette.poleStripe} metalness={0.16} roughness={0.36} />
          </mesh>
        ))}

        <mesh position={[0, -1.35, 0]}>
          <cylinderGeometry args={[0.31, 0.31, 0.18, 24]} />
          <meshStandardMaterial color={palette.poleCap} metalness={0.24} roughness={0.28} />
        </mesh>

        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.31, 0.31, 0.18, 24]} />
          <meshStandardMaterial color={palette.poleCap} metalness={0.24} roughness={0.28} />
        </mesh>
      </group>
    </Float>
  );
}

function SceneObjects({ tier, palette }: { tier: SceneQualityTier; palette: ScenePalette }) {
  const objects =
    tier === "high"
      ? [
          { position: [-2.8, 1.2, -1.4], rotation: [0.08, 0.3, -0.1], scale: 1, speed: 1.2 },
          { position: [2.6, -1, -1.7], rotation: [-0.05, -0.25, 0.12], scale: 0.95, speed: 1.05 },
          { position: [0.5, 2.4, -3], rotation: [0.04, 0.2, 0], scale: 0.6, speed: 0.9 },
          { position: [-4, -2, -3.8], rotation: [0.1, 0.4, 0.15], scale: 0.55, speed: 0.85 },
        ]
      : tier === "medium"
        ? [
            { position: [-2.3, 1.1, -1.2], rotation: [0.08, 0.28, -0.08], scale: 0.96, speed: 1.1 },
            { position: [2.1, -0.9, -1.5], rotation: [-0.05, -0.24, 0.1], scale: 0.9, speed: 1 },
            { position: [0.4, 2.2, -2.8], rotation: [0.03, 0.18, 0], scale: 0.55, speed: 0.82 },
          ]
        : [
            { position: [-1.9, 1, -1.1], rotation: [0.05, 0.25, -0.06], scale: 0.84, speed: 0.86 },
            { position: [1.8, -0.8, -1.2], rotation: [-0.04, -0.2, 0.08], scale: 0.78, speed: 0.82 },
          ];

  return (
    <>
      {objects.map((item, index) => (
        <BarberPole
          key={`pole-${index}`}
          position={item.position as [number, number, number]}
          rotation={item.rotation as [number, number, number]}
          scale={item.scale}
          speed={item.speed}
          palette={palette}
        />
      ))}
    </>
  );
}

export function HomeSceneCanvas({ tier, theme }: HomeSceneCanvasProps) {
  const dprLimit = tier === "high" ? 1.6 : tier === "medium" ? 1.35 : 1.1;
  const palette: ScenePalette =
    theme === "dark"
      ? {
          fog: "#06080d",
          keyLight: "#b8c7ff",
          pointLight: "#f4c069",
          poleBody: "#f5f5f5",
          poleStripe: "#be2f3f",
          poleCap: "#1f2e58",
        }
      : {
          fog: "#dce6f5",
          keyLight: "#5e6ea2",
          pointLight: "#c7842d",
          poleBody: "#ffffff",
          poleStripe: "#c34e5e",
          poleCap: "#2f4b80",
        };

  return (
    <Canvas
      dpr={[1, dprLimit]}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: tier !== "low", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <fog attach="fog" args={[palette.fog, theme === "dark" ? 6 : 8, theme === "dark" ? 14 : 18]} />

      <ambientLight intensity={theme === "dark" ? 0.5 : 0.42} />
      <directionalLight position={[2, 3, 2]} intensity={0.75} color={palette.keyLight} />
      <MovingLight color={palette.pointLight} />

      <SceneObjects tier={tier} palette={palette} />
    </Canvas>
  );
}
