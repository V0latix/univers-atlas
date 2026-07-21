import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { getBodyById } from "@/data/solar-system";
import { CelestialBodyCard } from "./CelestialBodyCard";

it("renders and activates a recognizable selected body card", async () => {
  const titan = getBodyById("titan")!;
  const onSelect = vi.fn();
  const user = userEvent.setup();

  render(<CelestialBodyCard body={titan} selected onSelect={onSelect} />);

  const card = screen.getByRole("button", { name: "Titan" });
  expect(card).toHaveAttribute("aria-pressed", "true");
  expect(card).toHaveStyle(`--body-color: ${titan.color}`);
  expect(screen.getByText("Moon")).toBeInTheDocument();
  expect(screen.getByText("15.945 day orbit")).toBeInTheDocument();

  await user.click(card);
  expect(onSelect).toHaveBeenCalledWith("titan");
});

it("renders rings only for Saturn", () => {
  const onSelect = vi.fn();
  const { rerender } = render(
    <CelestialBodyCard
      body={getBodyById("saturn")!}
      selected={false}
      onSelect={onSelect}
    />,
  );

  const saturnRings = screen.getByLabelText("Saturn rings");
  expect(saturnRings).toBeInTheDocument();
  expect(saturnRings.closest('[aria-hidden="true"]')).toBeNull();

  rerender(
    <CelestialBodyCard
      body={getBodyById("earth")!}
      selected={false}
      onSelect={onSelect}
    />,
  );

  expect(screen.queryByLabelText("Earth rings")).not.toBeInTheDocument();
});
