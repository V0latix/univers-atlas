"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import type { Group } from "three";

import type { OrbitPoint } from "@/domain/orbits";
import type { CelestialBody } from "@/domain/types";

type SelectedBodyHighlightProps = {
  body: CelestialBody;
  getBodyPosition: (body: CelestialBody, simulationDays: number) => OrbitPoint;
  prefersReducedMotion: boolean;
  simulationDaysRef: MutableRefObject<number>;
};

export function SelectedBodyHighlight({
  body,
  getBodyPosition,
  prefersReducedMotion,
  simulationDaysRef,
}: SelectedBodyHighlightProps) {
  const groupRef = useRef<Group>(null);
  const radius = Math.max(body.radius * 1.72, 0.68);

  useFrame((_, delta) => {
    const position = getBodyPosition(body, simulationDaysRef.current);
    groupRef.current?.position.set(position.x, position.y, position.z);

    if (!prefersReducedMotion && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.75;
    }
  });

  return (
    <group ref={groupRef} data-selected-body-highlight={body.id}>
      <mesh renderOrder={8} scale={1.52}>
        <sphereGeometry args={[body.radius, 24, 16]} />
        <meshBasicMaterial
          color="#d8eaff"
          depthTest={false}
          depthWrite={false}
          opacity={0.38}
          transparent
          wireframe
        />
      </mesh>
      <mesh renderOrder={9} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, Math.max(radius * 0.055, 0.045), 12, 64]} />
        <meshBasicMaterial
          color="#f8fbff"
          depthTest={false}
          depthWrite={false}
          opacity={0.95}
          transparent
        />
      </mesh>
      <mesh renderOrder={9} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
        <torusGeometry args={[radius * 0.86, Math.max(radius * 0.035, 0.03), 10, 64]} />
        <meshBasicMaterial
          color={body.color}
          depthTest={false}
          depthWrite={false}
          opacity={0.82}
          transparent
        />
      </mesh>
    </group>
  );
}
