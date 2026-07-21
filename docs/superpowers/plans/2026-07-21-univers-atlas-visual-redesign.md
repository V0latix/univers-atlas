# Univers Atlas Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing atlas into an immersive exploration cockpit with visible celestial-body cards and a polished responsive interface.

**Architecture:** Keep the catalog, Zustand store, orbital domain, and React Three Fiber scene unchanged. Introduce one stateless card component, give each UI region explicit structural hooks, then replace the broad descendant CSS with a responsive component-oriented visual system.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, React Three Fiber, Lucide React, authored global CSS, Vitest, Testing Library, Playwright.

## Global Constraints

- Preserve scientific data, profile content, orbital calculations, camera behavior, and simulation timing.
- Add no runtime dependency and fetch no media from the network.
- Preserve keyboard navigation, dialog focus restoration, accessible labels, and the WebGL fallback.
- Respect `prefers-reduced-motion` and keep touch targets approximately 44 pixels.
- Keep the existing English interface and scientific content.

## File Structure

- Create `src/components/atlas/CelestialBodyCard.tsx` for one stateless accessible catalog card.
- Create `src/components/atlas/CelestialBodyCard.test.tsx` for card semantics and activation.
- Modify `ExplorePanel.tsx` and its test for card navigation and empty search.
- Modify `AtlasShell.tsx` and its test for the top bar and layered stage.
- Modify `FocusCard.tsx`, `ProfilePanel.tsx`, and `ViewControls.tsx` plus existing tests for polished cockpit markup.
- Modify `SceneCanvas.tsx` to move visual background ownership to CSS.
- Replace `src/app/globals.css` with the cockpit visual system and responsive composition.
- Modify `e2e/atlas.spec.ts` for desktop and mobile layout checks.

---

### Task 1: Accessible Celestial-Body Cards

**Files:**
- Create: `src/components/atlas/CelestialBodyCard.tsx`
- Create: `src/components/atlas/CelestialBodyCard.test.tsx`
- Modify: `src/components/atlas/ExplorePanel.tsx`
- Modify: `src/components/atlas/ExplorePanel.test.tsx`

**Interfaces:**
- Consumes: `CelestialBody`, `selectedId: string`, and `selectBody(id: string): void`.
- Produces: `CelestialBodyCard({ body, selected, onSelect })` and the text state `No celestial bodies found`.

- [ ] **Step 1: Write failing component tests**

Create the card test:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { getBodyById } from "@/data/solar-system";
import { CelestialBodyCard } from "./CelestialBodyCard";

it("renders and activates a recognizable selected body card", async () => {
  const titan = getBodyById("titan")!;
  const onSelect = vi.fn();
  const user = userEvent.setup();

  render(<CelestialBodyCard body={titan} selected onSelect={onSelect} />);

  const card = screen.getByRole("button", { name: "Titan" });
  expect(card).toHaveAttribute("aria-pressed", "true");
  expect(card).toHaveStyle(`--body-color: ${titan.color}`);
  expect(screen.getByText("Moon")).toBeInTheDocument();
  expect(screen.getByText("15.945 day orbit")).toBeInTheDocument();

  await user.click(card);
  expect(onSelect).toHaveBeenCalledWith("titan");
});
```

Add two cases to `ExplorePanel.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify the tests fail**

Run:

```bash
npm test -- src/components/atlas/CelestialBodyCard.test.tsx src/components/atlas/ExplorePanel.test.tsx
```

Expected: FAIL because the card module and new states do not exist.

- [ ] **Step 3: Implement the card**

Create `CelestialBodyCard.tsx`:

```tsx
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";

import type { CelestialBody } from "@/domain/types";

type CelestialBodyCardProps = {
  body: CelestialBody;
  selected: boolean;
  onSelect: (id: string) => void;
};

const kindLabels = { star: "Star", planet: "Planet", moon: "Moon" } as const;

const getContext = (body: CelestialBody) =>
  body.orbitalPeriodDays === undefined
    ? "Solar System star"
    : `${body.orbitalPeriodDays.toLocaleString()} day orbit`;

export function CelestialBodyCard({
  body,
  selected,
  onSelect,
}: CelestialBodyCardProps) {
  const style = { "--body-color": body.color } as CSSProperties;

  return (
    <button
      type="button"
      className="body-card"
      aria-label={body.name}
      aria-pressed={selected}
      style={style}
      onClick={() => onSelect(body.id)}
    >
      <span className="body-card__visual" aria-hidden="true">
        <span className="body-card__orb" />
        <span className="body-card__orbit" />
      </span>
      <span className="body-card__content">
        <span className="body-card__kind">{kindLabels[body.kind]}</span>
        <strong>{body.name}</strong>
        <span className="body-card__meta">{getContext(body)}</span>
      </span>
      <ArrowUpRight className="body-card__arrow" aria-hidden="true" size={16} />
    </button>
  );
}
```

