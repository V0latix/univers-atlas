import type { CelestialBody } from "./types";

const normalise = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export function searchBodies(
  query: string,
  bodies: readonly CelestialBody[],
): CelestialBody[] {
  const needle = normalise(query);
  if (!needle) return [...bodies];
  return bodies.filter((body) =>
    normalise(`${body.name} ${body.kind}`).includes(needle),
  );
}
