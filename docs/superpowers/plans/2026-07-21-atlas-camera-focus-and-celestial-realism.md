# Atlas Camera Focus and Celestial Realism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable generous free exploration with an interruptible selection zoom, render recognizable local procedural astres (including correctly layered Saturn rings), and make the selected profile’s portrait header stay above scrolling content.

**Architecture:** A small pure camera-focus module owns distance and easing math; `AtlasScene` uses it only while a focus transition is active, and `SceneCanvas` cancels it when OrbitControls receives a user gesture. A local presentation module maps celestial-body IDs to deterministic canvas textures and profile portrait classes. `CelestialBodyMesh` uses that output plus two ring halves for Saturn; `ProfilePanel` uses the same presentation metadata in an opaque sticky header.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js, @react-three/fiber, @react-three/drei, Zustand, Vitest, Testing Library, Playwright.

## Global Constraints

- Do not add dependencies, remote media, downloaded textures, new scientific data, or runtime network calls.
- Keep the local English catalogue, physical staging scale, circular `x/z` orbital plane, WebGL fallback, non-modal profile dialog, Escape close, and focus restoration.
- Camera input remains: left mouse pan, middle mouse dolly, right mouse rotate, wheel zoom, and existing touch equivalents.
- Set controls to `minDistance={1.5}` and `maxDistance={220}`; maintain a smooth selection focus of 450 ms and cancel it on manual controls start.
- Skip the animated camera transition for `prefers-reduced-motion`, while still updating the selected target immediately.
- Generate and memoize procedural texture assets locally; dispose them on unmount.
- Saturn must have rear rings, globe, then front rings in render order; no other body receives rings unless `hasRings` is true.
- Keep the profile header opaque and sticky to the profile panel’s inner top edge so scrolling content cannot show behind its title.
- Make one commit per completed feature task; do not stage the user-owned `.playwright-cli/` directory.

---

## File structure

- Create `src/components/atlas/camera-focus.ts` and test: pure focus distance, easing, and transition-state math.
- Modify `src/components/atlas/AtlasScene.tsx` and `SceneCanvas.tsx`, plus their tests: integrate cancellable focus and wider zoom limits.
- Create `src/components/atlas/celestial-presentation.ts` and test: local texture/presentation metadata.
- Modify `src/components/atlas/CelestialBodyMesh.tsx` and test: attach texture materials and explicit two-half Saturn rings.
- Create `src/components/atlas/CelestialBodyPortrait.tsx` and test: semantic profile portrait based on shared presentation metadata.
- Modify `src/components/atlas/ProfilePanel.tsx`, its test, `src/app/globals.css`, and `e2e/atlas.spec.ts`: sticky opaque portrait header and visible scroll regression.

## Task 1: Cancellable selected-astre camera focus and extended zoom

**Files:**
- Create: `src/components/atlas/camera-focus.ts`
- Create: `src/components/atlas/camera-focus.test.ts`
- Modify: `src/components/atlas/AtlasScene.tsx`
- Modify: `src/components/atlas/AtlasScene.test.ts`
- Modify: `src/components/atlas/SceneCanvas.tsx`
- Modify: `src/components/atlas/SceneCanvas.test.tsx`

**Interfaces:**
- Consumes: `CelestialBody.radius`, current scene body position, `OrbitControls` reference, selected ID, and reduced-motion preference.
- Produces: `getFocusDistance(radius: number): number`, `easeOutCubic(progress: number): number`, `createFocusTransition(input): CameraFocusTransition`, and a `cancelFocus` callback passed from `SceneCanvas` to `AtlasScene`.

- [ ] **Step 1: Write failing pure camera-focus tests**

