import { test, expect } from "@playwright/test";

test("finds Titan, opens its profile, and changes the view and time speed", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Search celestial bodies" })
    .fill("Titan");
  await page.getByRole("button", { name: "Titan" }).click();
  await page.getByRole("button", { name: "Open Titan profile" }).click();
  await expect(page.getByRole("dialog", { name: "Titan profile" })).toContainText(
    "Mean temperature",
  );
  await page.getByRole("button", { name: "Top view" }).click();
  await expect(page.getByRole("button", { name: "Top view" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByLabel("Simulation speed").selectOption("90");
});
