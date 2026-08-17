import { render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { useAtlasStore } from "@/store/atlas-store";

import Home from "./page";

afterEach(() => {
  vi.restoreAllMocks();
});

it("mounts the Univers Atlas application surface", () => {
  useAtlasStore.getState().reset();
  useAtlasStore.getState().setLocale("en");
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(<Home />);
  expect(screen.getByRole("heading", { name: "Univers Atlas" })).toBeInTheDocument();
  expect(
    screen.getByRole("searchbox", { name: "Search celestial bodies" }),
  ).toBeInTheDocument();
});
