"use client";

import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import type { Group } from "three";

import type { OrbitPoint } from "@/domain/orbits";
import type { CelestialBody } from "@/domain/types";

type SceneBodyLabelProps = {
  body: CelestialBody;
  getBodyPosition: (body: CelestialBody, simulationDays: number) => OrbitPoint;
  isSelected: boolean;
  simulationDaysRef: MutableRefObject<number>;
};

export function SceneBodyLabel({
  body,
  getBodyPosition,
  isSelected,
  simulationDaysRef,
}: SceneBodyLabelProps) {
  const groupRef = useRef<Group>(null);
  const offset = Math.max(body.radius * 1.55, 0.72);

  useFrame(() => {
    const position = getBodyPosition(body, simulationDaysRef.current);
    groupRef.current?.position.set(position.x, position.y + offset, position.z);
  });

  return (
    <group ref={groupRef} data-scene-label={body.id}>
      <Billboard>
        <Text
          anchorX="center"
          anchorY="bottom"
          color={isSelected ? "#ffffff" : "#d8eaff"}
          fontSize={isSelected ? 0.78 : 0.56}
          outlineColor="#020812"
          outlineWidth={0.035}
        >
          {body.name}
        </Text>
      </Billboard>
    </group>
  );
}
