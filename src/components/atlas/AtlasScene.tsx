"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { solarSystem } from "@/data/solar-system";
import {
  orbitalPosition,
  secondsToSimulationDays,
  type OrbitPoint,
  type TimeMultiplier,
} from "@/domain/orbits";
import type { CelestialBody, ViewMode } from "@/domain/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useAtlasStore } from "@/store/atlas-store";

import { CelestialBodyMesh } from "./CelestialBodyMesh";
import { OrbitPath } from "./OrbitPath";

const ORBIT_ECCENTRICITY = 1;
const CAMERA_POSITIONS: Record<ViewMode, [number, number, number]> = {
  top: [0, 85, 0.1],
  side: [0, 10, 90],
  "3d": [0, 42, 70],
};
const bodiesById = new Map(solarSystem.map((body) => [body.id, body]));
export const sceneAnchors: Record<string, OrbitPoint> = {
  pluto: { x: 54, y: 0, z: -24 },
};

type SimulationStep = {
  currentDays: number;
  deltaSeconds: number;
  timeMultiplier: TimeMultiplier;
  isPaused: boolean;
  prefersReducedMotion: boolean;
};

export function getNextSimulationDays({
  currentDays,
  deltaSeconds,
  timeMultiplier,
  isPaused,
  prefersReducedMotion,
}: SimulationStep) {
  if (isPaused || prefersReducedMotion) return currentDays;

  return currentDays + secondsToSimulationDays(deltaSeconds, timeMultiplier);
}

function getSceneParentPosition(
  parentId: string,
  simulationDays: number,
): OrbitPoint | undefined {
  const parentBody = bodiesById.get(parentId);

  return parentBody
    ? getSceneBodyPosition(parentBody, simulationDays)
    : sceneAnchors[parentId];
}

export function getSceneBodyPosition(
  body: CelestialBody,
  simulationDays: number,
): OrbitPoint {
  const localPosition = orbitalPosition(body, simulationDays);
  const parentPosition = body.parentId
    ? getSceneParentPosition(body.parentId, simulationDays)
    : undefined;

  if (!parentPosition) {
    return {
      x: localPosition.x,
      y: localPosition.y,
      z: localPosition.z * ORBIT_ECCENTRICITY,
    };
  }

  return {
    x: parentPosition.x + localPosition.x,
    y: parentPosition.y + localPosition.y,
    z: parentPosition.z + localPosition.z * ORBIT_ECCENTRICITY,
  };
}

function CameraPreset({
  controlsRef,
  viewMode,
}: {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  viewMode: ViewMode;
}) {
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const [x, y, z] = CAMERA_POSITIONS[viewMode];
    controls.object.position.set(x, y, z);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [controlsRef, viewMode]);

  return null;
}

function GuidedCamera({
  selectedId,
  isPaused,
  timeMultiplier,
  simulationDaysRef,
  prefersReducedMotion,
}: {
  selectedId: string;
  isPaused: boolean;
  timeMultiplier: TimeMultiplier;
  simulationDaysRef: MutableRefObject<number>;
  prefersReducedMotion: boolean;
}) {
  useFrame((_, delta) => {
    simulationDaysRef.current = getNextSimulationDays({
      currentDays: simulationDaysRef.current,
      deltaSeconds: delta,
      timeMultiplier,
      isPaused,
      prefersReducedMotion,
    });

    const selectedBody = bodiesById.get(selectedId);
    if (selectedBody) {
      getSceneBodyPosition(
        selectedBody,
        simulationDaysRef.current,
      );
    }
  });

  return null;
}

export function AtlasScene({
  controlsRef,
}: {
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const viewMode = useAtlasStore((state) => state.viewMode);
  const isPaused = useAtlasStore((state) => state.isPaused);
  const timeMultiplier = useAtlasStore((state) => state.timeMultiplier);
  const prefersReducedMotion = usePrefersReducedMotion();
  const simulationDaysRef = useRef(0);

  return (
    <>
      <fog attach="fog" args={["#020812", 62, 128]} />
      <ambientLight intensity={0.24} />
      <pointLight color="#9ac8ff" intensity={0.38} position={[0, 22, 18]} />
      <pointLight color="#fbbf24" intensity={4.5} distance={92} position={[0, 0, 0]} />

      <CameraPreset controlsRef={controlsRef} viewMode={viewMode} />

      <GuidedCamera
        selectedId={selectedId}
        isPaused={isPaused}
        timeMultiplier={timeMultiplier}
        simulationDaysRef={simulationDaysRef}
        prefersReducedMotion={prefersReducedMotion}
      />

      {solarSystem
        .filter((body) => body.orbitRadius)
        .map((body) => (
          <OrbitPath
            key={`${body.id}-orbit`}
            body={body}
            getParentPosition={getSceneParentPosition}
            simulationDaysRef={simulationDaysRef}
          />
        ))}

      {solarSystem.map((body) => (
        <CelestialBodyMesh
          key={body.id}
          body={body}
          getBodyPosition={getSceneBodyPosition}
          simulationDaysRef={simulationDaysRef}
        />
      ))}
    </>
  );
}
