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
import {
  createFocusTransition,
  easeOutCubic,
  type CameraFocusTransition,
  type VectorTuple,
} from "./camera-focus";
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

export function getFocusTarget(
  body: CelestialBody,
  simulationDays: number,
): OrbitPoint {
  return getSceneBodyPosition(body, simulationDays);
}

function CameraPreset({
  controlsRef,
  viewMode,
  viewRevision,
}: {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  viewMode: ViewMode;
  viewRevision: number;
}) {
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const [x, y, z] = CAMERA_POSITIONS[viewMode];
    controls.object.position.set(x, y, z);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [controlsRef, viewMode, viewRevision]);

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

function getVectorTuple({ x, y, z }: { x: number; y: number; z: number }): VectorTuple {
  return [x, y, z];
}

function SelectedBodyFocus({
  controlsRef,
  focusRevision,
  viewRevision,
  selectedId,
  simulationDaysRef,
  prefersReducedMotion,
}: {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  focusRevision: number;
  viewRevision: number;
  selectedId: string;
  simulationDaysRef: MutableRefObject<number>;
  prefersReducedMotion: boolean;
}) {
  const transitionRef = useRef<CameraFocusTransition | null>(null);
  const trackingOffsetRef = useRef<VectorTuple | null>(null);
  const initializedCancellationRef = useRef<{
    focusRevision: number;
    viewRevision: number;
  } | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    const selectedBody = bodiesById.get(selectedId);
    if (!controls || !selectedBody) return;

    const focusTarget = getFocusTarget(selectedBody, simulationDaysRef.current);
    const transition = createFocusTransition({
      cameraPosition: getVectorTuple(controls.object.position),
      currentTarget: getVectorTuple(controls.target),
      bodyPosition: [focusTarget.x, focusTarget.y, focusTarget.z],
      bodyRadius: selectedBody.radius,
      startedAt: Date.now(),
    });
    const focusOffset = transition.endPosition.map(
      (coordinate, index) => coordinate - transition.target[index],
    ) as VectorTuple;

    trackingOffsetRef.current = null;

    if (prefersReducedMotion) {
      controls.object.position.set(...transition.endPosition);
      controls.target.set(...transition.target);
      controls.update();
      transitionRef.current = null;
      trackingOffsetRef.current = focusOffset;
      return;
    }

    transitionRef.current = transition;
  }, [controlsRef, prefersReducedMotion, selectedId, simulationDaysRef]);

  useEffect(() => {
    if (initializedCancellationRef.current === null) {
      initializedCancellationRef.current = { focusRevision, viewRevision };
      return;
    }

    transitionRef.current = null;
    trackingOffsetRef.current = null;
    initializedCancellationRef.current = { focusRevision, viewRevision };
  }, [focusRevision, viewRevision]);

  useFrame(() => {
    const controls = controlsRef.current;
    const selectedBody = bodiesById.get(selectedId);
    if (!controls || !selectedBody) return;

    const transition = transitionRef.current;
    if (!transition) {
      const trackingOffset = trackingOffsetRef.current;
      if (!trackingOffset) return;

      const liveTarget = getVectorTuple(
        getFocusTarget(selectedBody, simulationDaysRef.current),
      );
      controls.object.position.set(
        liveTarget[0] + trackingOffset[0],
        liveTarget[1] + trackingOffset[1],
        liveTarget[2] + trackingOffset[2],
      );
      controls.target.set(...liveTarget);
      controls.update();
      return;
    }

    const progress = easeOutCubic(
      (Date.now() - transition.startedAt) / transition.durationMs,
    );
    const interpolate = (start: number, end: number) =>
      start + (end - start) * progress;
    const focusTarget = getFocusTarget(selectedBody, simulationDaysRef.current);
    const currentTarget = getVectorTuple(focusTarget);
    const focusOffset = transition.endPosition.map(
      (coordinate, index) => coordinate - transition.target[index],
    ) as VectorTuple;
    const currentEndPosition = currentTarget.map(
      (coordinate, index) => coordinate + focusOffset[index],
    ) as VectorTuple;

    controls.object.position.set(
      interpolate(transition.startPosition[0], currentEndPosition[0]),
      interpolate(transition.startPosition[1], currentEndPosition[1]),
      interpolate(transition.startPosition[2], currentEndPosition[2]),
    );
    controls.target.set(
      interpolate(transition.startTarget[0], currentTarget[0]),
      interpolate(transition.startTarget[1], currentTarget[1]),
      interpolate(transition.startTarget[2], currentTarget[2]),
    );
    controls.update();

    if (progress === 1) {
      transitionRef.current = null;
      trackingOffsetRef.current = focusOffset;
    }
  });

  return null;
}

export function AtlasScene({
  controlsRef,
  focusRevision,
}: {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  focusRevision: number;
}) {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const viewMode = useAtlasStore((state) => state.viewMode);
  const viewRevision = useAtlasStore((state) => state.viewRevision);
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

      <CameraPreset
        controlsRef={controlsRef}
        viewMode={viewMode}
        viewRevision={viewRevision}
      />

      <GuidedCamera
        selectedId={selectedId}
        isPaused={isPaused}
        timeMultiplier={timeMultiplier}
        simulationDaysRef={simulationDaysRef}
        prefersReducedMotion={prefersReducedMotion}
      />

      <SelectedBodyFocus
        controlsRef={controlsRef}
        focusRevision={focusRevision}
        viewRevision={viewRevision}
        selectedId={selectedId}
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
