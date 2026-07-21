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
