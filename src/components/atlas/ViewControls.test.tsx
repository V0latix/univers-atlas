import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useAtlasStore } from "@/store/atlas-store";

import { ViewControls } from "./ViewControls";

describe("ViewControls", () => {
  beforeEach(() => {
    useAtlasStore.getState().reset();
    useAtlasStore.getState().setLocale("en");
  });

  it("changes the active view and exposes it with aria-pressed", async () => {
    const user = userEvent.setup();
    render(<ViewControls />);

    expect(screen.getByRole("button", { name: "3D view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Top view" }));

    expect(useAtlasStore.getState().viewMode).toBe("top");
    expect(screen.getByRole("button", { name: "Top view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Side view" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("keeps short view labels visible without changing accessible names", () => {
    render(<ViewControls />);

    expect(
      screen.getByRole("button", { name: "3D view" }),
    ).toHaveTextContent("3D");
    expect(
      screen.getByRole("button", { name: "Top view" }),
    ).toHaveTextContent("Top");
    expect(
      screen.getByRole("button", { name: "Side view" }),
    ).toHaveTextContent("Side");
  });

  it("toggles simulation pause and exposes the state with aria-pressed", async () => {
    const user = userEvent.setup();
    render(<ViewControls />);

    const pauseButton = screen.getByRole("button", {
      name: "Pause simulation",
    });
    expect(pauseButton).toHaveAttribute("aria-pressed", "false");

    await user.click(pauseButton);

    expect(useAtlasStore.getState().isPaused).toBe(true);
    expect(pauseButton).toHaveAttribute("aria-pressed", "true");
  });

  it("resets the camera and toggles the independent scene filters", async () => {
    const user = userEvent.setup();
    render(<ViewControls />);
    const revision = useAtlasStore.getState().viewRevision;

    await user.click(screen.getByRole("button", { name: "Reset camera" }));
    await user.click(screen.getByRole("button", { name: "Planet" }));
    await user.click(screen.getByRole("button", { name: "Moon" }));
    await user.click(screen.getByRole("button", { name: "Orbits" }));

    expect(useAtlasStore.getState()).toMatchObject({
      viewRevision: revision + 1,
      showPlanets: false,
      showMoons: false,
      showOrbitPaths: false,
    });
    expect(screen.getByRole("button", { name: "Planet" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("sets the labelled simulation speed", async () => {
    const user = userEvent.setup();
    render(<ViewControls />);

    const speed = screen.getByRole("combobox", { name: "Simulation speed" });
    expect(speed).toHaveValue("30");
    expect(screen.getAllByRole("option").map((option) => option.getAttribute("value"))).toEqual([
      "1",
      "10",
      "30",
      "90",
      "365",
    ]);

    await user.selectOptions(speed, "365");

    expect(useAtlasStore.getState().timeMultiplier).toBe(365);
    expect(speed).toHaveValue("365");
  });
});
