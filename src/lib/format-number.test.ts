import { expect, it } from "vitest";

import { formatNumber } from "./format-number";

it("uses stable English comma separators for scientific values", () => {
  expect(formatNumber(1_426_666_422)).toBe("1,426,666,422");
  expect(formatNumber(15.945)).toBe("15.945");
});
