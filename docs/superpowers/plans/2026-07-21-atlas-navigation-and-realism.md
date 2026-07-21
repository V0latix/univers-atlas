# Atlas Navigation and Realism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every celestial-body selection open a live-updating detailed profile, enable natural camera navigation, and improve the scene’s scientific visual readability.

**Architecture:** A single store action couples user selection to profile opening. The camera is divided into a view-preset synchronizer and manual `OrbitControls`, while orbital position and path generation share an uncompressed plane. Body presentation data drives both card silhouettes and 3D details so rings are never inferred from a generic decorative orbit.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, Three.js, @react-three/fiber, @react-three/drei, Vitest, Testing Library.

## Global Constraints

- Do not add external textures, remote media, or dependencies.
- Keep the existing English scientific catalogue and use `Data unavailable` for absent values.
- Preserve the non-modal accessible profile dialog, Escape closing, and focus restoration after closing.
- Manual camera gestures must work with and without reduced-motion preferences.
- Planetary trajectories must be circular in the `x/z` plane; physical scale and true inclinations remain out of scope.
- Do not revert or rewrite unrelated existing user changes.

---

## File structure

- `src/store/atlas-store.ts` and `src/store/atlas-store.test.ts`: atomic selection that opens the profile.
- `src/domain/types.ts` and `src/data/solar-system.ts`: ring presentation metadata.
- `src/components/atlas/CelestialBodyCard.tsx` and its test: card thumbnail rings only when configured.
- `src/components/atlas/ExplorePanel.tsx`, `CelestialBodyMesh.tsx`, and `AtlasShell.tsx`: direct selection routes and compact-card removal.
- `src/components/atlas/ProfilePanel.tsx`, its test, and `src/app/globals.css`: richer profile data and readable layout.
- `src/components/atlas/AtlasScene.tsx`, `OrbitPath.tsx`, `SceneCanvas.tsx`, and their tests: circular paths and free camera controls.
- `e2e/atlas.spec.ts`: user-visible selection/profile regression test.

## Task 1: Open and update the detailed profile from every selection

**Files:**
- Modify: `src/store/atlas-store.ts`
- Modify: `src/store/atlas-store.test.ts`
- Modify: `src/components/atlas/ExplorePanel.tsx`
- Modify: `src/components/atlas/CelestialBodyMesh.tsx`
- Modify: `src/components/atlas/AtlasShell.tsx`
- Modify: `src/components/atlas/ProfilePanel.test.tsx`

**Interfaces:**
- Consumes: existing `selectedId` and `isProfileOpen` store fields.
- Produces: `selectAndOpenProfile(id: string): void`; all body-selection controls call it.

- [ ] **Step 1: Write failing store and component tests**

```tsx
it("opens the profile while selecting a body in one state transition", () => {
  useAtlasStore.getState().selectAndOpenProfile("titan");

  expect(useAtlasStore.getState()).toMatchObject({
    selectedId: "titan",
    isProfileOpen: true,
  });
});

it("keeps the profile open and replaces its content on a later selection", () => {
  useAtlasStore.getState().selectAndOpenProfile("titan");
  useAtlasStore.getState().selectAndOpenProfile("mars");

  expect(useAtlasStore.getState()).toMatchObject({
    selectedId: "mars",
    isProfileOpen: true,
  });
});

it("updates an already open profile after selecting another astre", () => {
  useAtlasStore.getState().selectAndOpenProfile("titan");
  render(<ProfilePanel />);
  act(() => useAtlasStore.getState().selectAndOpenProfile("mars"));

  expect(screen.getByRole("dialog", { name: "Mars profile" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/store/atlas-store.test.ts src/components/atlas/ProfilePanel.test.tsx`

Expected: FAIL because `selectAndOpenProfile` does not exist.

- [ ] **Step 3: Implement the atomic action and route user selection through it**

```ts
type AtlasState = {
  // existing fields
  selectAndOpenProfile: (id: string) => void;
};

selectAndOpenProfile: (selectedId) =>
  set({ selectedId, isProfileOpen: true }),
```

