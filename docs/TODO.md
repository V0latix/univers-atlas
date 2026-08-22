# TODO — Univers Atlas

This roadmap tracks the scientific and product expansion planned after the
initial English Solar System release.

## Product improvements from the UX audit

### P0 — Foundation

- [x] Make French the default interface language while keeping a clear French / English switch. Interface copy is centralized and scientific numbers follow the chosen locale.
- [ ] Progressively translate the scientific profile prose, facts, and mission descriptions.
- [x] Replace the mobile catalogue placement with an expandable bottom explorer. It exposes the selected body, search, and the horizontal catalogue without forcing people to scroll past the scene first.

### P1 — Exploration clarity

- [x] Add scene labels, a conspicuous highlight for the selected body, and a compact help hint explaining orbit, zoom, and camera controls.
- [x] Add a camera reset action and filters for planets, moons, and orbital paths.
- [x] Restructure long profiles around an “Essential” summary, then expandable or tabbed sections for physical data and missions.
- [ ] Keep the pause control’s visible and accessible label in sync with its action: “Pause” when running, “Resume” when paused.

### P2 — Deeper learning and resilience

- [ ] Offer both a readable educational scale and a scientifically scaled view, with an explanation of the trade-off.
- [ ] Create guided journeys such as gas giants, Jupiter’s moons, habitable worlds, and landmark missions; consider short quizzes after the routes are established.
- [ ] Prepare rendering for catalogue growth: adaptive pixel ratio, level of detail, visibility-aware pausing, and lower-cost orbit rendering.
- [ ] Make browser-based end-to-end tests reproducible in CI by installing the Playwright browser as part of the pipeline.

### Audit limits to close before release

- [ ] Test the interaction model on a physical touch device.
- [ ] Run a screen-reader and keyboard audit after the explorer drawer and profile navigation are finalized.

## Next scientific coverage

- Add every natural satellite in the Solar System.
- Add the other components of the Solar System: dwarf planets, asteroids, comets, the Kuiper Belt, and the Oort Cloud.

## Simulation experience

- Add a scientifically scaled mode alongside the readable, visually optimised scale.
- Expand the representation beyond the Solar System: nearby stars, the Milky Way, then the observable universe.

## Internationalization

- Add French translations for the interface and scientific profiles after the initial English release.
