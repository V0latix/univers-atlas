import { create } from "zustand";

import type { TimeMultiplier } from "@/domain/orbits";
import type { ViewMode } from "@/domain/types";

type AtlasState = {
  selectedId: string;
  viewMode: ViewMode;
  viewRevision: number;
  isProfileOpen: boolean;
  isPaused: boolean;
  timeMultiplier: TimeMultiplier;
  selectBody: (id: string) => void;
  selectAndOpenProfile: (id: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setProfileOpen: (isOpen: boolean) => void;
  togglePaused: () => void;
  setTimeMultiplier: (multiplier: TimeMultiplier) => void;
  reset: () => void;
};

const initial = {
  selectedId: "earth",
  viewMode: "3d" as ViewMode,
  viewRevision: 0,
  isProfileOpen: false,
  isPaused: false,
  timeMultiplier: 30 as TimeMultiplier,
};

export const useAtlasStore = create<AtlasState>((set) => ({
  ...initial,
  selectBody: (selectedId) => set({ selectedId }),
  selectAndOpenProfile: (selectedId) =>
    set({ selectedId, isProfileOpen: true }),
  setViewMode: (viewMode) =>
    set((state) => ({ viewMode, viewRevision: state.viewRevision + 1 })),
  setProfileOpen: (isProfileOpen) => set({ isProfileOpen }),
  togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
  setTimeMultiplier: (timeMultiplier) => set({ timeMultiplier }),
  reset: () => set(initial),
}));