In both `ExplorePanel` and `CelestialBodyMesh`, replace the selected action
with `useAtlasStore((state) => state.selectAndOpenProfile)`. Pass it to each
card as `onSelect`, and call it in the mesh click handler. Remove the
`FocusCard` import and JSX from `AtlasShell`. Keep `selectBody` for
programmatic selection and catalogue reconciliation tests. Make the rendered
canvas focusable with `tabIndex={0}`. In `ProfilePanel`, keep a ref to the
currently focused `HTMLElement` whenever `isProfileOpen` or `selectedId`
changes; on close, focus that ref if it remains connected. This returns focus
to the last selected catalogue card or to the canvas after a scene selection,
without relying on the removed compact-card trigger.

- [ ] **Step 4: Run the affected tests**

Run: `npm test -- src/store/atlas-store.test.ts src/components/atlas/ExplorePanel.test.tsx src/components/atlas/ProfilePanel.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/atlas-store.ts src/store/atlas-store.test.ts src/components/atlas/ExplorePanel.tsx src/components/atlas/CelestialBodyMesh.tsx src/components/atlas/AtlasShell.tsx src/components/atlas/ProfilePanel.test.tsx
git commit -m "feat: open live profile when selecting bodies"
```

## Task 2: Extend detailed profile metrics from local data

**Files:**
- Modify: `src/components/atlas/ProfilePanel.tsx`
- Modify: `src/components/atlas/ProfilePanel.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `CelestialBody` fields and `formatNumber`.
- Produces: local `kilometresToAu`, `daysToEarthYears`, and `systemRole` display helpers.

- [ ] **Step 1: Write failing profile tests**

```tsx
expectProfileField("Radius", "2,575 km");
expectProfileField("Distance from the Sun", "1,426,666,422 km (9.54 AU)");
expectProfileField("Orbital period", "15.945 days (0.04 Earth years)");
expectProfileField("System role", "Moon of Saturn");
expectProfileField("Catalogue coverage", "2 notable facts · 3 missions");
```

- [ ] **Step 2: Run the profile test to verify failure**

Run: `npm test -- src/components/atlas/ProfilePanel.test.tsx`

Expected: FAIL because the new labels and values are absent.

- [ ] **Step 3: Add deterministic derived values**

```ts
const decimal = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);

const kilometresToAu = (kilometres: number | undefined) =>
  kilometres === undefined ? "Data unavailable" : decimal(kilometres / 149_597_870.7);

const daysToEarthYears = (days: number | undefined) =>
  days === undefined ? "Data unavailable" : decimal(days / 365.25);

const systemRole = (body: CelestialBody, parentName: string) =>
  body.kind === "star" ? "Central star" : body.kind === "moon" ? "Moon of " + parentName : "Primary planet";
```

Render `Radius`, parenthesized AU beside the existing kilometer distance,
parenthesized Earth years beside the existing orbit length, `System role`, and
`Catalogue coverage` in the existing description list. Use `Data unavailable`
when a source value is absent. Add wrapping rules to CSS so right-column values
do not overflow.

- [ ] **Step 4: Run the profile test**

Run: `npm test -- src/components/atlas/ProfilePanel.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/atlas/ProfilePanel.tsx src/components/atlas/ProfilePanel.test.tsx src/app/globals.css
git commit -m "feat: enrich celestial body profiles"
```

## Task 3: Make orbital geometry circular and camera navigation manual

**Files:**
- Modify: `src/components/atlas/AtlasScene.tsx`
- Modify: `src/components/atlas/OrbitPath.tsx`
- Modify: `src/components/atlas/SceneCanvas.tsx`
- Modify: `src/components/atlas/AtlasScene.test.ts`
- Modify: `src/components/atlas/SceneCanvas.test.tsx`

**Interfaces:**
- Consumes: `ViewMode`, current selected body, and Drei `OrbitControls`.
- Produces: circular `getSceneBodyPosition` coordinates and camera preset syncing only when the chosen view changes.

- [ ] **Step 1: Write failing orbit and controls tests**

```ts
it("does not compress orbit positions on the z axis", () => {
  const earth = solarSystem.find((body) => body.id === "earth")!;
  const days = earth.orbitalPeriodDays! / 4;
  expect(getSceneBodyPosition(earth, days).z).toBe(orbitalPosition(earth, days).z);
});
```

Mock `@react-three/drei` in `SceneCanvas.test.tsx`, then assert it receives
`enablePan`, `enableZoom`, `minDistance={8}`, and `maxDistance={150}`.

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- src/components/atlas/AtlasScene.test.ts src/components/atlas/SceneCanvas.test.tsx`