- [ ] **Step 4: Refactor ExplorePanel**

Keep its query and store logic. Add `className="explore-panel"`, a heading with `Celestial index` and `Explore worlds`, a search field containing a decorative Lucide `Search` icon, the existing `aria-live` status, and this result branch:

```tsx
{results.length > 0 ? (
  <ul className="body-list">
    {results.map((body) => (
      <li key={body.id}>
        <CelestialBodyCard
          body={body}
          selected={body.id === selectedId}
          onSelect={selectBody}
        />
      </li>
    ))}
  </ul>
) : (
  <div className="catalog-empty" role="status">
    <strong>No celestial bodies found</strong>
    <span>Try another name or classification.</span>
  </div>
)}
```

Keep the search label accessible as `Search celestial bodies` and preserve the exact live string `${selectedBody.name} selected`.

- [ ] **Step 5: Verify and commit**

Run the focused test command from Step 2. Expected: both files PASS.

```bash
git add src/components/atlas/CelestialBodyCard.tsx src/components/atlas/CelestialBodyCard.test.tsx src/components/atlas/ExplorePanel.tsx src/components/atlas/ExplorePanel.test.tsx
git commit -m "feat: add visual celestial body cards"
```

---

### Task 2: Cockpit Shell and Instrument Panels

**Files:**
- Modify: `src/components/atlas/AtlasShell.tsx`
- Modify: `src/components/atlas/AtlasShell.test.tsx`
- Modify: `src/components/atlas/FocusCard.tsx`
- Modify: `src/components/atlas/ProfilePanel.tsx`
- Modify: `src/components/atlas/ProfilePanel.test.tsx`
- Modify: `src/components/atlas/ViewControls.tsx`
- Modify: `src/components/atlas/ViewControls.test.tsx`
- Modify: `src/components/atlas/SceneCanvas.tsx`

**Interfaces:**
- Consumes: all existing store selectors and actions.
- Produces: `.atlas-topbar`, `.atlas-stage`, `.focus-card`, `.profile-panel`, and `.view-controls`; all existing accessible names remain exact.

- [ ] **Step 1: Add failing structural tests**

Add to `AtlasShell.test.tsx`:

```tsx
it("renders the cockpit identity and persistent navigation", async () => {
  render(<AtlasShell forceWebglFallback />);

  expect(screen.getByRole("banner")).toHaveClass("atlas-topbar");
  expect(screen.getByText("Live simulation")).toBeInTheDocument();
  expect(
    await screen.findByRole("complementary", {
      name: "Explore the Solar System",
    }),
  ).toHaveClass("explore-panel");
});
```

Add to the focus/profile test file:

```tsx
it("shows key facts in the compact selected-body summary", () => {
  useAtlasStore.getState().selectBody("titan");
  render(<FocusCard />);

  expect(screen.getByText("5,150 km")).toBeInTheDocument();
  expect(screen.getByText("-179 °C")).toBeInTheDocument();
  expect(screen.getByText("15.945 days")).toBeInTheDocument();
});
```

- [ ] **Step 2: Verify structural tests fail**

```bash
npm test -- src/components/atlas/AtlasShell.test.tsx src/components/atlas/ProfilePanel.test.tsx
```

Expected: FAIL because the top bar, stage classes, and focus facts are absent.

- [ ] **Step 3: Compose the shell**

Use this structure inside `AtlasShell`:

```tsx
<main className="atlas-shell">
  <header className="atlas-topbar">
    <div className="atlas-brand">
      <span className="brand-mark" aria-hidden="true"><Orbit size={20} /></span>
      <div>
        <span className="eyebrow">Interactive planetary guide</span>
        <h1>Univers Atlas</h1>
      </div>
    </div>
    <div className="mission-status">
      <span className="status-dot" aria-hidden="true" />
      <span><strong>Live simulation</strong>{solarSystem.length} tracked bodies</span>
    </div>
  </header>
  <ExplorePanel />
  <div className="atlas-stage">
    {fallback ? (
      <WebglFallback />
    ) : (
      <SceneCanvas onWebglUnavailable={showFallback} />
    )}
    <ViewControls />
    <FocusCard />
  </div>
  <ProfilePanel />
</main>
```

Import `Orbit` and `solarSystem`. Preserve `forceWebglFallback` and `showFallback` exactly.

- [ ] **Step 4: Enrich FocusCard with existing data**

