import { render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import Home from "./page";

afterEach(() => {
  vi.restoreAllMocks();
});

it("mounts the Univers Atlas application surface", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(<Home />);
  expect(screen.getByRole("heading", { name: "Univers Atlas" })).toBeInTheDocument();
  expect(
    screen.getByRole("searchbox", { name: "Search celestial bodies" }),
  ).toBeInTheDocument();
});
