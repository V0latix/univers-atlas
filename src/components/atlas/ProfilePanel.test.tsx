import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as solarSystemData from "@/data/solar-system";
import { useAtlasStore } from "@/store/atlas-store";

import { FocusCard } from "./FocusCard";
import { ProfilePanel } from "./ProfilePanel";

const expectProfileField = (label: string, value: string) => {
  const term = screen.getByText(label);

  expect(term.tagName).toBe("DT");
  expect(term.nextElementSibling).toHaveTextContent(value);
};

describe("FocusCard and ProfilePanel", () => {
  beforeEach(() => useAtlasStore.getState().reset());
  afterEach(() => vi.restoreAllMocks());

  it("opens the selected body's labelled profile from the focus card", async () => {
    const user = userEvent.setup();
    useAtlasStore.getState().selectBody("titan");
    render(
      <>
        <FocusCard />
        <ProfilePanel />
      </>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Open Titan profile" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Titan profile" });

    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute("aria-modal");
    expect(useAtlasStore.getState().isProfileOpen).toBe(true);
  });

  it("renders Titan's complete scientific profile with readable labels and units", () => {
    useAtlasStore.getState().selectBody("titan");
    useAtlasStore.getState().setProfileOpen(true);
    render(<ProfilePanel />);

    expectProfileField("Classification", "Moon");
    expectProfileField("Parent body", "Saturn");
    expectProfileField(
      "Atmosphere",
      "Dense nitrogen atmosphere with methane and complex organic haze",
    );
    expectProfileField(
      "Composition",
      "Water ice, rock, and organic-rich surface materials",
    );
    expectProfileField("Mean temperature", "-179 °C");
    expectProfileField(
      "Rotation",
      "Synchronous with its orbit (15.95 days)",
    );
    expectProfileField("Orbital period", "15.945 days");
    expectProfileField("Diameter", "5,150 km");
    expectProfileField("Surface gravity", "1.35 m/s²");
    expectProfileField("Orbital velocity", "5.57 km/s");
    expectProfileField("Distance from the Sun", "1,426,666,422 km");
    expect(
      screen.getByRole("link", { name: "NASA Science — Titan" }),
    ).toHaveAttribute("href", "https://science.nasa.gov/saturn/moons/titan/");
    expect(
      screen.getByText("It is the only moon with a substantial atmosphere."),
    ).toBeInTheDocument();
    expect(screen.getByText("Dragonfly")).toBeInTheDocument();
  });

  it("closes the profile with an accessible button", async () => {
    const user = userEvent.setup();
    useAtlasStore.getState().selectBody("titan");
    useAtlasStore.getState().setProfileOpen(true);
    render(<ProfilePanel />);

    await user.click(screen.getByRole("button", { name: "Close profile" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(useAtlasStore.getState().isProfileOpen).toBe(false);
  });

  it("shows Data unavailable for absent optional textual data", () => {
    const titan = solarSystemData.getBodyById("titan");

    expect(titan).toBeDefined();
    vi.spyOn(solarSystemData, "getBodyById").mockImplementation((id) => {
      const body = solarSystemData.solarSystem.find((entry) => entry.id === id);

      return id === "titan" && body
        ? { ...body, atmosphere: undefined }
        : body;
    });
    useAtlasStore.getState().selectBody("titan");
    useAtlasStore.getState().setProfileOpen(true);
    render(<ProfilePanel />);

    expectProfileField("Atmosphere", "Data unavailable");
  });

  it("shows Data unavailable for an absent optional numeric property", () => {
    useAtlasStore.getState().selectBody("sun");
    useAtlasStore.getState().setProfileOpen(true);
    render(<ProfilePanel />);

    expect(screen.getByRole("dialog", { name: "Sun profile" })).toBeInTheDocument();
    expectProfileField("Orbital period", "Data unavailable");
  });
});
