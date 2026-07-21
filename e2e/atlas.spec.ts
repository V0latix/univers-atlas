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

test("shows recognizable cards beside the desktop scene", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const earth = page.getByRole("button", { name: "Earth", exact: true });
  await expect(earth).toBeVisible();
  await expect(earth).toHaveAttribute("aria-pressed", "true");
  await expect(earth.locator(".body-card__orb")).toBeVisible();

  const panel = await page.locator(".explore-panel").boundingBox();
  const stage = await page.locator(".atlas-stage").boundingBox();
  expect(panel).not.toBeNull();
  expect(stage).not.toBeNull();
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(stage!.x);
  expect(stage!.width).toBeGreaterThan(700);
});

test("turns the body catalog into a horizontal mobile rail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const list = page.locator(".body-list");
  const earth = page.getByRole("button", { name: "Earth", exact: true });
  await expect(earth).toBeVisible();
  expect(
    await list.evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true);
  const listBox = await list.boundingBox();
  const earthBox = await earth.boundingBox();
  expect(listBox).not.toBeNull();
  expect(earthBox).not.toBeNull();
  expect(earthBox!.x).toBeGreaterThanOrEqual(listBox!.x);
  expect(earthBox!.x + earthBox!.width).toBeLessThanOrEqual(
    listBox!.x + listBox!.width,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});
