import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, beforeEach, vi } from "vitest";

import { SceneCanvas } from "./SceneCanvas";

const canvasState = vi.hoisted(() => ({
  gl: undefined as { alpha?: boolean } | undefined,
  renderCount: 0,
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
    canvasState.renderCount += 1;

    return <div data-testid="fiber-canvas">{children}</div>;
  },
}));
vi.mock("./AtlasScene", () => ({ AtlasScene: () => <div /> }));

beforeEach(() => {
  canvasState.gl = undefined;
  canvasState.renderCount = 0;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    {} as WebGL2RenderingContext,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("keeps the initial server render neutral without probing WebGL", () => {
  const onWebglUnavailable = vi.fn();

  const markup = renderToString(
    <SceneCanvas onWebglUnavailable={onWebglUnavailable} />,
  );

  expect(markup).toBe("");
  expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
  expect(canvasState.renderCount).toBe(0);
  expect(onWebglUnavailable).not.toHaveBeenCalled();
});

it("mounts the labelled scene after WebGL2 is available", () => {
  const onWebglUnavailable = vi.fn();

  render(<SceneCanvas onWebglUnavailable={onWebglUnavailable} />);

  expect(
    screen.getByLabelText("Interactive Solar System scene"),
  ).toBeInTheDocument();
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("webgl2");
  expect(canvasState.renderCount).toBe(1);
  expect(canvasState.gl).toEqual({ alpha: true });
  expect(onWebglUnavailable).not.toHaveBeenCalled();
});

it("reports unavailable WebGL2 after probing without mounting the Canvas", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const onWebglUnavailable = vi.fn();

  render(<SceneCanvas onWebglUnavailable={onWebglUnavailable} />);

  expect(onWebglUnavailable).toHaveBeenCalledTimes(1);
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("webgl2");
  expect(canvasState.renderCount).toBe(0);
  expect(screen.queryByTestId("fiber-canvas")).not.toBeInTheDocument();
});
