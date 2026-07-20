"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { Vector3 } from "three";

import { solarSystem } from "@/data/solar-system";
import {
  orbitalPosition,
  secondsToSimulationDays,
  type OrbitPoint,
  type TimeMultiplier,
} from "@/domain/orbits";
import type { CelestialBody, ViewMode } from "@/domain/types";
import { useAtlasStore } from "@/store/atlas-store";

import { CelestialBodyMesh } from "./CelestialBodyMesh";
import { OrbitPath } from "./OrbitPath";

const ORBIT_ECCENTRICITY = 0.82;
const CAMERA_POSITIONS: Record<ViewMode, [number, number, number]> = {
  top: [0, 85, 0.1],
  side: [0, 10, 90],
  "3d": [0, 42, 70],
};
const bodiesById = new Map(solarSystem.map((body) => [body.id, body]));

function getBodyPosition(body: CelestialBody, simulationDays: number): OrbitPoint {
  const localPosition = orbitalPosition(body, simulationDays);
  const parent = body.parentId ? bodiesById.get(body.parentId) : undefined;

  if (!parent) {
    return {
      x: localPosition.x,
      y: localPosition.y,
      z: localPosition.z * ORBIT_ECCENTRICITY,
    };
  }

  const parentPosition = getBodyPosition(parent, simulationDays);

  return {
    x: parentPosition.x + localPosition.x,
    y: parentPosition.y + localPosition.y,
    z: parentPosition.z + localPosition.z * ORBIT_ECCENTRICITY,
  };
}

function GuidedCamera({
  selectedId,
  viewMode,
  isPaused,
  timeMultiplier,
  simulationDaysRef,
}: {
  selectedId: string;
  viewMode: ViewMode;
  isPaused: boolean;
  timeMultiplier: TimeMultiplier;
  simulationDaysRef: MutableRefObject<number>;
}) {
  const desiredCameraPosition = useRef(new Vector3(...CAMERA_POSITIONS[viewMode]));
  const desiredFocus = useRef(new Vector3());
  const cameraFocus = useRef(new Vector3());

  useEffect(() => {
    desiredCameraPosition.current.set(...CAMERA_POSITIONS[viewMode]);
    const selectedBody = bodiesById.get(selectedId);

    if (selectedBody) {
      const position = getBodyPosition(selectedBody, simulationDaysRef.current);
      desiredFocus.current.set(position.x, position.y, position.z);
    }
  }, [selectedId, simulationDaysRef, viewMode]);

  useFrame(({ camera }, delta) => {
    if (!isPaused) {
      simulationDaysRef.current += secondsToSimulationDays(delta, timeMultiplier);
    }

    const selectedBody = bodiesById.get(selectedId);
    if (selectedBody) {
      const position = getBodyPosition(selectedBody, simulationDaysRef.current);
      desiredFocus.current.set(position.x, position.y, position.z);
    }

    const damping = 1 - Math.exp(-4 * delta);
    camera.position.lerp(desiredCameraPosition.current, damping);
    cameraFocus.current.lerp(desiredFocus.current, damping);
    camera.lookAt(cameraFocus.current);
  });

  return null;
}

export function AtlasScene() {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const viewMode = useAtlasStore((state) => state.viewMode);
  const isPaused = useAtlasStore((state) => state.isPaused);
  const timeMultiplier = useAtlasStore((state) => state.timeMultiplier);
  const simulationDaysRef = useRef(0);

  return (
    <>
      <color attach="background" args={["#020812"]} />
      <fog attach="fog" args={["#020812", 62, 128]} />
      <ambientLight intensity={0.24} />
      <pointLight color="#9ac8ff" intensity={0.3} position={[0, 22, 18]} />
      <pointLight color="#fbbf24" intensity={4.5} distance={92} position={[0, 0, 0]} />

      <GuidedCamera
        selectedId={selectedId}
        viewMode={viewMode}
        isPaused={isPaused}
        timeMultiplier={timeMultiplier}
        simulationDaysRef={simulationDaysRef}
      />

      {solarSystem
        .filter((body) => body.orbitRadius)
        .map((body) => (
          <OrbitPath
            key={`${body.id}-orbit`}
            body={body}
            parent={body.parentId ? bodiesById.get(body.parentId) : undefined}
            getBodyPosition={getBodyPosition}
            simulationDaysRef={simulationDaysRef}
          />
        ))}

      {solarSystem.map((body) => (
        <CelestialBodyMesh
          key={body.id}
          body={body}
          getBodyPosition={getBodyPosition}
          simulationDaysRef={simulationDaysRef}
        />
      ))}
    </>
  );
}
