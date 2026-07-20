import { solarSystem, getBodyById } from "./solar-system";

it("contains the Sun, eight planets, and Titan with a source", () => {
  expect(solarSystem.filter((body) => body.kind === "planet")).toHaveLength(8);
  expect(getBodyById("titan")).toMatchObject({ parentId: "saturn", kind: "moon" });
  expect(getBodyById("titan")?.sourceUrl).toMatch(/^https:\/\//);
});