Expected: FAIL because z uses `0.82` and controls are not rendered.

- [ ] **Step 3: Implement shared circular geometry and controls**

Replace both `ORBIT_ECCENTRICITY = 0.82` constants with `ORBIT_ECCENTRICITY = 1`.
Remove the camera position lerp and `lookAt` calls from the simulation
`useFrame`; retain only the simulation time update and selected-body position
calculation.

Add a `CameraPreset` effect that runs solely when `viewMode` changes:

```tsx
useEffect(() => {
  const controls = controlsRef.current;
  if (!controls) return;
  const [x, y, z] = CAMERA_POSITIONS[viewMode];
  controls.object.position.set(x, y, z);
  controls.target.set(0, 0, 0);
  controls.update();
}, [controlsRef, viewMode]);
```

In `SceneCanvas`, create the controls ref and render:

```tsx
<OrbitControls
  ref={controlsRef}
  enablePan
  enableZoom
  enableRotate
  mouseButtons={{ LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE }}
  minDistance={8}
  maxDistance={150}
  zoomSpeed={0.85}
  panSpeed={0.8}
  rotateSpeed={0.65}
/>
```

Import `MOUSE` from `three` and pass that ref to `AtlasScene`. Do not set
`makeDefault` and do not mount a second controller. Wheel zoom is enabled;
left-drag pans through the system as requested, while right-drag rotates the
camera.

- [ ] **Step 4: Run regression tests**

Run: `npm test -- src/components/atlas/AtlasScene.test.ts src/components/atlas/SceneCanvas.test.tsx src/domain/orbits.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/atlas/AtlasScene.tsx src/components/atlas/OrbitPath.tsx src/components/atlas/SceneCanvas.tsx src/components/atlas/AtlasScene.test.ts src/components/atlas/SceneCanvas.test.tsx
git commit -m "feat: add free camera navigation to atlas"
```

## Task 4: Give bodies distinct procedural appearances

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/data/solar-system.ts`
- Modify: `src/components/atlas/CelestialBodyCard.tsx`
- Modify: `src/components/atlas/CelestialBodyCard.test.tsx`
- Modify: `src/components/atlas/CelestialBodyMesh.tsx`
- Create: `src/components/atlas/CelestialBodyMesh.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `CelestialBody.kind`, `CelestialBody.color`, and `CelestialBody.hasRings`.
- Produces: optional `hasRings?: boolean`, conditional card rings, and a conditional 3D ring mesh.

- [ ] **Step 1: Write failing card and mesh tests**

```tsx
render(<CelestialBodyCard body={getBodyById("saturn")!} selected={false} onSelect={vi.fn()} />);
expect(screen.getByLabelText("Saturn rings")).toBeInTheDocument();

render(<CelestialBodyCard body={getBodyById("earth")!} selected={false} onSelect={vi.fn()} />);
expect(screen.queryByLabelText("Earth rings")).not.toBeInTheDocument();
```

Mock `useFrame` in the new mesh test. Render Saturn and assert the tree has a
`ringGeometry`; render Earth and assert it does not.

- [ ] **Step 2: Run the focused tests to verify failure**

Run: `npm test -- src/components/atlas/CelestialBodyCard.test.tsx src/components/atlas/CelestialBodyMesh.test.tsx`

Expected: FAIL because all cards use the generic orbital decoration and no
presentation field exists.

- [ ] **Step 3: Implement metadata, conditional rings, and surface layers**

