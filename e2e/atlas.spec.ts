import { test, expect } from "@playwright/test";

const overlapArea = (
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) =>
  Math.max(
    0,
    Math.min(first.x + first.width, second.x + second.width) -
      Math.max(first.x, second.x),
  ) *
  Math.max(
    0,
    Math.min(first.y + first.height, second.y + second.height) -
      Math.max(first.y, second.y),
  );

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

test("opens the profile for each body selected directly from the catalog", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Titan" }).click();
  await expect(
    page.getByRole("dialog", { name: "Titan profile" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mars" }).click();
  await expect(
    page.getByRole("dialog", { name: "Mars profile" }),
  ).toBeVisible();
});

test("keeps the profile title opaque above its scrolling content", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Jupiter", exact: true }).click();
  const profile = page.getByRole("dialog", { name: "Jupiter profile" });
  const header = profile.getByTestId("profile-sticky-header");
  const headerBeforeScroll = await header.boundingBox();
  expect(headerBeforeScroll).not.toBeNull();
  await profile.evaluate((element) => {
    element.scrollTop = 220;
  });
  await expect
    .poll(() => profile.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  const headerAfterScroll = await header.boundingBox();
  expect(headerAfterScroll).not.toBeNull();
  await expect(header).toBeVisible();
  await expect(header).toHaveCSS("position", "sticky");
  await expect(header).toHaveCSS("background-color", "rgb(7, 20, 38)");
  expect(headerAfterScroll!.x).toBeCloseTo(headerBeforeScroll!.x, 0);
  expect(headerAfterScroll!.y).toBeCloseTo(headerBeforeScroll!.y, 0);
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

test("shows unmistakable focus rings without clipping rail cards", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const search = page.getByRole("searchbox", {
    name: "Search celestial bodies",
  });
  await search.focus();
  const searchRing = await search.locator("..").evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.outlineColor,
      style: styles.outlineStyle,
      width: Number.parseFloat(styles.outlineWidth),
    };
  });
  expect(searchRing.style).toBe("solid");
  expect(searchRing.width).toBeGreaterThanOrEqual(2);
  expect(searchRing.color).not.toBe("rgba(0, 0, 0, 0)");

  const earth = page.getByRole("button", { name: "Earth", exact: true });
  await earth.focus();
  const cardRing = await earth.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      offset: Number.parseFloat(styles.outlineOffset),
      width: Number.parseFloat(styles.outlineWidth),
    };
  });
  expect(cardRing.width).toBeGreaterThanOrEqual(2);
  expect(cardRing.offset).toBeLessThanOrEqual(0);
});

test("brings the selected card into view after desktop-to-mobile resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const list = page.locator(".body-list");
  const earth = page.getByRole("button", { name: "Earth", exact: true });
  await expect(earth).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(300);
  expect(await list.evaluate((element) => element.scrollLeft)).toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });

  await expect
    .poll(() =>
      list.evaluate((element) => {
        const selected = element.querySelector<HTMLElement>(
          '[aria-pressed="true"]',
        );
        if (!selected) return false;
        const listRect = element.getBoundingClientRect();
        const selectedRect = selected.getBoundingClientRect();

        return (
          selectedRect.left >= listRect.left &&
          selectedRect.right <= listRect.right
        );
      }),
    )
    .toBe(true);
});

for (const viewport of [
  { width: 390, height: 844, name: "portrait" },
  { width: 844, height: 390, name: "short landscape" },
]) {
  test(`flows the focus summary after the ${viewport.name} scene viewport`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const scene = await page.locator(".scene-canvas, .webgl-fallback").boundingBox();
    const focus = await page.locator(".focus-card").boundingBox();
    const controls = await page.locator(".view-controls").boundingBox();
    const stage = await page.locator(".atlas-stage").boundingBox();

    expect(scene).not.toBeNull();
    expect(focus).not.toBeNull();
    expect(controls).not.toBeNull();
    expect(stage).not.toBeNull();
    expect(focus!.y).toBeGreaterThanOrEqual(scene!.y + scene!.height - 1);
    expect(controls!.y).toBeGreaterThanOrEqual(focus!.y + focus!.height - 1);
    expect(focus!.y + focus!.height).toBeLessThanOrEqual(
      stage!.y + stage!.height + 1,
    );
  });
}

