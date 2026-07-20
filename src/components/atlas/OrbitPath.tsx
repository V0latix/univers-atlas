"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Group } from "three";

import type { OrbitPoint } from "@/domain/orbits";
import type { CelestialBody } from "@/domain/types";

const ORBIT_ECCENTRICITY = 0.82;
const ORBIT_SEGMENTS = 128;

type OrbitPathProps = {
  body: CelestialBody;
  parent?: CelestialBody;
  getBodyPosition: (body: CelestialBody, simulationDays: number) => OrbitPoint;
  simulationDaysRef: MutableRefObject<number>;
};

export function OrbitPath({
  body,
  parent,
  getBodyPosition,
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
    const position = parent
      ? getBodyPosition(parent, simulationDaysRef.current)
      : { x: 0, y: 0, z: 0 };

    groupRef.current?.position.set(position.x, position.y, position.z);
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
