import { solarSystem } from "@/data/solar-system";
import { orbitalPosition } from "@/domain/orbits";
import { vi } from "vitest";

import {
  getFocusTarget,
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