test("uses mobile source and keyboard order from scene controls to catalog", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

  const profileTrigger = page.getByRole("button", {
    name: "Open Earth profile",
  });
  const firstView = page.getByRole("button", { name: "3D view" });
  const search = page.getByRole("searchbox", {
    name: "Search celestial bodies",
  });

  await page.keyboard.press("Tab");
  await expect(profileTrigger).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(firstView).toBeFocused();
  for (let index = 0; index < 5; index += 1) {
    await page.keyboard.press("Tab");
  }
  await expect(search).toBeFocused();

  const sourceOrder = await page.evaluate(() => {
    const stage = document.querySelector(".atlas-stage")!;
    const explore = document.querySelector(".explore-panel")!;
    return Boolean(
      stage.compareDocumentPosition(explore) & Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
  expect(sourceOrder).toBe(true);
});

test("renders the nonmodal profile inline without covering tablet controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  await page.getByRole("button", { name: "Earth", exact: true }).click();

  const profile = page.getByRole("dialog", { name: "Earth profile" });
  const controls = page.getByRole("region", { name: "View controls" });
  const profileBox = await profile.boundingBox();
  const controlsBox = await controls.boundingBox();
  expect(profileBox).not.toBeNull();
  expect(controlsBox).not.toBeNull();
  expect(overlapArea(profileBox!, controlsBox!)).toBe(0);

  const profileStyles = await profile.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backdropFilter: styles.backdropFilter,
      overscrollBehavior: styles.overscrollBehavior,
      position: styles.position,
    };
  });
  expect(profileStyles.position).not.toBe("fixed");
  expect(profileStyles.backdropFilter).toBe("none");
  expect(profileStyles.overscrollBehavior).toBe("contain");
});

test("keeps mobile keyboard focus on unobscured content around the inline profile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Earth", exact: true }).click();

  const close = page.getByRole("button", { name: "Close profile" });
  await expect(close).toBeFocused();
  await expect(close).toBeInViewport();
  await page.keyboard.press("Shift+Tab");

  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.activeElement as HTMLElement | null;
        if (!active) return false;
        const rect = active.getBoundingClientRect();
        const x = Math.min(innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
        const y = Math.min(innerHeight - 1, Math.max(0, rect.top + rect.height / 2));
        const hit = document.elementFromPoint(x, y);

        return (
          rect.bottom > 0 &&
          rect.top < innerHeight &&
          (hit === active || active.contains(hit) || Boolean(hit?.contains(active)))
        );
      }),
    )
    .toBe(true);
});

test("keeps visible view labels and compliant small-label contrast", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const viewLabels = page.locator(".view-controls__view-label");
  await expect(viewLabels).toHaveText([
    "3D",
    "Top",
    "Side",
  ]);
  for (const label of await viewLabels.all()) {
    await expect(label).toBeVisible();
  }

  const contrast = await page.locator(".focus-facts dt").first().evaluate((element) => {
    const parse = (color: string) =>
      color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number);
    const luminance = (channels: number[]) => {
      const [red, green, blue] = channels.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const foreground = getComputedStyle(element).color;
    const background = getComputedStyle(element.parentElement!).backgroundColor;
    const light = Math.max(
      luminance(parse(foreground)),
      luminance(parse(background)),
    );
    const dark = Math.min(
      luminance(parse(foreground)),
      luminance(parse(background)),
    );

    return { foreground, background, ratio: (light + 0.05) / (dark + 0.05) };
  });
  expect(contrast.ratio).toBeGreaterThanOrEqual(4.5);
});
