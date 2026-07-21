import { solarSystem } from "@/data/solar-system";
import { searchBodies } from "./search";

it("finds Titan when the query uses uppercase letters and diacritics", () => {
  expect(searchBodies("TÍTÁN", solarSystem).map((body) => body.id)).toContain(
    "titan",
  );
});
