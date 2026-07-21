import { render, screen } from "@testing-library/react";

import { AtlasShell } from "./AtlasShell";

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
