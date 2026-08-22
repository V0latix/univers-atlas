"use client";

import {
  Box,
  CircleDot,
  Globe2,
  Moon,
  Orbit,
  PanelTop,
  Pause,
  Play,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import type { TimeMultiplier } from "@/domain/orbits";
import type { ViewMode } from "@/domain/types";
import { getAtlasCopy } from "@/i18n/atlas-copy";
import { useAtlasStore } from "@/store/atlas-store";

const views: ReadonlyArray<{
  icon: LucideIcon;
  shortLabel: string;
  value: ViewMode;
}> = [
  { icon: Box, shortLabel: "3D", value: "3d" },
  { icon: CircleDot, shortLabel: "Top", value: "top" },
  { icon: PanelTop, shortLabel: "Side", value: "side" },
];

const speeds: TimeMultiplier[] = [1, 10, 30, 90, 365];

export function ViewControls() {
  const viewMode = useAtlasStore((state) => state.viewMode);
  const isPaused = useAtlasStore((state) => state.isPaused);
  const timeMultiplier = useAtlasStore((state) => state.timeMultiplier);
  const showPlanets = useAtlasStore((state) => state.showPlanets);
  const showMoons = useAtlasStore((state) => state.showMoons);
  const showOrbitPaths = useAtlasStore((state) => state.showOrbitPaths);
  const setViewMode = useAtlasStore((state) => state.setViewMode);
  const resetCamera = useAtlasStore((state) => state.resetCamera);
  const setPlanetsVisible = useAtlasStore((state) => state.setPlanetsVisible);
  const setMoonsVisible = useAtlasStore((state) => state.setMoonsVisible);
  const setOrbitPathsVisible = useAtlasStore(
    (state) => state.setOrbitPathsVisible,
  );
  const togglePaused = useAtlasStore((state) => state.togglePaused);
  const setTimeMultiplier = useAtlasStore((state) => state.setTimeMultiplier);
  const locale = useAtlasStore((state) => state.locale);
  const copy = getAtlasCopy(locale);
  const pauseAction = isPaused ? copy.resumeSimulation : copy.pauseSimulation;

  return (
    <section aria-label={copy.viewControls} className="view-controls">
      <div className="view-controls__group">
        {views.map((view) => {
          const Icon = view.icon;

          return (
            <button
              key={view.value}
              type="button"
              aria-label={copy.viewNames[view.value]}
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
      <div className="view-controls__actions">
        <button
          type="button"
          aria-label={copy.resetCamera}
          onClick={resetCamera}
        >
          <RotateCcw aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={pauseAction}
          aria-pressed={isPaused}
          onClick={togglePaused}
        >
          {isPaused ? (
            <Play aria-hidden="true" />
          ) : (
            <Pause aria-hidden="true" />
          )}
          {pauseAction}
        </button>
      </div>
      <label htmlFor="simulation-speed">{copy.simulationSpeed}</label>
      <select
        id="simulation-speed"
        value={timeMultiplier}
        onChange={(event) =>
          setTimeMultiplier(Number(event.target.value) as TimeMultiplier)
        }
      >
        {speeds.map((speed) => (
          <option key={speed} value={speed}>
            {copy.daysPerSecond(speed)}
          </option>
        ))}
      </select>
      <section aria-label={copy.sceneFilters} className="view-controls__filters">
        <button
          type="button"
          aria-pressed={showPlanets}
          onClick={() => setPlanetsVisible(!showPlanets)}
        >
          <Globe2 aria-hidden="true" />
          <span>{copy.bodyKinds.planet}</span>
        </button>
        <button
          type="button"
          aria-pressed={showMoons}
          onClick={() => setMoonsVisible(!showMoons)}
        >
          <Moon aria-hidden="true" />
          <span>{copy.bodyKinds.moon}</span>
        </button>
        <button
          type="button"
          aria-pressed={showOrbitPaths}
          onClick={() => setOrbitPathsVisible(!showOrbitPaths)}
        >
          <Orbit aria-hidden="true" />
          <span>{copy.orbitPaths}</span>
        </button>
      </section>
    </section>
  );
}
