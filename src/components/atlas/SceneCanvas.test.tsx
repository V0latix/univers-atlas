import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { MOUSE } from "three";
import { afterEach, beforeEach, vi } from "vitest";

import { SceneCanvas } from "./SceneCanvas";

const canvasState = vi.hoisted(() => ({
  gl: undefined as { alpha?: boolean } | undefined,
  tabIndex: undefined as number | undefined,
  renderCount: 0,
}));
const orbitControlsState = vi.hoisted(() => ({
  props: undefined as Record<string, unknown> | undefined,
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({
    children,
    gl,
    tabIndex,
  }: {
    children: ReactNode;
    gl?: { alpha?: boolean };
    tabIndex?: number;
  }) => {
    canvasState.gl = gl;
    canvasState.tabIndex = tabIndex;
    canvasState.renderCount += 1;

    return <div data-testid="fiber-canvas">{children}</div>;
  },
}));
vi.mock("@react-three/drei", () => ({
  OrbitControls: (props: Record<string, unknown>) => {
    orbitControlsState.props = props;
    return <div data-testid="orbit-controls" />;
  },
}));
vi.mock("./AtlasScene", () => ({ AtlasScene: () => <div /> }));

beforeEach(() => {
  canvasState.gl = undefined;
  canvasState.tabIndex = undefined;
  canvasState.renderCount = 0;
  orbitControlsState.props = undefined;
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
  expect(canvasState.tabIndex).toBe(0);
  expect(orbitControlsState.props).toMatchObject({
    enablePan: true,
    enableZoom: true,
    enableRotate: true,
    mouseButtons: {
      LEFT: MOUSE.PAN,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.ROTATE,
    },
    minDistance: 8,
    maxDistance: 150,
    zoomSpeed: 0.85,
    panSpeed: 0.8,
    rotateSpeed: 0.65,
  });
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
