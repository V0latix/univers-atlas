import type { CelestialBody } from "./types";

export type TimeMultiplier = 1 | 10 | 30 | 90 | 365;
export type OrbitPoint = { x: number; y: number; z: number };

export const secondsToSimulationDays = (
  elapsedSeconds: number,
  multiplier: TimeMultiplier,
) => elapsedSeconds * multiplier;

export function orbitalPosition(
  body: CelestialBody,
  simulationDays: number,
): OrbitPoint {
  if (!body.orbitRadius || !body.orbitalPeriodDays) {
    return { x: 0, y: 0, z: 0 };
  }

  const phase =
    ((simulationDays % body.orbitalPeriodDays) / body.orbitalPeriodDays) *
    Math.PI *
    2;

  return {
    x: Math.cos(phase) * body.orbitRadius,
    y: 0,
    z: Math.sin(phase) * body.orbitRadius,
  };
}
