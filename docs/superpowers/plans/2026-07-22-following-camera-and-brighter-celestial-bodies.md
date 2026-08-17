# Following Camera and Brighter Celestial Bodies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the selected astre centered while it moves and make all celestial bodies brighter without flattening surface detail.

**Architecture:** `SelectedBodyFocus` will retain the focused camera-to-target vector when its existing 450 ms transition completes, then apply it to the astre's current simulated position on every frame. Existing revision signals remain the cancellation boundary. Scene lights and per-kind material emission are exported constants, which lets tests lock in the illumination balance.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js, @react-three/fiber, Zustand, Vitest, Testing Library.

## Global Constraints

- Do not add dependencies, remote assets, new astronomical data, or runtime network calls.
- Preserve the current 450 ms transition, focus distance, reduced-motion behavior, orbit model, controls, and cancellation on a manual control start or view preset.
- Keep the astre centered after the transition by preserving the camera offset relative to its live position.
- Raise environmental illumination and retain only moderate planet/moon emission; keep star emission stronger and surface textures legible.
- Make one commit per completed feature and never stage the user-owned `.playwright-cli/` directory.

---

## File structure

- Modify `src/components/atlas/AtlasScene.tsx`: retain and apply a post-transition camera offset; expose scene-light constants.
- Modify `src/components/atlas/AtlasScene.test.ts`: regression-test post-transition tracking and scene-light constants.
- Modify `src/components/atlas/CelestialBodyMesh.tsx`: expose brighter per-kind material settings.
- Modify `src/components/atlas/CelestialBodyMesh.test.tsx`: regression-test material brightness settings.

### Task 1: Make selected-astre focus track live orbital movement

**Files:**
- Modify: `src/components/atlas/AtlasScene.tsx:161-255`
- Modify: `src/components/atlas/AtlasScene.test.ts:100-171`

**Interfaces:**
- Consumes: `getFocusTarget(body, simulationDays)`, `CameraFocusTransition`, `OrbitControls.object.position`, and `OrbitControls.target`.
- Produces: automatic focus that keeps `controls.object.position - controls.target` constant after the transition, until an existing cancellation revision changes.

- [ ] **Step 1: Write the failing regression test**

Add this test after the existing interpolation test:

```tsx
it("keeps the camera centered on an astre after its focus transition", () => {
  const earth = solarSystem.find((body) => body.id === "earth")!;
  const { controls, controlsRef } = createControls();
  useAtlasStore.getState().setTimeMultiplier(365);

  render(createElement(AtlasScene, { controlsRef, focusRevision: 0 }));
  vi.mocked(Date.now).mockReturnValue(1_450);
  act(() => runLatestFrame(0.5));
  const cameraOffset = controls.object.position.clone().sub(controls.target);

  vi.mocked(Date.now).mockReturnValue(1_550);
  act(() => runLatestFrame(0.5));

  const livePosition = getSceneBodyPosition(earth, 365);
  expect(controls.target.toArray()).toEqual([
    livePosition.x,
    livePosition.y,
    livePosition.z,
  ]);
  expect(controls.object.position.clone().sub(controls.target)).toEqual(
    cameraOffset,
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/atlas/AtlasScene.test.ts`

Expected: FAIL because the focus controller clears its transition and no longer updates the controls after 450 ms.

- [ ] **Step 3: Implement the minimum tracking state**

In `SelectedBodyFocus`, add `trackingOffsetRef` next to `transitionRef`, reset it for a new selection or cancellation revision, and retain the final offset at the end of the existing transition:

```ts
const trackingOffsetRef = useRef<VectorTuple | null>(null);

// When progress reaches 1:
trackingOffsetRef.current = focusOffset;
transitionRef.current = null;
```

After the transition branch, update controls when that offset is set:

```ts
const trackingOffset = trackingOffsetRef.current;
if (!trackingOffset || !controls || !selectedBody) return;

const liveTarget = getVectorTuple(
  getFocusTarget(selectedBody, simulationDaysRef.current),
);
controls.object.position.set(
  liveTarget[0] + trackingOffset[0],
  liveTarget[1] + trackingOffset[1],
  liveTarget[2] + trackingOffset[2],
);
controls.target.set(...liveTarget);
controls.update();
```

