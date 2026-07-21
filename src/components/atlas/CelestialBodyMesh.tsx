"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import { DoubleSide, type Mesh } from "three";

import type { OrbitPoint } from "@/domain/orbits";
import type { CelestialBody } from "@/domain/types";
import { useAtlasStore } from "@/store/atlas-store";

type CelestialBodyMeshProps = {
  body: CelestialBody;
  getBodyPosition: (body: CelestialBody, simulationDays: number) => OrbitPoint;
  simulationDaysRef: MutableRefObject<number>;
};

const surfaceMaterials = {
  star: { roughness: 0.4, metalness: 0.04, emissiveIntensity: 1.6 },
  planet: { roughness: 0.62, metalness: 0.06, emissiveIntensity: 0.05 },
  moon: { roughness: 0.9, metalness: 0, emissiveIntensity: 0.015 },
} as const;

const atmosphereColors: Record<string, string> = {
  earth: "#8ed7ff",
  venus: "#f4d48c",
  titan: "#e59c4d",
};

const bandColors: Record<string, string> = {
  jupiter: "#8d553d",
  saturn: "#b69058",
};

const bandOffsets = [-0.38, 0, 0.38];

export function CelestialBodyMesh({
  body,
  getBodyPosition,
  simulationDaysRef,
}: CelestialBodyMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const selectAndOpenProfile = useAtlasStore(
    (state) => state.selectAndOpenProfile,
  );

  useFrame(() => {
    const position = getBodyPosition(body, simulationDaysRef.current);
    meshRef.current?.position.set(position.x, position.y, position.z);
  });

  const isStar = body.kind === "star";
  const material = surfaceMaterials[body.kind];
  const atmosphereColor = atmosphereColors[body.id];
  const bandColor = bandColors[body.id];

  return (
    <mesh
      ref={meshRef}
      onClick={(event) => {
        event.stopPropagation();
        selectAndOpenProfile(body.id);
      }}
    >
      <sphereGeometry args={[body.radius, 32, 24]} />
      <meshStandardMaterial
        color={body.color}
        emissive={body.color}
        emissiveIntensity={material.emissiveIntensity}
        roughness={material.roughness}
        metalness={material.metalness}
      />
      {isStar ? (
        <mesh scale={1.28} renderOrder={-1}>
          <sphereGeometry args={[body.radius, 32, 24]} />
          <meshBasicMaterial
            color={body.color}
            depthWrite={false}
            transparent
            opacity={0.1}
          />
        </mesh>
      ) : null}
      {atmosphereColor ? (
        <mesh scale={1.08} renderOrder={-1}>
          <sphereGeometry args={[body.radius, 32, 24]} />
          <meshBasicMaterial
            color={atmosphereColor}
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {bandColor
        ? bandOffsets.map((offset) => (
            <mesh
              key={offset}
              position={[0, body.radius * offset, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <torusGeometry
                args={[
                  body.radius * Math.sqrt(1 - offset ** 2) + 0.01,
                  body.radius * 0.035,
                  8,
                  40,
                ]}
              />
              <meshBasicMaterial color={bandColor} transparent opacity={0.45} />
            </mesh>
          ))
        : null}
      {body.hasRings ? (
        <mesh rotation={[-Math.PI / 2.6, 0, 0]}>
          <ringGeometry args={[body.radius * 1.35, body.radius * 2.25, 96]} />
          <meshBasicMaterial
            color="#d9c28a"
            transparent
            opacity={0.72}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </mesh>
  );
}
