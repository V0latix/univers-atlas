import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, vi } from "vitest";

import { SceneCanvas } from "./SceneCanvas";

const canvasState = vi.hoisted(() => ({
  shouldThrow: false,
  gl: undefined as { alpha?: boolean } | undefined,
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({
    children,
    gl,
  }: {
    children: ReactNode;
    gl?: { alpha?: boolean };
  }) => {
    canvasState.gl = gl;

    if (canvasState.shouldThrow) {
      throw new Error("WebGL renderer creation failed");
    }

    return <div data-testid="fiber-canvas">{children}</div>;
  },
}));
vi.mock("./AtlasScene", () => ({ AtlasScene: () => <div /> }));

beforeEach(() => {
  canvasState.shouldThrow = false;
  canvasState.gl = undefined;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    {} as WebGL2RenderingContext,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("exposes a labelled scene region", () => {
  render(<SceneCanvas onWebglUnavailable={() => undefined} />);

  expect(
    screen.getByLabelText("Interactive Solar System scene"),
  ).toBeInTheDocument();
  expect(canvasState.gl).toEqual({ alpha: true });
});

it("reports unavailable WebGL2 before mounting the Canvas", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const onWebglUnavailable = vi.fn();

  render(<SceneCanvas onWebglUnavailable={onWebglUnavailable} />);

  expect(onWebglUnavailable).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId("fiber-canvas")).not.toBeInTheDocument();
});

it("reports a Canvas renderer creation error", () => {
  canvasState.shouldThrow = true;
  const onWebglUnavailable = vi.fn();
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

  render(<SceneCanvas onWebglUnavailable={onWebglUnavailable} />);

  expect(onWebglUnavailable).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId("fiber-canvas")).not.toBeInTheDocument();
  consoleError.mockRestore();
});
