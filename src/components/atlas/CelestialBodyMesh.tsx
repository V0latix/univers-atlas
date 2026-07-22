"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { DoubleSide, type Mesh } from "three";

import type { OrbitPoint } from "@/domain/orbits";
import type { CelestialBody } from "@/domain/types";
import { useAtlasStore } from "@/store/atlas-store";

import {
  createSurfaceTexture,
  disposeSurfaceTexture,
  getCelestialPresentation,
} from "./celestial-presentation";

type CelestialBodyMeshProps = {
  body: CelestialBody;
  getBodyPosition: (body: CelestialBody, simulationDays: number) => OrbitPoint;
  simulationDaysRef: MutableRefObject<number>;
};

export const surfaceMaterials = {
  star: { roughness: 0.4, metalness: 0.04, emissiveIntensity: 1.85 },
  planet: { roughness: 0.62, metalness: 0.06, emissiveIntensity: 0.13 },
  moon: { roughness: 0.9, metalness: 0, emissiveIntensity: 0.06 },
} as const;

const RING_ROTATION: [number, number, number] = [-Math.PI / 2.6, 0, 0];

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
  const presentation = getCelestialPresentation(body);
  const atmosphereColor = presentation.atmosphereColor;
  const texture = useMemo(() => createSurfaceTexture(body), [body]);

  useEffect(() => () => disposeSurfaceTexture(texture), [texture]);

  return (
    <mesh
      ref={meshRef}
      renderOrder={2}
      onClick={(event) => {
        event.stopPropagation();
        selectAndOpenProfile(body.id);
      }}
    >
      <sphereGeometry args={[body.radius, 32, 24]} />
      <meshStandardMaterial
        color={body.color}
        map={texture}
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
      {presentation.ringStyle ? (
        <mesh
          data-ring-layer="rear"
          rotation={RING_ROTATION}
          renderOrder={1}
        >
          <ringGeometry
            args={[body.radius * 1.35, body.radius * 2.25, 96, 1, 0, Math.PI]}
          />
          <meshBasicMaterial
            color="#d9c28a"
            transparent
            opacity={0.54}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {presentation.ringStyle ? (
        <mesh
          data-ring-layer="front"
          rotation={RING_ROTATION}
          renderOrder={3}
        >
          <ringGeometry
            args={[body.radius * 1.35, body.radius * 2.25, 96, 1, Math.PI, Math.PI]}
          />
          <meshBasicMaterial
            color="#f4e6b6"
            transparent
            opacity={0.76}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </mesh>
  );
}
