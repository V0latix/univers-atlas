import { act, render, screen, waitFor } from "@testing-library/react";
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

  it("marks the current body card as selected", () => {
    render(<ExplorePanel />);

    expect(screen.getByRole("button", { name: "Earth" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Mars" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows a useful state for unmatched searches", async () => {
    const user = userEvent.setup();
    render(<ExplorePanel />);

    await user.type(
      screen.getByRole("searchbox", { name: "Search celestial bodies" }),
      "unknown world",
    );

    expect(screen.getByText("No celestial bodies found")).toBeInTheDocument();
    expect(screen.getByText("Try another name or classification.")).toBeInTheDocument();
  });

  it("reconciles a conflicting search when the store selects another body", async () => {
    const user = userEvent.setup();
    render(<ExplorePanel />);
    const search = screen.getByRole("searchbox", {
      name: "Search celestial bodies",
    });

    await user.type(search, "Titan");
    expect(screen.queryByRole("button", { name: "Mars" })).not.toBeInTheDocument();

    act(() => useAtlasStore.getState().selectBody("mars"));

    await waitFor(() => expect(search).toHaveValue(""));
    expect(screen.getByRole("button", { name: "Mars" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
