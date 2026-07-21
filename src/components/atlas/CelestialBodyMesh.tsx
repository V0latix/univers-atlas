"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import type { Mesh } from "three";

import type { OrbitPoint } from "@/domain/orbits";
import type { CelestialBody } from "@/domain/types";
import { useAtlasStore } from "@/store/atlas-store";

type CelestialBodyMeshProps = {
  body: CelestialBody;
  getBodyPosition: (body: CelestialBody, simulationDays: number) => OrbitPoint;
  simulationDaysRef: MutableRefObject<number>;
};

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
        emissive={isStar ? body.color : "#000000"}
        emissiveIntensity={isStar ? 1.6 : 0.08}
        roughness={0.72}
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
    </mesh>
  );
}
