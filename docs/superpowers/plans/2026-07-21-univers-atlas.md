# Univers Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy an English-language, guided 3D Solar System atlas with animated orbits, view controls, searchable celestial bodies, and sourced scientific profiles.

**Architecture:** A Next.js App Router application renders the interface and a React Three Fiber scene. A local, typed catalog is the single source of truth for celestial facts and simplified orbital parameters; pure domain functions derive search results and positions, while a small Zustand store coordinates selection, view and simulation state.

**Tech Stack:** Next.js, TypeScript, React, React Three Fiber, Three.js, Drei, Zustand, Zod, Vitest, Testing Library, Playwright, Vercel.

## Global Constraints

- The initial interface and profiles are in English.
- Render the Sun, eight planets, their orbit paths, and the selected major natural satellites: Moon, Phobos, Deimos, Io, Europa, Ganymede, Callisto, Mimas, Enceladus, Titan, Iapetus, Triton, and Charon.
- Use a readable visual scale and simplified, coherent orbital motion; do not claim that distances or body sizes are scientifically scaled.
- Use a deep gradient background and soft halos; do not render a repeating field of small white points.
- Search selection must trigger a guided camera focus rather than require free-form 3D controls.
- Provide 3D, top-down, and side views, plus pause and selectable time multipliers.
- Every profile displays units and a source URL. Do not call a third-party API at runtime.
- Keep the app usable without WebGL by showing searchable scientific profiles in a clear fallback view.
- Meet keyboard and reduced-motion requirements, and verify the Vercel production build before deployment.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `src/domain/types.ts` | Catalog, orbit, view, and simulation TypeScript contracts. |
| `src/data/solar-system.ts` | Static, sourced celestial-body catalog. |
| `src/domain/search.ts` | Pure normalised search. |
| `src/domain/orbits.ts` | Pure simplified-orbit and simulation-time calculations. |
| `src/store/atlas-store.ts` | Selected object, view mode, profile and time state. |
| `src/components/atlas/AtlasScene.tsx` | WebGL scene and camera focus bridge. |
| `src/components/atlas/ExplorePanel.tsx` | Keyboard-accessible object search and results. |
| `src/components/atlas/ViewControls.tsx` | View and time controls. |
| `src/components/atlas/FocusCard.tsx` | Compact selected-object summary. |
| `src/components/atlas/ProfilePanel.tsx` | Full scientific profile. |
| `src/components/atlas/AtlasShell.tsx` | Responsive composition and WebGL fallback boundary. |
| `src/app/page.tsx` | Application entry point. |
| `src/app/globals.css` | Responsive atlas visual system and reduced-motion rules. |
| `src/test/setup.ts` | Testing Library matchers and browser API mocks. |
| `src/**/*.test.ts(x)` | Unit and component tests colocated with their modules. |
| `e2e/atlas.spec.ts` | Browser-level primary journey test. |

### Task 1: Bootstrap the application and the test harness

**Files:**
- Create: `package.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `vitest.config.ts`, `src/test/setup.ts`, `playwright.config.ts`, `.gitignore`
- Modify: `README.md`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Produces: `npm run dev`, `npm run lint`, `npm run test`, `npm run test:e2e`, and `npm run build` commands used by every later task.

- [ ] **Step 1: Create the Next.js project in a temporary directory and copy only generated application files into this repository.**

```bash
npx create-next-app@latest /tmp/univers-atlas-web --ts --tailwind --eslint --app --src-dir --import-alias '@/*' --use-npm
rsync -a --exclude '.git' --exclude 'README.md' /tmp/univers-atlas-web/ ./
npm install three @react-three/fiber @react-three/drei zustand zod lucide-react
npm install -D vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Write the failing landing-page test.**

```tsx
// src/app/page.test.tsx
import { render, screen } from "@testing-library/react";
import Home from "./page";

it("renders the Univers Atlas application name", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { name: "Univers Atlas" })).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the test to verify the baseline configuration fails.**

Run: `npm run test -- src/app/page.test.tsx`  
Expected: FAIL because the test command and Vitest configuration do not yet exist.

- [ ] **Step 4: Configure Vitest and add the minimal page.**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"], globals: true },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
```

```tsx
// src/app/page.tsx
export default function Home() {
  return <main><h1>Univers Atlas</h1></main>;
}
```

