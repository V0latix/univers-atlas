"use client";

import type { TimeMultiplier } from "@/domain/orbits";
import type { ViewMode } from "@/domain/types";
import { useAtlasStore } from "@/store/atlas-store";

const views: ReadonlyArray<{ label: string; value: ViewMode }> = [
  { label: "3D view", value: "3d" },
  { label: "Top view", value: "top" },
  { label: "Side view", value: "side" },
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
    <section aria-label="View controls">
      <div>
        {views.map((view) => (
          <button
            key={view.value}
            type="button"
            aria-pressed={viewMode === view.value}
            onClick={() => setViewMode(view.value)}
          >
            {view.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-pressed={isPaused}
        onClick={togglePaused}
      >
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
