import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { getBodyById } from "@/data/solar-system";

import { CelestialBodyPortrait } from "./CelestialBodyPortrait";

it("renders a labelled Saturn portrait with rings", () => {
  render(<CelestialBodyPortrait body={getBodyById("saturn")!} />);

  const portrait = screen.getByRole("img", { name: "Saturn illustration" });

  expect(portrait).toBeInTheDocument();
  expect(screen.getByLabelText("Saturn rings")).toBeInTheDocument();
  expect(
    portrait.querySelector('[data-ring-layer="front"]'),
  ).toBeInTheDocument();
});
