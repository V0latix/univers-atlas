import { solarSystem, getBodyById } from "./solar-system";

const requiredMoonIds = [
  "moon",
  "phobos",
  "deimos",
  "io",
  "europa",
  "ganymede",
  "callisto",
  "mimas",
  "enceladus",
  "titan",
  "iapetus",
  "triton",
  "charon",
] as const;

it("contains the Sun, eight planets, and Titan with a source", () => {
  expect(solarSystem.filter((body) => body.kind === "planet")).toHaveLength(8);
  expect(getBodyById("titan")).toMatchObject({ parentId: "saturn", kind: "moon" });
  expect(getBodyById("titan")?.sourceUrl).toMatch(/^https:\/\//);
});

it("contains exactly the required thirteen moons", () => {
  expect(
    solarSystem
      .filter((body) => body.kind === "moon")
      .map((body) => body.id)
      .sort(),
  ).toEqual([...requiredMoonIds].sort());
});

it("uses unique IDs and valid NASA source URLs", () => {
  const ids = solarSystem.map((body) => body.id);

  expect(new Set(ids).size).toBe(ids.length);
  for (const body of solarSystem) {
    expect(body.sourceUrl).toMatch(
      /^https:\/\/(?:[a-z0-9-]+\.)*nasa\.gov\//i,
    );
  }
});

it("keeps required physical and display values finite and positive", () => {
  for (const body of solarSystem) {
    for (const value of [body.radius, body.diameterKm, body.gravityMs2]) {
      expect(Number.isFinite(value), `${body.id} value must be finite`).toBe(true);
      expect(value, `${body.id} value must be positive`).toBeGreaterThan(0);
    }

    expect(Number.isFinite(body.temperatureC)).toBe(true);
    expect(body.temperatureLabel.trim()).not.toBe("");

    if (body.id === "sun") {
      expect(body.distanceFromSunKm).toBe(0);
      continue;
    }

    for (const value of [
      body.orbitRadius,
      body.orbitalPeriodDays,
      body.orbitalSpeedKmS,
      body.distanceFromSunKm,
    ]) {
      expect(Number.isFinite(value), `${body.id} orbital value must be finite`).toBe(
        true,
      );
      expect(value, `${body.id} orbital value must be positive`).toBeGreaterThan(0);
    }
  }
});

it("references catalog parents except for the deliberate external Pluto anchor", () => {
  const ids = new Set(solarSystem.map((body) => body.id));

  for (const body of solarSystem) {
    if (!body.parentId) continue;
    expect(
      ids.has(body.parentId) || body.parentId === "pluto",
      `${body.id} has an unknown parent`,
    ).toBe(true);
  }
});

it("qualifies temperatures according to the sourced measurement context", () => {
  expect(getBodyById("sun")).toMatchObject({
    rotation: "About 25 Earth days at the equator",
    temperatureC: 5500,
    temperatureLabel: "Photosphere temperature",
    sourceUrl: "https://science.nasa.gov/sun/facts/",
  });
  expect(getBodyById("earth")?.temperatureLabel).toBe(
    "Mean surface temperature",
  );
  expect(getBodyById("jupiter")?.temperatureLabel).toBe(
    "Mean 1-bar atmospheric temperature",
  );
  expect(getBodyById("titan")?.temperatureLabel).toBe("Surface temperature");
  expect(getBodyById("ganymede")?.temperatureLabel).toBe(
    "Representative daytime surface temperature",
  );
  expect(getBodyById("mimas")?.temperatureLabel).toBe(
    "Representative surface temperature",
  );
  expect(getBodyById("iapetus")?.temperatureLabel).toBe(
    "Dark-terrain daytime temperature",
  );
});
