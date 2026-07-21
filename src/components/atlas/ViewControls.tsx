"use client";

import {
  Box,
  CircleDot,
  PanelTop,
  Pause,
  Play,
  type LucideIcon,
} from "lucide-react";

import type { TimeMultiplier } from "@/domain/orbits";
import type { ViewMode } from "@/domain/types";
import { useAtlasStore } from "@/store/atlas-store";

const views: ReadonlyArray<{
  icon: LucideIcon;
  label: string;
  shortLabel: string;
  value: ViewMode;
}> = [
  { icon: Box, label: "3D view", shortLabel: "3D", value: "3d" },
  { icon: CircleDot, label: "Top view", shortLabel: "Top", value: "top" },
  { icon: PanelTop, label: "Side view", shortLabel: "Side", value: "side" },
];

const speeds: TimeMultiplier[] = [1, 10, 30, 90, 365];

export function ViewControls() {
  const viewMode = useAtlasStore((state) => state.viewMode);
  const isPaused = useAtlasStore((state) => state.isPaused);
  const timeMultiplier = useAtlasStore((state) => state.timeMultiplier);
  const setViewMode = useAtlasStore((state) => state.setViewMode);
  const togglePaused = useAtlasStore((state) => state.togglePaused);
  const setTimeMultiplier = useAtlasStore((state) => state.setTimeMultiplier);

  return (
    <section aria-label="View controls" className="view-controls">
      <div className="view-controls__group">
        {views.map((view) => {
          const Icon = view.icon;

          return (
            <button
              key={view.value}
              type="button"
              aria-label={view.label}
              aria-pressed={viewMode === view.value}
              onClick={() => setViewMode(view.value)}
            >
              <Icon aria-hidden="true" />
              <span className="view-controls__view-label">
                {view.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Pause simulation"
        aria-pressed={isPaused}
        onClick={togglePaused}
      >
        {isPaused ? (
          <Play aria-hidden="true" />
        ) : (
          <Pause aria-hidden="true" />
        )}
        Pause simulation
      </button>
      <label htmlFor="simulation-speed">Simulation speed</label>
      <select
        id="simulation-speed"
        value={timeMultiplier}
        onChange={(event) =>
          setTimeMultiplier(Number(event.target.value) as TimeMultiplier)
        }
      >
        {speeds.map((speed) => (
          <option key={speed} value={speed}>
            {speed} days per second
          </option>
        ))}
      </select>
    </section>
  );
}
