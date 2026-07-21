import {
  createFocusTransition,
  easeOutCubic,
  getFocusDistance,
} from "./camera-focus";

it("keeps the focus distance within the supported camera range", () => {
  expect(getFocusDistance(0.12)).toBe(4.5);
  expect(getFocusDistance(1)).toBe(5.6);
  expect(getFocusDistance(3.2)).toBe(17.92);
  expect(getFocusDistance(1.234)).toBe(6.9104);
});

it("eases camera focus progress with a cubic deceleration", () => {
  expect(easeOutCubic(0)).toBe(0);
  expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
  expect(easeOutCubic(1)).toBe(1);
});

it("creates a 450 ms focus transition aimed at the selected body", () => {
  expect(
    createFocusTransition({
      cameraPosition: [0, 42, 70],
      currentTarget: [0, 0, 0],
      bodyPosition: [14, 0, 0],
      bodyRadius: 1,
      startedAt: 100,
    }),
  ).toMatchObject({
    startedAt: 100,
    durationMs: 450,
    target: [14, 0, 0],
  });
});
