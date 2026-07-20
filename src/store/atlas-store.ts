import { create } from "zustand";

import type { TimeMultiplier } from "@/domain/orbits";
import type { ViewMode } from "@/domain/types";

type AtlasState = {
  selectedId: string;
  viewMode: ViewMode;
  isProfileOpen: boolean;
  isPaused: boolean;
  timeMultiplier: TimeMultiplier;
  selectBody: (id: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setProfileOpen: (isOpen: boolean) => void;
  togglePaused: () => void;
  setTimeMultiplier: (multiplier: TimeMultiplier) => void;
  reset: () => void;
};

const initial = {
  selectedId: "earth",
  viewMode: "3d" as ViewMode,
  isProfileOpen: false,
  isPaused: false,
  timeMultiplier: 30 as TimeMultiplier,
};

export const useAtlasStore = create<AtlasState>((set) => ({
  ...initial,
  selectBody: (selectedId) => set({ selectedId }),
  setViewMode: (viewMode) => set({ viewMode }),
  setProfileOpen: (isProfileOpen) => set({ isProfileOpen }),
  togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
  setTimeMultiplier: (timeMultiplier) => set({ timeMultiplier }),
  reset: () => set(initial),
}));
