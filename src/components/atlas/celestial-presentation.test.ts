import { expect, it } from "vitest";

import { getBodyById } from "@/data/solar-system";

import { getCelestialPresentation } from "./celestial-presentation";

it("selects recognizable surface styles for terrestrial, gas, and rocky bodies", () => {
  expect(getCelestialPresentation(getBodyById("earth")!).surface).toBe(
    "terrestrial-clouds",
  );
  expect(getCelestialPresentation(getBodyById("jupiter")!).surface).toBe(
    "gas-bands",
  );
  expect(getCelestialPresentation(getBodyById("moon")!).surface).toBe(
    "cratered-rock",
  );
});

it("assigns icy bands only to Saturn", () => {
  expect(getCelestialPresentation(getBodyById("saturn")!).ringStyle).toBe(
    "icy-bands",
  );
  expect(getCelestialPresentation(getBodyById("earth")!).ringStyle).toBeUndefined();
});
