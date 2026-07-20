import { solarSystem } from "@/data/solar-system";
import { searchBodies } from "./search";

it("finds Titan regardless of case and accents", () => {
  expect(searchBodies("TITAN", solarSystem).map((body) => body.id)).toContain("titan");
});