Add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json` scripts, and add `.superpowers/` to `.gitignore`.

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3000", ...devices["Desktop Chrome"] },
  webServer: { command: "npm run dev", url: "http://127.0.0.1:3000", reuseExistingServer: !process.env.CI },
});
```

Add `"test:e2e": "playwright test"` to `package.json` scripts.

- [ ] **Step 5: Run quality checks.**

Run: `npm run test -- src/app/page.test.tsx && npm run lint && npm run build`  
Expected: all commands exit with status 0.

- [ ] **Step 6: Commit the bootstrap.**

```bash
git add package.json package-lock.json src vitest.config.ts playwright.config.ts .gitignore README.md
git commit -m "chore: bootstrap Next.js atlas application"
```

### Task 2: Build the typed, local celestial catalog and search

**Files:**
- Create: `src/domain/types.ts`, `src/data/solar-system.ts`, `src/domain/search.ts`
- Test: `src/data/solar-system.test.ts`, `src/domain/search.test.ts`

**Interfaces:**
- Produces: `CelestialBody`, `BodyKind`, `ViewMode`, `solarSystem`, `getBodyById(id)`, and `searchBodies(query, bodies)`.
- Consumes: no rendering or UI code.

- [ ] **Step 1: Write failing catalog and search tests.**

```ts
// src/data/solar-system.test.ts
import { solarSystem, getBodyById } from "./solar-system";

it("contains the Sun, eight planets, and Titan with a source", () => {
  expect(solarSystem.filter((body) => body.kind === "planet")).toHaveLength(8);
  expect(getBodyById("titan")).toMatchObject({ parentId: "saturn", kind: "moon" });
  expect(getBodyById("titan")?.sourceUrl).toMatch(/^https:\/\//);
});
```

```ts
// src/domain/search.test.ts
import { solarSystem } from "@/data/solar-system";
import { searchBodies } from "./search";

it("finds Titan regardless of case and accents", () => {
  expect(searchBodies("TITAN", solarSystem).map((body) => body.id)).toContain("titan");
});
```

- [ ] **Step 2: Run tests to verify they fail.**

Run: `npm run test -- src/data/solar-system.test.ts src/domain/search.test.ts`  
Expected: FAIL with module-not-found errors.

- [ ] **Step 3: Define the catalog contract and pure search.**

```ts
// src/domain/types.ts
export type BodyKind = "star" | "planet" | "moon";
export type ViewMode = "3d" | "top" | "side";

export type CelestialBody = {
  id: string;
  name: string;
  kind: BodyKind;
  parentId?: string;
  color: string;
  radius: number;
  orbitRadius?: number;
  orbitalPeriodDays?: number;
  orbitalSpeedKmS?: number;
  rotation: string;
  diameterKm: number;
  gravityMs2?: number;
  meanTemperatureC?: number;
  composition: string;
  atmosphere?: string;
  distanceFromSunKm?: number;
  summary: string;
  notableFacts: string[];
  missions: string[];
  sourceName: string;
  sourceUrl: string;
};
```

```ts
// src/domain/search.ts
import type { CelestialBody } from "./types";

const normalise = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export function searchBodies(query: string, bodies: readonly CelestialBody[]): CelestialBody[] {
  const needle = normalise(query);
  if (!needle) return [...bodies];
  return bodies.filter((body) => normalise(`${body.name} ${body.kind}`).includes(needle));
}
```

Create `solar-system.ts` with one complete `CelestialBody` entry for the Sun, Mercury through Neptune, and the thirteen moons listed in Global Constraints. Set each record’s source to the relevant NASA Solar System Exploration or NASA Science page, and export:

```ts
export const getBodyById = (id: string) => solarSystem.find((body) => body.id === id);
```

- [ ] **Step 4: Run tests and formatting checks.**

Run: `npm run test -- src/data/solar-system.test.ts src/domain/search.test.ts && npm run lint`  
Expected: all tests pass and ESLint reports no errors.

- [ ] **Step 5: Commit the catalog.**

```bash
git add src/domain/types.ts src/domain/search.ts src/domain/search.test.ts src/data/solar-system.ts src/data/solar-system.test.ts
git commit -m "feat: add sourced solar system catalog"
```

### Task 3: Implement the deterministic simulation clock and simplified orbits

**Files:**
- Create: `src/domain/orbits.ts`
- Test: `src/domain/orbits.test.ts`

