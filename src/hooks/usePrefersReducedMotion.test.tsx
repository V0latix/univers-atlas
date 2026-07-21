import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

import {
  REDUCED_MOTION_QUERY,
  usePrefersReducedMotion,
} from "./usePrefersReducedMotion";

function MotionPreference() {
  return <span>{usePrefersReducedMotion() ? "Reduced" : "Full"}</span>;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("uses an SSR-safe non-reduced snapshot", () => {
  const matchMedia = vi.fn();
  vi.stubGlobal("matchMedia", matchMedia);

  expect(renderToString(<MotionPreference />)).toContain("Full");
  expect(matchMedia).not.toHaveBeenCalled();
});

it("tracks the reduced-motion media query", () => {
  let changeListener: (() => void) | undefined;
  const mediaQueryList = {
    matches: true,
    media: REDUCED_MOTION_QUERY,
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: () => void) => {
      changeListener = listener;
    }),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } satisfies MediaQueryList;
  const matchMedia = vi.fn(() => mediaQueryList);
  vi.stubGlobal("matchMedia", matchMedia);

  render(<MotionPreference />);

  expect(screen.getByText("Reduced")).toBeInTheDocument();
  expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);

  mediaQueryList.matches = false;
  act(() => changeListener?.());

  expect(screen.getByText("Full")).toBeInTheDocument();
});
