import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useAtlasStore } from "@/store/atlas-store";

import { FocusCard } from "./FocusCard";
import { ProfilePanel } from "./ProfilePanel";

describe("FocusCard and ProfilePanel", () => {
  beforeEach(() => useAtlasStore.getState().reset());

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

    expect(screen.getByRole("dialog", { name: "Titan profile" })).toBeInTheDocument();
    expect(useAtlasStore.getState().isProfileOpen).toBe(true);
  });

  it("renders Titan's scientific profile with units, source, facts, and missions", () => {
    useAtlasStore.getState().selectBody("titan");
    useAtlasStore.getState().setProfileOpen(true);
    render(<ProfilePanel />);

    expect(screen.getByText("Water ice, rock, and organic-rich surface materials")).toBeInTheDocument();
    expect(screen.getByText("-179 °C")).toBeInTheDocument();
    expect(screen.getByText("Synchronous with its orbit (15.95 days)")).toBeInTheDocument();
    expect(screen.getByText("15.945 days")).toBeInTheDocument();
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

  it("shows data unavailable for an absent optional numeric property", () => {
    useAtlasStore.getState().selectBody("sun");
    useAtlasStore.getState().setProfileOpen(true);
    render(<ProfilePanel />);

    expect(screen.getByRole("dialog", { name: "Sun profile" })).toBeInTheDocument();
    expect(screen.getByTestId("orbital-period")).toHaveTextContent("Data unavailable");
  });
});
