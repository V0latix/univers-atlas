import { create } from "zustand";

import type { TimeMultiplier } from "@/domain/orbits";
import type { ViewMode } from "@/domain/types";
import type { AtlasLocale } from "@/i18n/atlas-copy";

type AtlasState = {
  selectedId: string;
  viewMode: ViewMode;
  viewRevision: number;
  showPlanets: boolean;
  showMoons: boolean;
  showOrbitPaths: boolean;
  isProfileOpen: boolean;
  isPaused: boolean;
  timeMultiplier: TimeMultiplier;
  locale: AtlasLocale;
  selectBody: (id: string) => void;
  selectAndOpenProfile: (id: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  resetCamera: () => void;
  setPlanetsVisible: (isVisible: boolean) => void;
  setMoonsVisible: (isVisible: boolean) => void;
  setOrbitPathsVisible: (isVisible: boolean) => void;
  setProfileOpen: (isOpen: boolean) => void;
  togglePaused: () => void;
  setTimeMultiplier: (multiplier: TimeMultiplier) => void;
  setLocale: (locale: AtlasLocale) => void;
  reset: () => void;
};

const initial = {
  selectedId: "earth",
  viewMode: "3d" as ViewMode,
  viewRevision: 0,
  showPlanets: true,
  showMoons: true,
  showOrbitPaths: true,
  isProfileOpen: false,
  isPaused: false,
  timeMultiplier: 30 as TimeMultiplier,
  locale: "fr" as AtlasLocale,
};

export const useAtlasStore = create<AtlasState>((set) => ({
  ...initial,
  selectBody: (selectedId) => set({ selectedId }),
  selectAndOpenProfile: (selectedId) =>
    set({ selectedId, isProfileOpen: true }),
  setViewMode: (viewMode) =>
    set((state) => ({ viewMode, viewRevision: state.viewRevision + 1 })),
  resetCamera: () =>
    set((state) => ({ viewRevision: state.viewRevision + 1 })),
  setPlanetsVisible: (showPlanets) => set({ showPlanets }),
  setMoonsVisible: (showMoons) => set({ showMoons }),
  setOrbitPathsVisible: (showOrbitPaths) => set({ showOrbitPaths }),
  setProfileOpen: (isProfileOpen) => set({ isProfileOpen }),
  togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
  setTimeMultiplier: (timeMultiplier) => set({ timeMultiplier }),
  setLocale: (locale) => set({ locale }),
  reset: () => set(initial),
}));