For reduced motion, store `transition.endPosition - transition.target` before returning so immediate focus follows as well. Keep interpolation unchanged until it completes.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm test -- src/components/atlas/AtlasScene.test.ts src/components/atlas/camera-focus.test.ts src/components/atlas/SceneCanvas.test.tsx`

Expected: PASS with new tracking plus existing cancellation/focus tests green.

- [ ] **Step 5: Commit the camera feature**

```bash
git add src/components/atlas/AtlasScene.tsx src/components/atlas/AtlasScene.test.ts
git commit -m "feat: follow selected astres with the camera"
```

### Task 2: Increase celestial illumination while preserving contrast

**Files:**
- Modify: `src/components/atlas/AtlasScene.tsx:22-30,275-277`
- Modify: `src/components/atlas/AtlasScene.test.ts:1-180`
- Modify: `src/components/atlas/CelestialBodyMesh.tsx:24-28`
- Modify: `src/components/atlas/CelestialBodyMesh.test.tsx:1-80`

**Interfaces:**
- Produces: exported `sceneLighting` and `surfaceMaterials` constants; their values are consumed by light and material props.

- [ ] **Step 1: Write failing brightness assertions**

Export `sceneLighting` and `surfaceMaterials`, then add:

```ts
it("uses brighter balanced illumination for the scene", () => {
  expect(sceneLighting.ambient).toBeGreaterThan(0.24);
  expect(sceneLighting.fill).toBeGreaterThan(0.38);
  expect(sceneLighting.sun).toBeGreaterThan(4.5);
});

it("gives planets and moons a visible but restrained emission lift", () => {
  expect(surfaceMaterials.planet.emissiveIntensity).toBeGreaterThan(0.05);
  expect(surfaceMaterials.moon.emissiveIntensity).toBeGreaterThan(0.015);
  expect(surfaceMaterials.star.emissiveIntensity).toBeGreaterThan(
    surfaceMaterials.planet.emissiveIntensity,
  );
});
```

- [ ] **Step 2: Run the brightness tests to verify they fail**

Run: `npm test -- src/components/atlas/AtlasScene.test.ts src/components/atlas/CelestialBodyMesh.test.tsx`

Expected: FAIL because the values are not exported and the old illumination remains.

- [ ] **Step 3: Implement balanced brighter values**

Define and use this constant in `AtlasScene.tsx`:

```ts
export const sceneLighting = {
  ambient: 0.42,
  fill: 0.62,
  sun: 5.8,
} as const;
```

In `CelestialBodyMesh.tsx`, export the material map and use:

```ts
export const surfaceMaterials = {
  star: { roughness: 0.4, metalness: 0.04, emissiveIntensity: 1.85 },
  planet: { roughness: 0.62, metalness: 0.06, emissiveIntensity: 0.13 },
  moon: { roughness: 0.9, metalness: 0, emissiveIntensity: 0.06 },
} as const;
```

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `npm test -- src/components/atlas/AtlasScene.test.ts src/components/atlas/CelestialBodyMesh.test.tsx`

Expected: PASS with tracking, cancellation, and brightness assertions green.

- [ ] **Step 5: Commit the brightness feature**

```bash
git add src/components/atlas/AtlasScene.tsx src/components/atlas/AtlasScene.test.ts src/components/atlas/CelestialBodyMesh.tsx src/components/atlas/CelestialBodyMesh.test.tsx
git commit -m "feat: brighten celestial bodies"
```

### Task 3: Verify and publish the two feature commits

**Files:**
- Verify only: the four files above.

- [ ] **Step 1: Run static checks and unit suite**

Run: `npm run lint && npm test`

Expected: exit code 0 with no lint errors and all Vitest tests passing.

- [ ] **Step 2: Run production build and browser regression suite**

Run: `npm run build && npm run test:e2e`

Expected: both commands exit 0.

- [ ] **Step 3: Inspect committed scope before push**

Run: `git status --short && git log --oneline -3`

Expected: only the pre-existing untracked `.playwright-cli/` is shown; two feature commits are present and no user-owned files are staged.

- [ ] **Step 4: Push the current branch**

Run: `git push origin main`

Expected: remote accepts the specification commit and the two feature commits.