Add `className="focus-card"` and a `focus-facts` definition list. Use:

```tsx
const valueWithUnit = (value: number | undefined, unit: string) =>
  value === undefined ? "Unavailable" : `${value.toLocaleString()} ${unit}`;

<dl className="focus-facts">
  <div><dt>Diameter</dt><dd>{valueWithUnit(selectedBody.diameterKm, "km")}</dd></div>
  <div><dt>Temperature</dt><dd>{valueWithUnit(selectedBody.temperatureC, "°C")}</dd></div>
  <div><dt>Orbit</dt><dd>{valueWithUnit(selectedBody.orbitalPeriodDays, "days")}</dd></div>
</dl>
```

Wrap its heading and summary with `focus-card__heading` and `focus-card__summary`. Add a decorative `ArrowUpRight` to the profile trigger, but preserve its id and exact accessible name `Open ${selectedBody.name} profile`.

- [ ] **Step 5: Add explicit hooks and icons**

In `ProfilePanel`, set `className="profile-panel"` and render a decorative Lucide `X` in the close button while preserving `aria-label="Close profile"`.

In `ViewControls`, set `className="view-controls"`, wrap view buttons in `view-controls__group`, and use decorative `Box`, `CircleDot`, `PanelTop`, `Pause`, and `Play` icons. Put explicit `aria-label` values on buttons so `3D view`, `Top view`, `Side view`, and `Pause simulation` remain unchanged to assistive technology. Keep the labelled speed select unchanged.

In `SceneCanvas`, remove the inline `style` background; keep the existing class and region label.

- [ ] **Step 6: Verify and commit**

```bash
npm test -- src/components/atlas/AtlasShell.test.tsx src/components/atlas/ProfilePanel.test.tsx src/components/atlas/ViewControls.test.tsx
```

Expected: all three files PASS, including focus restoration and store state tests.

```bash
git add src/components/atlas/AtlasShell.tsx src/components/atlas/AtlasShell.test.tsx src/components/atlas/FocusCard.tsx src/components/atlas/ProfilePanel.tsx src/components/atlas/ProfilePanel.test.tsx src/components/atlas/ViewControls.tsx src/components/atlas/ViewControls.test.tsx src/components/atlas/SceneCanvas.tsx
git commit -m "feat: compose immersive atlas cockpit"
```

---

### Task 3: Responsive Immersive Visual System

**Files:**
- Modify: `src/app/globals.css`
- Modify: `e2e/atlas.spec.ts`

**Interfaces:**
- Consumes: component hooks from Tasks 1 and 2 and the card CSS property `--body-color`.
- Produces: desktop cockpit grid, layered stage UI, visible selected cards, a mobile horizontal rail, profile overlay, and reduced-motion behavior.

- [ ] **Step 1: Write failing browser layout tests**

Add:

```ts
test("shows recognizable cards beside the desktop scene", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const earth = page.getByRole("button", { name: "Earth" });
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
  await expect(page.getByRole("button", { name: "Earth" })).toBeVisible();
  expect(
    await list.evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
```

- [ ] **Step 2: Verify layout tests fail**

```bash
npx playwright test e2e/atlas.spec.ts --grep "recognizable cards|horizontal mobile rail"
```

Expected: FAIL because the hooks do not yet have cockpit or rail styling.

- [ ] **Step 3: Replace the theme and layout CSS**

Keep `@import "tailwindcss";`. Define these exact tokens:

```css
:root {
  --space-void: #02040a;
  --space-deep: #050a14;
  --space-blue: #071426;
  --surface: rgb(7 15 28 / 88%);
  --surface-raised: rgb(10 21 38 / 94%);
  --surface-soft: rgb(139 191 255 / 7%);
  --ice: #9dcaff;
  --ice-bright: #d8eaff;
  --text: #f3f7fd;
  --muted: #91a2b8;
  --dim: #607187;
  --line: rgb(157 202 255 / 15%);
  --line-strong: rgb(157 202 255 / 34%);
  --success: #78d9b0;
  --radius-lg: 1.4rem;
}
```

Implement `.atlas-shell` as a two-column, two-row grid with areas `topbar topbar` and `explore stage`, columns `19.5rem minmax(0, 1fr)`, rows `4.7rem minmax(0, 1fr)`, `height: 100svh`, and `overflow: hidden`. Give it layered radial gradients and a faint 64-pixel grid pseudo-element.

Style the top bar as a compact flex row. Style `.explore-panel`, `.focus-card`, `.view-controls`, and `.profile-panel` as dark translucent surfaces using `--line` borders, blur, and restrained shadows. Style `.atlas-stage` as a relative, clipped, rounded main surface. Position `.scene-canvas` and `.webgl-fallback` absolutely to fill it.

