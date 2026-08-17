import { render, screen } from "@testing-library/react";
import { beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import { useAtlasStore } from "@/store/atlas-store";

import { AtlasShell } from "./AtlasShell";

beforeEach(() => {
  useAtlasStore.getState().reset();
  useAtlasStore.getState().setLocale("en");
});

it("keeps object search available when WebGL cannot be used", async () => {
  render(<AtlasShell forceWebglFallback />);
  expect(
    await screen.findByRole("searchbox", {
      name: "Search celestial bodies",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("3D view is unavailable in this browser."),
  ).toBeInTheDocument();
});

it("renders the cockpit identity and persistent navigation", async () => {
  render(<AtlasShell forceWebglFallback />);

  expect(screen.getByRole("banner")).toHaveClass("atlas-topbar");
  expect(screen.getByText("Live simulation")).toBeInTheDocument();
  expect(
    await screen.findByRole("complementary", {
      name: "Explore the Solar System",
    }),
  ).toHaveClass("explore-panel");
});

it("defaults to French and lets people switch the interface to English", async () => {
  const user = userEvent.setup();
  useAtlasStore.getState().reset();
  render(<AtlasShell forceWebglFallback />);

  expect(
    await screen.findByRole("searchbox", { name: "Rechercher un astre" }),
  ).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "EN" }));

  expect(
    screen.getByRole("searchbox", { name: "Search celestial bodies" }),
  ).toBeInTheDocument();
  expect(useAtlasStore.getState().locale).toBe("en");
});
