import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { getBodyById } from "@/data/solar-system";

import { CelestialBodyPortrait } from "./CelestialBodyPortrait";

it("renders a labelled Saturn portrait with rings", () => {
  render(<CelestialBodyPortrait body={getBodyById("saturn")!} />);

  expect(
    screen.getByRole("img", { name: "Saturn illustration" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Saturn rings")).toBeInTheDocument();
});
