# Univers Atlas — Design Specification

**Date:** 2026-07-21  
**Repository:** `univers-atlas` (public)  
**Initial scope:** interactive Solar System atlas in English

## Purpose

Univers Atlas is a public, browser-based exploration of the Solar System. It combines an immersive 3D scene with clear scientific profiles, so a broad audience can discover celestial bodies while still finding useful physical and orbital information.

The first release deliberately focuses on the Solar System and a curated selection of its best-known natural satellites. Broader astronomical scope is tracked in `docs/TODO.md` rather than included in this release.

## Experience and navigation

The application opens on a live Solar System scene. Its proportions and orbital spacing are intentionally optimised for clarity and beauty rather than scientific scale. A later scientific-scale mode is explicitly deferred.

- The central canvas displays the Sun, eight planets, orbital paths, and the selected set of major natural satellites.
- The background is a deep, calm spatial gradient with soft light halos. It contains no repeating field of small white points.
- A left-hand Explore panel offers search and a short curated object list. Searching or selecting an object moves the camera to it with a smooth guided transition.
- Users can choose 3D, top-down, or side views from persistent controls. They do not need expert 3D manipulation to explore the scene.
- A persistent time control pauses, resumes, and changes the simulation rate. The default acceleration is readable rather than physically literal.
- Selecting an object shows a compact focus card; opening it reveals the full scientific profile.

On smaller screens, the explore panel and profile become overlays or full-page panels, leaving the scene usable behind them.

## Scientific profiles

Every included object has a consistent, English-language profile adapted to its kind: star, planet, or natural satellite.

The profile includes:

- Classification and relationship to its parent body, where relevant.
- A concise, accessible summary.
- Composition, atmosphere, mean temperature, diameter, surface gravity, and rotation.
- Orbital period, orbital velocity, and relevant distances (to the Sun, Earth, or parent body).
- Notable features, known satellites when applicable, and exploration missions.
- Clear units and links or citations for the scientific source data.

The initial satellite set will prioritise recognisable bodies, including the Moon, Phobos, Deimos, the Galilean moons, Titan, Enceladus, Mimas, Iapetus, Triton, and Charon. The full population is a future milestone.

## Architecture

The app is a Next.js application written in TypeScript.

- **Scene module:** a React Three Fiber / Three.js scene renders celestial objects, their simplified orbital motion, and the camera.
- **Catalog module:** local, versioned data defines object identity, display properties, physical facts, orbital parameters, and sources. The first release does not rely on a runtime API.
- **Simulation module:** converts a simulation timestamp and time multiplier into visually coherent object positions. It exposes a small interface consumed by the scene and controls.
- **Navigation state:** holds the selected object, current camera mode, profile visibility, and time controls. It is independent of the rendering internals.
- **UI module:** search, view controls, time controls, focus card, and profile panel use the catalog and navigation state rather than reaching into the scene.

This separation lets the catalog expand without rewiring the interface, and lets the rendering implementation evolve without changing the data model.

## Data flow

1. The catalog loads with the application.
2. The simulation clock derives positions from each object’s simplified orbit.
3. Search or a scene selection updates navigation state with an object identifier.
4. The camera controller focuses the selected object, while the UI reads the same identifier for the focus card and profile.
5. Profile data is rendered from the catalog, including its citations.

## Reliability and accessibility

- If WebGL is unavailable, the app displays an accessible non-3D fallback where object profiles remain searchable and readable.
- Missing optional data is represented deliberately in the profile instead of rendering blank or misleading values.
- Search, profile opening, view selection, and time controls are keyboard-accessible and labelled for assistive technologies.
- The visual interface respects reduced-motion preferences by reducing camera and panel transitions.

## Testing and verification

- Unit tests cover catalog validation, search matching, and simplified orbital-position calculations.
- Component tests cover search results, profile rendering, view controls, and time controls.
- End-to-end tests cover loading the atlas, finding Titan, focusing it, opening its profile, and changing the view and time rate.
- Production verification covers a responsive manual pass, the WebGL fallback, and a Vercel production build.

## Delivery

The local project lives at `/Users/romain/dev/univers-atlas`. It will have a Git repository linked to the user’s public GitHub repository named `univers-atlas`, then be deployed to Vercel’s free tier after implementation and verification.

## Explicitly deferred

- French language support.
- Scientifically scaled distances and sizes.
- Every natural satellite and all minor Solar System bodies.
- Expansion beyond the Solar System.
