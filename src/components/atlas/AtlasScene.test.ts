import { act, render } from "@testing-library/react";
import { createElement, type RefObject } from "react";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { solarSystem } from "@/data/solar-system";
import { orbitalPosition } from "@/domain/orbits";
import { useAtlasStore } from "@/store/atlas-store";
import { afterEach, beforeEach, vi } from "vitest";

import {
  AtlasScene,
  getFocusTarget,
  getNextSimulationDays,
  getSceneBodyPosition,
  sceneAnchors,
} from "./AtlasScene";
import { easeOutCubic } from "./camera-focus";

const frameState = vi.hoisted(() => ({
  callbacks: [] as Array<(state: unknown, delta: number) => void>,
}));
const reducedMotionState = vi.hoisted(() => ({ value: false }));

vi.mock("@react-three/fiber", () => ({
  useFrame: (callback: (state: unknown, delta: number) => void) => {
    frameState.callbacks.push(callback);
  },
}));
vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => reducedMotionState.value,
}));
vi.mock("./CelestialBodyMesh", () => ({ CelestialBodyMesh: () => null }));
vi.mock("./OrbitPath", () => ({ OrbitPath: () => null }));

function createControls() {
  const controls = {
    object: { position: new Vector3(0, 42, 70) },
    target: new Vector3(),
    update: vi.fn(),
  };

  return {
    controls,
    controlsRef: { current: controls } as unknown as RefObject<OrbitControlsImpl | null>,
  };
}

function runLatestFrame(delta: number) {
  for (const callback of frameState.callbacks.slice(-2)) {
    callback(undefined, delta);
  }
}

beforeEach(() => {
  frameState.callbacks = [];
  reducedMotionState.value = false;
  useAtlasStore.getState().reset();
  vi.spyOn(Date, "now").mockReturnValue(1_000);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("positions Charon relative to the scene-only Pluto anchor", () => {
  const charon = solarSystem.find((body) => body.id === "charon");

  expect(charon).toBeDefined();

  const localPosition = orbitalPosition(charon!, 0);
  const worldPosition = getSceneBodyPosition(charon!, 0);

  expect(worldPosition).toEqual({
    x: sceneAnchors.pluto.x + localPosition.x,
    y: sceneAnchors.pluto.y + localPosition.y,
    z: sceneAnchors.pluto.z + localPosition.z,
  });
  expect(Math.hypot(worldPosition.x, worldPosition.z)).toBeGreaterThan(
    solarSystem[0].radius + charon!.orbitRadius!,
  );
});

it("does not compress orbit positions on the z axis", () => {
  const earth = solarSystem.find((body) => body.id === "earth");

  expect(earth).toBeDefined();

  const days = earth!.orbitalPeriodDays! / 4;
  expect(getSceneBodyPosition(earth!, days).z).toBe(
    orbitalPosition(earth!, days).z,
  );
});

it("uses the current scene body position as the camera focus target", () => {
  const earth = solarSystem.find((body) => body.id === "earth");

  expect(earth).toBeDefined();
  expect(getFocusTarget(earth!, 24)).toEqual(getSceneBodyPosition(earth!, 24));
});

it("stops automatic orbital-time advancement for reduced motion", () => {
  expect(
    getNextSimulationDays({
      currentDays: 120,
      deltaSeconds: 2,
      timeMultiplier: 90,
      isPaused: false,
      prefersReducedMotion: true,
    }),
  ).toBe(120);
});

it("interpolates toward the selected body's live simulated position", () => {
  const earth = solarSystem.find((body) => body.id === "earth")!;
  const { controls, controlsRef } = createControls();
  useAtlasStore.getState().setTimeMultiplier(365);

  render(createElement(AtlasScene, { controlsRef, focusRevision: 0 }));

  vi.mocked(Date.now).mockReturnValue(1_225);
  act(() => runLatestFrame(0.5));

  const livePosition = getSceneBodyPosition(earth, 182.5);
  const progress = easeOutCubic(0.5);
  expect(controls.target.x).toBeCloseTo(livePosition.x * progress, 5);
  expect(controls.target.y).toBeCloseTo(livePosition.y * progress, 5);
  expect(controls.target.z).toBeCloseTo(livePosition.z * progress, 5);
  expect(controls.update).toHaveBeenCalled();
});

it("keeps the camera centered on an astre after its focus transition", () => {
  const earth = solarSystem.find((body) => body.id === "earth")!;
  const { controls, controlsRef } = createControls();
  useAtlasStore.getState().setTimeMultiplier(365);

  render(createElement(AtlasScene, { controlsRef, focusRevision: 0 }));
  vi.mocked(Date.now).mockReturnValue(1_450);
  act(() => runLatestFrame(0.5));
  const cameraOffset = controls.object.position.clone().sub(controls.target);

  vi.mocked(Date.now).mockReturnValue(1_550);
  act(() => runLatestFrame(0.5));

  const livePosition = getSceneBodyPosition(earth, 365);
  expect(controls.target.toArray()).toEqual([
    livePosition.x,
    livePosition.y,
    livePosition.z,
  ]);
  const currentCameraOffset = controls.object.position
    .clone()
    .sub(controls.target);
  expect(currentCameraOffset.x).toBeCloseTo(cameraOffset.x);
  expect(currentCameraOffset.y).toBeCloseTo(cameraOffset.y);
  expect(currentCameraOffset.z).toBeCloseTo(cameraOffset.z);
});

it("stops an in-flight focus transition after manual controls start", () => {
  const { controls, controlsRef } = createControls();
  const { rerender } = render(
    createElement(AtlasScene, { controlsRef, focusRevision: 0 }),
  );
  vi.mocked(Date.now).mockReturnValue(1_100);
  act(() => runLatestFrame(0));
  const interruptedPosition = controls.object.position.clone();
  const interruptedTarget = controls.target.clone();
  const updateCount = controls.update.mock.calls.length;

  rerender(createElement(AtlasScene, { controlsRef, focusRevision: 1 }));
  vi.mocked(Date.now).mockReturnValue(1_450);
  act(() => runLatestFrame(0));

  expect(controls.object.position).toEqual(interruptedPosition);
  expect(controls.target).toEqual(interruptedTarget);
  expect(controls.update).toHaveBeenCalledTimes(updateCount);
});

it("focuses immediately when reduced motion is requested", () => {
  const earth = solarSystem.find((body) => body.id === "earth")!;
  const { controls, controlsRef } = createControls();
  reducedMotionState.value = true;

  render(createElement(AtlasScene, { controlsRef, focusRevision: 0 }));

  const expectedTarget = getSceneBodyPosition(earth, 0);
  expect(controls.target.toArray()).toEqual([
    expectedTarget.x,
    expectedTarget.y,
    expectedTarget.z,
  ]);
  expect(controls.object.position.distanceTo(controls.target)).toBeCloseTo(
    5.6,
    5,
  );
});

it("keeps a reapplied view preset authoritative over an active focus", () => {
  const { controls, controlsRef } = createControls();
  useAtlasStore.getState().setViewMode("top");
  useAtlasStore.getState().selectBody("mars");
  render(createElement(AtlasScene, { controlsRef, focusRevision: 0 }));

  vi.mocked(Date.now).mockReturnValue(1_100);
  act(() => runLatestFrame(0));

  act(() => useAtlasStore.getState().setViewMode("top"));
  vi.mocked(Date.now).mockReturnValue(1_450);
  act(() => runLatestFrame(0));

  expect(controls.object.position.toArray()).toEqual([0, 85, 0.1]);
  expect(controls.target.toArray()).toEqual([0, 0, 0]);
});