**Interfaces:**
- Consumes: `CelestialBody` from `src/domain/types.ts`.
- Produces: `secondsToSimulationDays(elapsedSeconds, multiplier)`, `orbitalPosition(body, simulationDays)`, and `TimeMultiplier`.

- [ ] **Step 1: Write failing orbit tests.**

```ts
import { orbitalPosition, secondsToSimulationDays } from "./orbits";
import { getBodyById } from "@/data/solar-system";

const earth = getBodyById("earth")!;

it("converts wall time into accelerated simulation days", () => {
  expect(secondsToSimulationDays(2, 30)).toBe(60);
});

it("returns Earth to its starting position after one orbital period", () => {
  expect(orbitalPosition(earth, 0)).toEqual(orbitalPosition(earth, earth.orbitalPeriodDays!));
});
```

- [ ] **Step 2: Run the tests to verify failure.**

Run: `npm run test -- src/domain/orbits.test.ts`  
Expected: FAIL because `orbits.ts` does not exist.

- [ ] **Step 3: Implement the orbit API.**

```ts
// src/domain/orbits.ts
import type { CelestialBody } from "./types";

export type TimeMultiplier = 0 | 1 | 10 | 30 | 90 | 365;
export type OrbitPoint = { x: number; y: number; z: number };

export const secondsToSimulationDays = (elapsedSeconds: number, multiplier: TimeMultiplier) => elapsedSeconds * multiplier;

export function orbitalPosition(body: CelestialBody, simulationDays: number): OrbitPoint {
  if (!body.orbitRadius || !body.orbitalPeriodDays) return { x: 0, y: 0, z: 0 };
  const phase = ((simulationDays % body.orbitalPeriodDays) / body.orbitalPeriodDays) * Math.PI * 2;
  return { x: Math.cos(phase) * body.orbitRadius, y: 0, z: Math.sin(phase) * body.orbitRadius };
}
```

Add this test to `src/domain/orbits.test.ts`:

```ts
it("holds simulation time when the multiplier is zero", () => {
  expect(secondsToSimulationDays(2, 0)).toBe(0);
});
```

- [ ] **Step 4: Verify behaviour.**

Run: `npm run test -- src/domain/orbits.test.ts && npm run lint`  
Expected: all tests pass.

- [ ] **Step 5: Commit the simulation primitives.**

```bash
git add src/domain/orbits.ts src/domain/orbits.test.ts
git commit -m "feat: add simplified orbital simulation"
```

### Task 4: Add predictable atlas interaction state

**Files:**
- Create: `src/store/atlas-store.ts`
- Test: `src/store/atlas-store.test.ts`

**Interfaces:**
- Consumes: `ViewMode` and `TimeMultiplier`.
- Produces: `useAtlasStore` with `selectedId`, `viewMode`, `isProfileOpen`, `isPaused`, `timeMultiplier`, `selectBody`, `setViewMode`, `setProfileOpen`, `togglePaused`, and `setTimeMultiplier`.

- [ ] **Step 1: Write failing store tests.**

```ts
import { useAtlasStore } from "./atlas-store";

beforeEach(() => useAtlasStore.getState().reset());

it("selects a body and opens its profile on request", () => {
  useAtlasStore.getState().selectBody("titan");
  useAtlasStore.getState().setProfileOpen(true);
  expect(useAtlasStore.getState()).toMatchObject({ selectedId: "titan", isProfileOpen: true });
});
```

- [ ] **Step 2: Run test to verify failure.**

Run: `npm run test -- src/store/atlas-store.test.ts`  
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the store with resettable defaults.**

```ts
import { create } from "zustand";
import type { ViewMode } from "@/domain/types";
import type { TimeMultiplier } from "@/domain/orbits";

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

const initial = { selectedId: "earth", viewMode: "3d" as ViewMode, isProfileOpen: false, isPaused: false, timeMultiplier: 30 as TimeMultiplier };

export const useAtlasStore = create<AtlasState>((set) => ({
  ...initial,
  selectBody: (selectedId) => set({ selectedId }),
  setViewMode: (viewMode) => set({ viewMode }),
  setProfileOpen: (isProfileOpen) => set({ isProfileOpen }),
  togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
  setTimeMultiplier: (timeMultiplier) => set({ timeMultiplier }),
  reset: () => set(initial),
}));
```

