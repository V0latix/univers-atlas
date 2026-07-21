import { solarSystem } from "@/data/solar-system";
import { orbitalPosition } from "@/domain/orbits";
import { vi } from "vitest";

import {
  cameraInterpolationFactor,
  getNextSimulationDays,
  getSceneBodyPosition,
  sceneAnchors,
} from "./AtlasScene";

vi.mock("@react-three/fiber", () => ({ useFrame: () => undefined }));

it("positions Charon relative to the scene-only Pluto anchor", () => {
  const charon = solarSystem.find((body) => body.id === "charon");

  expect(charon).toBeDefined();

  const localPosition = orbitalPosition(charon!, 0);
  const worldPosition = getSceneBodyPosition(charon!, 0);

  expect(worldPosition).toEqual({
    x: sceneAnchors.pluto.x + localPosition.x,
    y: sceneAnchors.pluto.y + localPosition.y,
    z: sceneAnchors.pluto.z + localPosition.z * 0.82,
  });
  expect(Math.hypot(worldPosition.x, worldPosition.z)).toBeGreaterThan(
    solarSystem[0].radius + charon!.orbitRadius!,
  );
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

it("snaps camera interpolation for reduced motion", () => {
  expect(cameraInterpolationFactor(0.016, true)).toBe(1);
  expect(cameraInterpolationFactor(0.016, false)).toBeGreaterThan(0);
  expect(cameraInterpolationFactor(0.016, false)).toBeLessThan(1);
});