```ts
import { describe, expect, it } from "vitest";

import {
  createFocusTransition,
  easeOutCubic,
  getFocusDistance,
} from "./camera-focus";

describe("camera focus", () => {
  it("keeps focused viewing distances within the close-observation bounds", () => {
    expect(getFocusDistance(0.12)).toBe(4.5);
    expect(getFocusDistance(1)).toBe(5.6);
    expect(getFocusDistance(3.2)).toBe(17.92);
  });

  it("builds a 450 ms transition toward a body while preserving camera direction", () => {
    expect(
      createFocusTransition({
        cameraPosition: [0, 42, 70],
        currentTarget: [0, 0, 0],
        bodyPosition: [14, 0, 0],
        bodyRadius: 1,
        startedAt: 100,
      }),
    ).toMatchObject({
      startedAt: 100,
      durationMs: 450,
      target: [14, 0, 0],
      endPosition: [14, expect.any(Number), expect.any(Number)],
    });
  });

  it("eases from zero to one without overshooting", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
    expect(easeOutCubic(1)).toBe(1);
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `npm test -- src/components/atlas/camera-focus.test.ts`

Expected: FAIL because `./camera-focus` does not exist.

- [ ] **Step 3: Implement the pure transition helpers**

```ts
export type VectorTuple = [number, number, number];
export type CameraFocusTransition = {
  startedAt: number;
  durationMs: 450;
  startPosition: VectorTuple;
  startTarget: VectorTuple;
  endPosition: VectorTuple;
  target: VectorTuple;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getFocusDistance = (radius: number) => clamp(radius * 5.6, 4.5, 18);
export const easeOutCubic = (progress: number) => 1 - (1 - clamp(progress, 0, 1)) ** 3;

export function createFocusTransition({ cameraPosition, currentTarget, bodyPosition, bodyRadius, startedAt }: {
  cameraPosition: VectorTuple; currentTarget: VectorTuple; bodyPosition: VectorTuple;
  bodyRadius: number; startedAt: number;
}): CameraFocusTransition {
  const direction = cameraPosition.map((value, index) => value - currentTarget[index]) as VectorTuple;
  const length = Math.hypot(...direction) || 1;
  const distance = getFocusDistance(bodyRadius);
  const endPosition = direction.map((value, index) => bodyPosition[index] + (value / length) * distance) as VectorTuple;
  return { startedAt, durationMs: 450, startPosition: cameraPosition, startTarget: currentTarget, endPosition, target: bodyPosition };
}
```

- [ ] **Step 4: Write failing integration assertions for controls and focus wiring**

```tsx
expect(orbitControlsState.props).toMatchObject({ minDistance: 1.5, maxDistance: 220 });
expect(typeof orbitControlsState.props?.onStart).toBe("function");
```

In `AtlasScene.test.ts`, export and test a `getFocusTarget(body, days)` wrapper that returns `getSceneBodyPosition(body, days)`; use Earth at day zero and expect its scene coordinates.

- [ ] **Step 5: Integrate the focus controller and cancel signal**

```tsx
// SceneCanvas.tsx
const [focusRevision, setFocusRevision] = useState(0);
<AtlasScene controlsRef={controlsRef} focusRevision={focusRevision} />
<OrbitControls onStart={() => setFocusRevision((revision) => revision + 1)} minDistance={1.5} maxDistance={220} />

// AtlasScene.tsx, inside a useFrame controller
const progress = (clock.getElapsedTime() * 1000 - transition.startedAt) / transition.durationMs;
const eased = easeOutCubic(progress);
controls.object.position.lerpVectors(startPosition, endPosition, eased);
controls.target.lerpVectors(startTarget, target, eased);
controls.update();
if (progress >= 1) transitionRef.current = null;
```

Create the transition when `selectedId` changes and the controls ref is available. Use `getSceneBodyPosition(selectedBody, simulationDaysRef.current)` as `bodyPosition`. When reduced motion is enabled, set camera position and target directly then call `controls.update()`. Clear `transitionRef.current` whenever `focusRevision` changes after initialization. Do not change `GuidedCamera`’s simulation behavior.

- [ ] **Step 6: Run focused tests**

Run: `npm test -- src/components/atlas/camera-focus.test.ts src/components/atlas/AtlasScene.test.ts src/components/atlas/SceneCanvas.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit the navigation feature**

```bash
git add src/components/atlas/camera-focus.ts src/components/atlas/camera-focus.test.ts src/components/atlas/AtlasScene.tsx src/components/atlas/AtlasScene.test.ts src/components/atlas/SceneCanvas.tsx src/components/atlas/SceneCanvas.test.tsx
git commit -m "feat: focus the camera on selected bodies"
```

## Task 2: Deterministic celestial textures and layered Saturn rings

**Files:**
- Create: `src/components/atlas/celestial-presentation.ts`
- Create: `src/components/atlas/celestial-presentation.test.ts`
- Modify: `src/components/atlas/CelestialBodyMesh.tsx`
- Modify: `src/components/atlas/CelestialBodyMesh.test.tsx`

**Interfaces:**
- Consumes: `CelestialBody.id`, `kind`, `color`, and `hasRings`.
- Produces: `getCelestialPresentation(body): { surface: SurfaceStyle; atmosphereColor?: string; ringStyle?: RingStyle }` and `createSurfaceTexture(body): CanvasTexture | undefined`.

- [ ] **Step 1: Write failing presentation and ring tests**

```ts
import { expect, it } from "vitest";
import { getBodyById } from "@/data/solar-system";
import { getCelestialPresentation } from "./celestial-presentation";

it("assigns distinct local surface treatments to Earth, Jupiter, and the Moon", () => {
  expect(getCelestialPresentation(getBodyById("earth")!).surface).toBe("terrestrial-clouds");
  expect(getCelestialPresentation(getBodyById("jupiter")!).surface).toBe("gas-bands");
  expect(getCelestialPresentation(getBodyById("moon")!).surface).toBe("cratered-rock");
});

it("assigns an icy multi-band ring treatment only to ringed bodies", () => {
  expect(getCelestialPresentation(getBodyById("saturn")!).ringStyle).toBe("icy-bands");
  expect(getCelestialPresentation(getBodyById("earth")!).ringStyle).toBeUndefined();
});
```

Replace the existing single-ring assertion with:

```tsx
expect(container.querySelectorAll("ringGeometry")).toHaveLength(2);
expect(container.querySelector('[data-ring-layer="rear"]')).toBeInTheDocument();
expect(container.querySelector('[data-ring-layer="front"]')).toBeInTheDocument();
expect(container.querySelector('[data-ring-layer="front"]')).toHaveAttribute("renderOrder", "3");
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- src/components/atlas/celestial-presentation.test.ts src/components/atlas/CelestialBodyMesh.test.tsx`

Expected: FAIL because the presentation module and layered-ring attributes are absent.

- [ ] **Step 3: Implement the deterministic local presentation module**

```ts
export type SurfaceStyle = "solar-granulation" | "terrestrial-clouds" | "gas-bands" | "cratered-rock" | "hazy-clouds" | "ice-giant";
export type RingStyle = "icy-bands";

export const getCelestialPresentation = (body: CelestialBody) => ({
  surface: body.id === "sun" ? "solar-granulation" : body.id === "earth" ? "terrestrial-clouds" :
    ["jupiter", "saturn"].includes(body.id) ? "gas-bands" : ["venus", "titan"].includes(body.id) ? "hazy-clouds" :
    ["uranus", "neptune"].includes(body.id) ? "ice-giant" : "cratered-rock",
  atmosphereColor: atmosphereColors[body.id],
  ringStyle: body.hasRings ? "icy-bands" : undefined,
});
```

Use a 256×128 canvas. Draw the base catalog color, seeded dot/noise patterns, and style-specific bands/cloud/crater shapes with a seed derived from `body.id`. Return `undefined` when `document` is unavailable. Build the `CanvasTexture` with `colorSpace = SRGBColorSpace`, `wrapS = RepeatWrapping`, `needsUpdate = true`, then expose `disposeSurfaceTexture(texture)` as a safe no-op for `undefined`.

- [ ] **Step 4: Apply presentation textures and split Saturn’s rings**

```tsx
const texture = useMemo(() => createSurfaceTexture(body), [body]);
useEffect(() => () => disposeSurfaceTexture(texture), [texture]);
const presentation = getCelestialPresentation(body);

<meshStandardMaterial map={texture} color={body.color} ... />
{presentation.ringStyle ? (
  <>
    <mesh data-ring-layer="rear" rotation={RING_ROTATION} renderOrder={1}>
      <ringGeometry args={[body.radius * 1.35, body.radius * 2.25, 96, 1, 0, Math.PI]} />
      <meshBasicMaterial color="#d9c28a" transparent opacity={0.54} side={DoubleSide} depthWrite={false} />
    </mesh>
    <mesh data-ring-layer="front" rotation={RING_ROTATION} renderOrder={3}>
      <ringGeometry args={[body.radius * 1.35, body.radius * 2.25, 96, 1, Math.PI, Math.PI]} />
      <meshBasicMaterial color="#f4e6b6" transparent opacity={0.76} side={DoubleSide} depthWrite={false} />
    </mesh>
  </>
) : null}
```

Set the globe mesh `renderOrder={2}`. Tune the two `thetaStart` values if visual inspection shows the visible front half is inverted, but retain the rear/globe/front order and the two geometry test assertions. Keep the existing atmosphere and solar halo; source their colors from `getCelestialPresentation`.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/components/atlas/celestial-presentation.test.ts src/components/atlas/CelestialBodyMesh.test.tsx src/components/atlas/CelestialBodyCard.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the realism feature**

```bash
git add src/components/atlas/celestial-presentation.ts src/components/atlas/celestial-presentation.test.ts src/components/atlas/CelestialBodyMesh.tsx src/components/atlas/CelestialBodyMesh.test.tsx
git commit -m "feat: render detailed procedural celestial bodies"
```

## Task 3: Sticky profile portrait with protected title area

**Files:**
- Create: `src/components/atlas/CelestialBodyPortrait.tsx`
- Create: `src/components/atlas/CelestialBodyPortrait.test.tsx`
- Modify: `src/components/atlas/ProfilePanel.tsx`
- Modify: `src/components/atlas/ProfilePanel.test.tsx`
- Modify: `src/app/globals.css`
- Modify: `e2e/atlas.spec.ts`

**Interfaces:**
- Consumes: `CelestialBody` and `getCelestialPresentation(body)`.
- Produces: `CelestialBodyPortrait({ body, size?: "profile" }): JSX.Element` and a profile header with `data-testid="profile-sticky-header"`.

- [ ] **Step 1: Write failing portrait and profile tests**

```tsx
it("renders a labelled Saturn portrait with rings", () => {
  render(<CelestialBodyPortrait body={getBodyById("saturn")!} />);
  expect(screen.getByRole("img", { name: "Saturn illustration" })).toBeInTheDocument();
  expect(screen.getByLabelText("Saturn rings")).toBeInTheDocument();
});

it("renders the selected body portrait in the profile’s sticky header", () => {
  useAtlasStore.getState().selectAndOpenProfile("mars");
  render(<ProfilePanel />);
  expect(screen.getByRole("img", { name: "Mars illustration" })).toBeInTheDocument();
  expect(screen.getByTestId("profile-sticky-header")).toContainElement(
    screen.getByRole("heading", { name: "Mars profile" }),
  );
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/components/atlas/CelestialBodyPortrait.test.tsx src/components/atlas/ProfilePanel.test.tsx`

Expected: FAIL because the portrait component and test ID do not exist.

- [ ] **Step 3: Implement the shared portrait and profile header**

```tsx
export function CelestialBodyPortrait({ body }: { body: CelestialBody }) {
  const presentation = getCelestialPresentation(body);
  return (
    <div className={`celestial-portrait celestial-portrait--${presentation.surface}`} role="img" aria-label={`${body.name} illustration`} style={{ "--body-color": body.color } as CSSProperties}>
      <span className="celestial-portrait__globe" aria-hidden="true" />
      {presentation.ringStyle ? <span className="celestial-portrait__rings" aria-label={`${body.name} rings`} /> : null}
    </div>
  );
}
```

In `ProfilePanel`, replace the existing bare `<header>` with:

```tsx
<header className="profile-panel__header" data-testid="profile-sticky-header">
  <CelestialBodyPortrait body={selectedBody} />
  <div className="profile-panel__title"><span>{asReadableLabel(selectedBody.kind)}</span><h2 id={titleId}>{selectedBody.name} profile</h2></div>
  <button ...><X aria-hidden="true" /></button>
</header>
```

- [ ] **Step 4: Make the title area fully opaque and keep mobile in flow**

```css
.profile-panel__header {
  position: sticky;
  z-index: 2;
  top: -1.15rem;
  display: flex;
  align-items: center;
  gap: .8rem;
  margin: -1.15rem -1.15rem .95rem;
  padding: 1.15rem;
  background: #071426;
  box-shadow: 0 .8rem 1.25rem rgb(2 8 18 / 88%);
}
```

Add portrait styles with one circular layered-gradient globe, style modifiers for each `SurfaceStyle`, and a rotated ring pseudo-element that appears both in front of and behind the globe through `::before`/`::after` z-indexes. In the existing `max-width: 1120px` media query, reset `position: static`, negative margins, `top`, and box shadow for the in-flow profile.

- [ ] **Step 5: Add the end-to-end scroll regression**

```ts
test("keeps the profile title opaque above its scrolling content", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Jupiter", exact: true }).click();
  const profile = page.getByRole("dialog", { name: "Jupiter profile" });
  const header = profile.getByTestId("profile-sticky-header");
  await profile.evaluate((element) => { element.scrollTop = 220; });
  await expect(header).toBeVisible();
  await expect(header).toHaveCSS("position", "sticky");
  await expect(header).toHaveCSS("background-color", "rgb(7, 20, 38)");
});
```

- [ ] **Step 6: Run focused tests**

Run: `npm test -- src/components/atlas/CelestialBodyPortrait.test.tsx src/components/atlas/ProfilePanel.test.tsx && npx playwright test e2e/atlas.spec.ts --grep "profile title opaque"`

Expected: PASS.

- [ ] **Step 7: Commit the profile feature**

```bash
git add src/components/atlas/CelestialBodyPortrait.tsx src/components/atlas/CelestialBodyPortrait.test.tsx src/components/atlas/ProfilePanel.tsx src/components/atlas/ProfilePanel.test.tsx src/app/globals.css e2e/atlas.spec.ts
git commit -m "feat: add sticky celestial profile portraits"
```

## Task 4: Complete validation and push committed feature work

**Files:**
- Modify only if a failing validation identifies a scoped defect in Tasks 1–3; commit that correction with the affected feature’s tests.

**Interfaces:**
- Consumes: all prior committed feature work.
- Produces: a verified branch pushed to `origin/main` without staging unrelated files.

- [ ] **Step 1: Run static and unit validation**

Run: `npm run lint && npm test`

Expected: both commands exit with status 0.

- [ ] **Step 2: Run browser and production validation**

Run: `npm run test:e2e && npm run build`

Expected: both commands exit with status 0.

- [ ] **Step 3: Inspect the exact commits and working tree before push**

Run: `git log --oneline origin/main..HEAD && git status --short`

Expected: the three feature commits are present; `.playwright-cli/` remains untracked and unstaged.

- [ ] **Step 4: Push the completed work**

Run: `git push origin main`

Expected: status 0 and remote `main` advances with the documentation and feature commits.

## Plan self-review

- Spec coverage: Task 1 covers free pan/orbit/wheel navigation, expanded zoom, selected-body focus, interruption, reduced motion, and presets. Task 2 covers deterministic local realistic surfaces, atmospheric presentation, and rear/globe/front Saturn rings. Task 3 covers the large profile astre, opaque sticky title and mobile behavior. Task 4 covers lint, unit, browser, build, and push validation.
- Placeholder scan: no placeholder, deferred, or unspecified test steps remain; all concrete implementation steps list files, symbols, commands, and expected results.
- Type consistency: `CameraFocusTransition`, `getFocusDistance`, `getCelestialPresentation`, `CelestialBodyPortrait`, and `profile-sticky-header` are defined before their consuming tasks and use consistent names throughout.
