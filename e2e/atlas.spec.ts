import { test, expect } from "@playwright/test";

test("finds Titan, opens its profile, and changes the view and time speed", async ({
  page,
}) => {
  await page.goto("/");
  const supportsWebGL2 = await page.evaluate(
    () => document.createElement("canvas").getContext("webgl2") !== null,
  );

  if (supportsWebGL2) {
    await expect(
      page.getByRole("region", { name: "Interactive Solar System scene" }),
    ).toBeVisible();
  } else {
    await expect(
      page.getByText("3D view is unavailable in this browser."),
    ).toBeVisible();
  }

  await page
    .getByRole("searchbox", { name: "Search celestial bodies" })
    .fill("Titan");
  await page.getByRole("button", { name: "Titan" }).click();
  await page.getByRole("button", { name: "Open Titan profile" }).click();
  await expect(page.getByRole("dialog", { name: "Titan profile" })).toContainText(
    "Surface temperature",
  );
  await page.getByRole("button", { name: "Top view" }).click();
  await expect(page.getByRole("button", { name: "Top view" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const speed = page.getByLabel("Simulation speed");
  await speed.selectOption("90");
  await expect(speed).toHaveValue("90");
});
