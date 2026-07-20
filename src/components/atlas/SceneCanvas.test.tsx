import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";

import { SceneCanvas } from "./SceneCanvas";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("./AtlasScene", () => ({ AtlasScene: () => <div /> }));

it("exposes a labelled scene region", () => {
  render(<SceneCanvas onWebglUnavailable={() => undefined} />);

  expect(
    screen.getByLabelText("Interactive Solar System scene"),
  ).toBeInTheDocument();
});