- [ ] **Step 4: Implement card and overlay CSS**

Use these required card rules:

```css
.body-list {
  display: grid;
  gap: .55rem;
  margin: 0;
  padding: 0 .15rem .5rem 0;
  max-height: calc(100% - 8rem);
  overflow-y: auto;
  list-style: none;
}
.body-card {
  position: relative;
  display: grid;
  grid-template-columns: 3.35rem minmax(0, 1fr) auto;
  align-items: center;
  gap: .75rem;
  width: 100%;
  min-height: 4.7rem;
  padding: .65rem .72rem;
  border: 1px solid transparent;
  border-radius: 1rem;
  color: var(--text);
  background: rgb(133 180 235 / 4%);
  text-align: left;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}
.body-card:hover {
  transform: translateX(2px);
  border-color: var(--line);
  background: rgb(133 180 235 / 7%);
}
.body-card[aria-pressed="true"] {
  border-color: color-mix(in srgb, var(--body-color) 56%, var(--ice));
  background: rgb(133 180 235 / 9%);
  box-shadow: inset 3px 0 0 var(--body-color);
}
.body-card__visual {
  position: relative;
  display: grid;
  width: 3.25rem;
  height: 3.25rem;
  place-items: center;
}
.body-card__orb {
  width: 1.72rem;
  height: 1.72rem;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, white, var(--body-color) 28%, #02040a 85%);
  box-shadow: 0 0 1rem color-mix(in srgb, var(--body-color) 32%, transparent);
}
.body-card__orbit {
  position: absolute;
  width: 3.15rem;
  height: 1.15rem;
  border: 1px solid color-mix(in srgb, var(--body-color) 40%, transparent);
  border-radius: 50%;
  transform: rotate(-18deg);
}
```

Complete the content, search, empty-state, count, and heading selectors from the class names in Tasks 1 and 2. Position `.view-controls` at the lower left of the stage and `.focus-card` at the lower right. Limit the focus card to 24rem, format its facts as three columns, and keep both overlays above the canvas. Position `.profile-panel` fixed against the right viewport edge with a maximum width of 29rem and internal scrolling.

- [ ] **Step 5: Add responsive contracts**

At `max-width: 980px`, change the shell to a vertically flowing document, place the stage before the catalog, give the stage `min-height: 65svh`, and change `.body-list` to:

```css
.body-list {
  display: flex;
  max-height: none;
  padding-bottom: .65rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
}
.body-list li {
  flex: 0 0 15rem;
  scroll-snap-align: start;
}
```

At `max-width: 640px`, use 0.65rem page gaps, a `68svh` stage, cards 13.5rem wide, a focus card spanning the stage above the controls, and a full-width controls bar. Hide the third focus fact, keep buttons at least 2.75rem square, and inset the profile by 0.65rem. Ensure the document width remains the viewport width.

Add:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
```

- [ ] **Step 6: Verify and commit**

Run the focused Playwright command from Step 2. Expected: both layout tests PASS.

```bash
git add src/app/globals.css e2e/atlas.spec.ts
git commit -m "feat: apply immersive responsive atlas styling"
```

---

### Task 4: Full Verification and Visual Refinement

**Files:**
- Modify only when a check reveals a defect: files listed in Tasks 1–3.

**Interfaces:**
- Consumes: completed cockpit and existing quality scripts.
- Produces: lint-clean, test-clean, buildable responsive application.

- [ ] **Step 1: Run static and component checks**

```bash
npm run lint
npm test
```

Expected: both commands exit 0 and every Vitest file passes.

- [ ] **Step 2: Run the full browser journey**

```bash
npm run test:e2e
```

Expected: the Titan exploration journey and both responsive layout tests pass.

- [ ] **Step 3: Build for production**

```bash
npm run build
```

Expected: Next.js completes successfully with exit code 0.

- [ ] **Step 4: Inspect desktop and mobile screenshots**

Run the app locally and capture 1440×900 and 390×844. Confirm cards are immediately visible and distinct, Earth is unmistakably selected, the 3D scene dominates, overlays do not collide, the profile scrolls with a visible close action, only the mobile card rail scrolls horizontally, and the WebGL fallback belongs visually to the same stage.

For each observed defect, make the smallest correction in a listed file, rerun its focused test, and inspect the same viewport again.

- [ ] **Step 5: Review the final state**

```bash
git status --short
git diff --check
git log --oneline -5
```

Expected: no uncommitted implementation file, no whitespace error, and three focused implementation commits after the design and plan documentation commits.
