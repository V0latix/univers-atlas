"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Group } from "three";

import type { OrbitPoint } from "@/domain/orbits";
import type { CelestialBody } from "@/domain/types";

const ORBIT_ECCENTRICITY = 1;
const ORBIT_SEGMENTS = 128;

type OrbitPathProps = {
  body: CelestialBody;
  getParentPosition: (parentId: string, simulationDays: number) => OrbitPoint | undefined;
  simulationDaysRef: MutableRefObject<number>;
};

export function OrbitPath({
  body,
  getParentPosition,
  simulationDaysRef,
}: OrbitPathProps) {
  const groupRef = useRef<Group>(null);
  const positions = useMemo(() => {
    const vertices = new Float32Array(ORBIT_SEGMENTS * 3);
    const radius = body.orbitRadius ?? 0;

    for (let index = 0; index < ORBIT_SEGMENTS; index += 1) {
      const angle = (index / ORBIT_SEGMENTS) * Math.PI * 2;
      const offset = index * 3;

      vertices[offset] = Math.cos(angle) * radius;
      vertices[offset + 1] = 0;
      vertices[offset + 2] = Math.sin(angle) * radius * ORBIT_ECCENTRICITY;
    }

    return vertices;
  }, [body.orbitRadius]);

  useFrame(() => {
    const position = body.parentId
      ? getParentPosition(body.parentId, simulationDaysRef.current)
      : undefined;

    groupRef.current?.position.set(position?.x ?? 0, position?.y ?? 0, position?.z ?? 0);
  });

  return (
    <group ref={groupRef}>
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#315a84" transparent opacity={0.58} />
      </lineLoop>
    </group>
  );
}
