import { beforeEach, describe, expect, it } from "vitest";

import { useAtlasStore } from "./atlas-store";

describe("useAtlasStore", () => {
  beforeEach(() => useAtlasStore.getState().reset());

  it("selects a body and opens its profile on request", () => {
    useAtlasStore.getState().selectBody("titan");
    useAtlasStore.getState().setProfileOpen(true);

    expect(useAtlasStore.getState()).toMatchObject({
      selectedId: "titan",
      isProfileOpen: true,
    });
  });

  it("updates the selected view mode", () => {
    useAtlasStore.getState().setViewMode("top");

    expect(useAtlasStore.getState().viewMode).toBe("top");
  });

  it("toggles the paused state", () => {
    useAtlasStore.getState().togglePaused();

    expect(useAtlasStore.getState().isPaused).toBe(true);
  });

  it("sets the time multiplier, including explicit pause", () => {
    useAtlasStore.getState().setTimeMultiplier(0);

    expect(useAtlasStore.getState().timeMultiplier).toBe(0);
  });

  it("resets to the documented defaults", () => {
    useAtlasStore.getState().selectBody("mars");
    useAtlasStore.getState().setViewMode("side");
    useAtlasStore.getState().setProfileOpen(true);
    useAtlasStore.getState().togglePaused();
    useAtlasStore.getState().setTimeMultiplier(365);
    useAtlasStore.getState().reset();

    expect(useAtlasStore.getState()).toMatchObject({
      selectedId: "earth",
      viewMode: "3d",
      isProfileOpen: false,
      isPaused: false,
      timeMultiplier: 30,
    });
  });
});