```ts
export type CelestialBody = {
  // existing fields
  hasRings?: boolean;
};

// Saturn entry in solar-system.ts
hasRings: true,
```

Make the card use a kind modifier plus optional ring span:

```tsx
<span className={"body-card__orb body-card__orb--" + body.kind} />
{body.hasRings ? <span className="body-card__rings" aria-label={body.name + " rings"} /> : null}
```

In `CelestialBodyMesh`, retain a standard-material base but choose roughness,
metalness, and emissive intensity by kind. Add a soft transparent atmosphere
shell to Earth, Venus, and Titan; latitudinal torus bands to Jupiter and Saturn;
and a conditional ring mesh:

```tsx
<mesh rotation={[-Math.PI / 2.6, 0, 0]}>
  <ringGeometry args={[body.radius * 1.35, body.radius * 2.25, 96]} />
  <meshBasicMaterial color="#d9c28a" transparent opacity={0.72} side={DoubleSide} depthWrite={false} />
</mesh>
```

Use only Three primitives and local colors. Delete the unconditional
`.body-card__orbit` rule; add an elliptical `.body-card__rings` rule and
rocky/gaseous thumbnail gradients.

- [ ] **Step 4: Run tests and lint**

Run: `npm test -- src/components/atlas/CelestialBodyCard.test.tsx src/components/atlas/CelestialBodyMesh.test.tsx && npm run lint`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/types.ts src/data/solar-system.ts src/components/atlas/CelestialBodyCard.tsx src/components/atlas/CelestialBodyCard.test.tsx src/components/atlas/CelestialBodyMesh.tsx src/components/atlas/CelestialBodyMesh.test.tsx src/app/globals.css
git commit -m "feat: distinguish celestial body appearances"
```

## Task 5: Strengthen contrast and complete verification

**Files:**
- Modify: `src/app/globals.css`
- Modify: `e2e/atlas.spec.ts` if the direct-profile assertion is not already present.

**Interfaces:**
- Consumes: existing scene and overlay classes.
- Produces: higher contrast without changing component APIs.

- [ ] **Step 1: Add direct-profile end-to-end coverage**

```ts
await page.getByRole("button", { name: "Titan" }).click();
await expect(page.getByRole("dialog", { name: "Titan profile" })).toBeVisible();
await page.getByRole("button", { name: "Mars" }).click();
await expect(page.getByRole("dialog", { name: "Mars profile" })).toBeVisible();
```

- [ ] **Step 2: Run the focused test**

Run: `npm run test:e2e -- --grep "profile"`

Expected: PASS after Task 1. If browser setup prevents it, record the exact
environmental failure and still complete unit, lint, and build verification.

- [ ] **Step 3: Apply bounded contrast adjustments**

```css
.scene-viewport {
  background:
    radial-gradient(circle at 49% 45%, rgb(50 122 214 / 23%), transparent 33%),
    radial-gradient(circle at 85% 4%, rgb(95 167 255 / 16%), transparent 35%),
    #020714;
}

.scene-viewport::before {
  background: linear-gradient(to bottom, rgb(1 3 9 / 4%) 36%, rgb(1 3 9 / 40%));
}

.profile-panel {
  border-color: rgb(174 215 255 / 52%);
  background: #071426;
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 56%);
}
```

Raise orbit-line opacity and cool light intensity only enough to retain clear
body silhouettes; check the desktop, 1120px, and 640px breakpoints.

- [ ] **Step 4: Run complete automated verification**

Run: `npm run lint && npm test && npm run build`

Expected: all commands exit 0.

- [ ] **Step 5: Validate manually and commit**

Run: `npm run dev`

Check the catalog and scene selections open/update the right profile; Escape
closes and a new selection reopens it; wheel zoom and drag gestures work; top
view orbits are round; only Saturn shows rings; bodies and overlays remain
readable at desktop, 1120px, and 640px.

```bash
git add src/app/globals.css e2e/atlas.spec.ts
git commit -m "style: improve atlas contrast and readability"
```
