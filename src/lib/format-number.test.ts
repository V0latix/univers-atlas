import { expect, it } from "vitest";

import { formatNumber } from "./format-number";

it("formats scientific values for the requested locale", () => {
  expect(formatNumber(1_426_666_422, "en")).toBe("1,426,666,422");
  expect(formatNumber(15.945, "en")).toBe("15.945");
  expect(formatNumber(1_426_666_422)).toBe("1 426 666 422");
  expect(formatNumber(15.945)).toBe("15,945");
});
