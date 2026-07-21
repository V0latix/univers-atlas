import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useAtlasStore } from "@/store/atlas-store";

import { ExplorePanel } from "./ExplorePanel";

describe("ExplorePanel", () => {
  beforeEach(() => useAtlasStore.getState().reset());

  it("searches and selects Titan", async () => {
    const user = userEvent.setup();
    render(<ExplorePanel />);

    await user.type(
      screen.getByRole("searchbox", { name: "Search celestial bodies" }),
      "Titan",
    );
    await user.click(screen.getByRole("button", { name: "Titan" }));

    expect(screen.getByText("Titan selected")).toBeInTheDocument();
    expect(useAtlasStore.getState().selectedId).toBe("titan");
    expect(screen.queryByRole("button", { name: "Earth" })).not.toBeInTheDocument();
  });
});
