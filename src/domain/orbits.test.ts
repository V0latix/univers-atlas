import { getBodyById } from "@/data/solar-system";
import { orbitalPosition, secondsToSimulationDays } from "./orbits";

const earth = getBodyById("earth")!;

it("converts wall time into accelerated simulation days", () => {
  expect(secondsToSimulationDays(2, 30)).toBe(60);
});

it("returns Earth to its starting position after one orbital period", () => {
  expect(orbitalPosition(earth, 0)).toEqual(
    orbitalPosition(earth, earth.orbitalPeriodDays!),
  );
});