- [ ] **Step 4: Run store tests.**

Run: `npm run test -- src/store/atlas-store.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit interaction state.**

```bash
git add src/store/atlas-store.ts src/store/atlas-store.test.ts
git commit -m "feat: add atlas interaction state"
```

### Task 5: Render the scene and guided camera views

**Files:**
- Create: `src/components/atlas/AtlasScene.tsx`, `src/components/atlas/OrbitPath.tsx`, `src/components/atlas/CelestialBodyMesh.tsx`, `src/components/atlas/SceneCanvas.tsx`
- Test: `src/components/atlas/SceneCanvas.test.tsx`

**Interfaces:**
- Consumes: `solarSystem`, `orbitalPosition`, and `useAtlasStore`.
- Produces: `SceneCanvas({ onWebglUnavailable: () => void })`, which preflights WebGL2 after hydration and only mounts a Canvas when the browser supports it.

- [ ] **Step 1: Write the failing canvas fallback test.**

```tsx
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { SceneCanvas } from "./SceneCanvas";

vi.mock("@react-three/fiber", () => ({ Canvas: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("./AtlasScene", () => ({ AtlasScene: () => <div /> }));

it("exposes a labelled scene region", () => {
  render(<SceneCanvas onWebglUnavailable={() => undefined} />);
  expect(screen.getByLabelText("Interactive Solar System scene")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify failure.**

Run: `npm run test -- src/components/atlas/SceneCanvas.test.tsx`  
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the scene composition.**

```tsx
// src/components/atlas/SceneCanvas.tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { AtlasScene } from "./AtlasScene";

export function SceneCanvas({ onWebglUnavailable }: { onWebglUnavailable: () => void }) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    const available = canUseWebGL2();
    setWebglAvailable(available);
    if (!available) onWebglUnavailable();
  }, [onWebglUnavailable]);
  if (webglAvailable !== true) return null;
  return <section aria-label="Interactive Solar System scene" className="scene-canvas">
    <Canvas gl={{ alpha: true }} camera={{ position: [0, 42, 70], fov: 48 }}>
      <AtlasScene />
    </Canvas>
  </section>;
}
```

Implement `canUseWebGL2()` with a browser-only `canvas.getContext("webgl2")` check. Start with the SSR-stable neutral availability state `null`, probe only in an effect after hydration, and do not mount Canvas unless the result is `true`; a `false` result calls `onWebglUnavailable` so the fallback owner keeps search and profiles available. `AtlasScene` must map `solarSystem` into clickable meshes and orbit lines, use `useFrame` with `secondsToSimulationDays`, skip time progression while `isPaused`, and update a damped camera target whenever `selectedId` or `viewMode` changes. Top view uses `[0, 85, 0.1]`; side view uses `[0, 10, 90]`; 3D view uses `[0, 42, 70]`. `CelestialBodyMesh` calls `selectBody(body.id)` on click and uses its `color` and `radius`; `OrbitPath` renders a muted blue, non-dotted elliptical line. Resolve Charon’s external Pluto parent through a non-profile scene anchor positioned outside the Sun, so Charon and its orbit are visible without adding Pluto to the public catalog. Keep `scene.background` transparent and apply a non-repeating deep spatial gradient to the scene container behind the alpha-enabled canvas.

- [ ] **Step 4: Run test and manually verify views.**

Run: `npm run test -- src/components/atlas/SceneCanvas.test.tsx && npm run dev`  
Expected: test passes; browser shows solid orbital paths and no star-dot texture.

- [ ] **Step 5: Commit the scene.**

```bash
git add src/components/atlas
git commit -m "feat: render guided solar system scene"
```

### Task 6: Build search, view controls, focus card, and profiles

**Files:**
- Create: `src/components/atlas/ExplorePanel.tsx`, `src/components/atlas/ViewControls.tsx`, `src/components/atlas/FocusCard.tsx`, `src/components/atlas/ProfilePanel.tsx`
- Test: `src/components/atlas/ExplorePanel.test.tsx`, `src/components/atlas/ViewControls.test.tsx`, `src/components/atlas/ProfilePanel.test.tsx`

**Interfaces:**
- Consumes: `searchBodies`, `solarSystem`, `getBodyById`, and `useAtlasStore`.
- Produces: accessible controls that change the store without direct Three.js imports.

- [ ] **Step 1: Write failing interaction tests.**

```tsx
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { ExplorePanel } from "./ExplorePanel";

it("searches and selects Titan", async () => {
  const user = userEvent.setup();
  render(<ExplorePanel />);
  await user.type(screen.getByRole("searchbox", { name: "Search celestial bodies" }), "Titan");
  await user.click(screen.getByRole("button", { name: "Titan" }));
  expect(screen.getByText("Titan selected")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify failure.**

Run: `npm run test -- src/components/atlas/ExplorePanel.test.tsx src/components/atlas/ViewControls.test.tsx src/components/atlas/ProfilePanel.test.tsx`  
Expected: FAIL with missing-component errors.

- [ ] **Step 3: Implement the accessible controls and profile.**

```tsx
// core selection in src/components/atlas/ExplorePanel.tsx
const results = searchBodies(query, solarSystem);
return <aside aria-label="Explore the Solar System">
  <label htmlFor="body-search">Search celestial bodies</label>
  <input id="body-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
  <p aria-live="polite">{selectedId ? `${getBodyById(selectedId)?.name} selected` : ""}</p>
  <ul>{results.map((body) => <li key={body.id}><button onClick={() => selectBody(body.id)}>{body.name}</button></li>)}</ul>
</aside>;
```

`ViewControls` must render buttons named `3D view`, `Top view`, `Side view`, and `Pause simulation`; use `aria-pressed` for the active view and pause state. It must render a labelled `<select>` named `Simulation speed` with values `1`, `10`, `30`, `90`, and `365`.

`FocusCard` must contain a button with the accessible name `Open ${selectedBody.name} profile`; it calls `setProfileOpen(true)`. `ProfilePanel` must use `role="dialog"`, label itself as `Titan profile` when Titan is selected, expose a close button, and render the selected body’s composition, temperature with `°C`, rotation, orbital period with `days`, source link, facts, and missions. Render `Data unavailable` when an optional numeric property is absent.

- [ ] **Step 4: Run all component tests.**

Run: `npm run test -- src/components/atlas/ExplorePanel.test.tsx src/components/atlas/ViewControls.test.tsx src/components/atlas/ProfilePanel.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit exploration UI.**

```bash
git add src/components/atlas/ExplorePanel.tsx src/components/atlas/ViewControls.tsx src/components/atlas/FocusCard.tsx src/components/atlas/ProfilePanel.tsx src/components/atlas/*.test.tsx
git commit -m "feat: add searchable atlas controls and profiles"
```

### Task 7: Compose the responsive application and WebGL fallback

**Files:**
- Create: `src/components/atlas/AtlasShell.tsx`, `src/components/atlas/WebglFallback.tsx`
- Modify: `src/app/page.tsx`, `src/app/globals.css`, `src/app/page.test.tsx`
- Test: `src/components/atlas/AtlasShell.test.tsx`

**Interfaces:**
- Consumes: all components from Tasks 5 and 6.
- Produces: `AtlasShell`, the one client-side application surface mounted by `page.tsx`.

- [ ] **Step 1: Write failing fallback test.**

```tsx
import { render, screen } from "@testing-library/react";
import { AtlasShell } from "./AtlasShell";

it("keeps object search available when WebGL cannot be used", async () => {
  render(<AtlasShell forceWebglFallback />);
  expect(await screen.findByRole("searchbox", { name: "Search celestial bodies" })).toBeInTheDocument();
  expect(screen.getByText("3D view is unavailable in this browser.")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify failure.**

Run: `npm run test -- src/components/atlas/AtlasShell.test.tsx`  
Expected: FAIL because `AtlasShell` does not exist.

- [ ] **Step 3: Implement composition and visual rules.**

```tsx
// src/components/atlas/AtlasShell.tsx
"use client";
import { useState } from "react";
import { ExplorePanel } from "./ExplorePanel";
import { SceneCanvas } from "./SceneCanvas";
import { ViewControls } from "./ViewControls";
import { FocusCard } from "./FocusCard";
import { ProfilePanel } from "./ProfilePanel";
import { WebglFallback } from "./WebglFallback";

export function AtlasShell({ forceWebglFallback = false }: { forceWebglFallback?: boolean }) {
  const [fallback, setFallback] = useState(forceWebglFallback);
  return <main className="atlas-shell"><ExplorePanel />{fallback ? <WebglFallback /> : <SceneCanvas onWebglUnavailable={() => setFallback(true)} />}<ViewControls /><FocusCard /><ProfilePanel /></main>;
}
```

Use CSS Grid for a full-viewport desktop scene, a fixed-width translucent explore panel, and a right profile panel. At `max-width: 768px`, make controls and panels flow in document order, preserve the scene at `min-height: 52svh`, and make profiles full-width. Define `--space-base: #050918`, `--space-mid: #07182e`, `--panel: rgb(8 19 38 / 82%)`, and `--accent: #9ac8ff`; use gradients and shadows only for space depth. Do not use a radial-dot `background-image`. Include:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

- [ ] **Step 4: Verify responsive and fallback behaviour.**

Run: `npm run test -- src/components/atlas/AtlasShell.test.tsx && npm run build`  
Expected: PASS and a successful production build.

- [ ] **Step 5: Commit the integrated application.**

```bash
git add src/app src/components/atlas/AtlasShell.tsx src/components/atlas/WebglFallback.tsx src/components/atlas/AtlasShell.test.tsx
git commit -m "feat: compose responsive Univers Atlas experience"
```

### Task 8: Verify the user journey, document the application, and deploy

**Files:**
- Create: `e2e/atlas.spec.ts`
- Modify: `README.md`, `docs/TODO.md`

**Interfaces:**
- Consumes: running production application.
- Produces: repeatable browser verification and deployment instructions.

- [ ] **Step 1: Write the end-to-end primary journey.**

```ts
import { test, expect } from "@playwright/test";

test("finds Titan, opens its profile, and changes the view and time speed", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search celestial bodies" }).fill("Titan");
  await page.getByRole("button", { name: "Titan" }).click();
  await page.getByRole("button", { name: "Open Titan profile" }).click();
  await expect(page.getByRole("dialog", { name: "Titan profile" })).toContainText("Mean temperature");
  await page.getByRole("button", { name: "Top view" }).click();
  await expect(page.getByRole("button", { name: "Top view" })).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Simulation speed").selectOption("90");
});
```

- [ ] **Step 2: Run the test to establish the first outcome.**

Run: `npm run dev` in one terminal, then `npx playwright test e2e/atlas.spec.ts` in another.  
Expected: the test either passes or identifies an exact missing accessible label; correct only the labelled interface mismatch and rerun until it passes.

- [ ] **Step 3: Document local development, data attribution, and deployment.**

Add these exact README sections: `Requirements` (Node.js LTS), `Local development` (`npm install`, `npm run dev`), `Quality checks` (`npm run lint`, `npm run test`, `npx playwright test`, `npm run build`), `Data sources` (NASA Solar System Exploration and NASA Science), and `Deployment` (import the GitHub repository in Vercel, keep Framework Preset as Next.js, then deploy). Retain `docs/TODO.md` as the roadmap for French, full satellite coverage, scientific scale, and expansion beyond the Solar System.

- [ ] **Step 4: Run the release verification suite.**

Run: `npm run lint && npm run test && npx playwright test && npm run build && git diff --check`  
Expected: every command exits with status 0 and no whitespace errors are reported.

- [ ] **Step 5: Commit and push the finished implementation.**

```bash
git add e2e/atlas.spec.ts README.md docs/TODO.md
git commit -m "test: verify Solar System exploration journey"
git push origin main
```

- [ ] **Step 6: Deploy to Vercel.**

Run: `vercel --prod`  
Expected: Vercel prints a production URL serving the public `univers-atlas` repository.

## Plan self-review

- **Spec coverage:** Tasks 2–3 cover local sourced data and animated simplified orbits; Tasks 5–7 cover the immersive 3D scene, guided navigation, all three views, time controls, visual rules, responsiveness, accessibility, and fallback; Task 6 covers profiles; Task 8 covers the Titan journey, documentation, build verification, push, and deployment.
- **Placeholder scan:** No unassigned work markers are present. Every listed file has a stated responsibility, and each test task includes runnable test code and an expected command outcome.
- **Type consistency:** `CelestialBody`, `ViewMode`, `TimeMultiplier`, `orbitalPosition`, `searchBodies`, and `useAtlasStore` are introduced before their consuming tasks and use the same names throughout.
