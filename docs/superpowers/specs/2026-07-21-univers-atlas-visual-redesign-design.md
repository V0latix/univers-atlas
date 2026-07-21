# Univers Atlas — Immersive Cockpit Visual Redesign

**Date:** 2026-07-21
**Repository:** `univers-atlas`
**Scope:** visual and interaction redesign of the existing Solar System atlas

## Purpose

The current interface makes the celestial-body catalog look like a uniform list
of text buttons. Individual bodies are difficult to recognize, the selected
state lacks emphasis, and the panels compete visually with the 3D scene.

This redesign turns the application into an immersive exploration cockpit. The
3D Solar System remains the main attraction, while the catalog becomes a clear,
visual navigation surface with distinct celestial-body cards.

The scientific catalog, orbital simulation, and existing profile content remain
unchanged.

## Experience principles

- **Immersive, not theatrical:** use depth, light, and restrained motion to
  suggest a spatial observatory without compromising legibility.
- **Bodies are recognizable:** every catalog item has a visual identity, useful
  metadata, and a strong selected state.
- **The scene stays central:** navigation and controls support the 3D view rather
  than visually enclosing it in equally weighted panels.
- **Calm technical precision:** typography and labels evoke an exploration
  instrument, avoiding a neon gaming aesthetic.
- **Responsive by composition:** desktop and mobile keep the same information
  hierarchy while adapting their navigation patterns.

## Desktop composition

The desktop application uses three visual layers:

1. A compact top bar contains the Univers Atlas identity, an understated
   simulation status, and short exploration context.
2. A left navigation rail contains search and a vertically scrollable catalog
   of celestial-body cards.
3. The 3D scene fills the remaining main area. A compact selected-body card
   floats over its lower-right corner, and a lightweight control bar floats near
   the bottom edge.

The full scientific profile remains a distinct panel or dialog above the scene.
It uses the same visual system but keeps enough space and contrast for longer
reading.

## Celestial-body cards

Each catalog result is a card rather than a plain text button. A card contains:

- A decorative, body-specific visual derived from catalog display colors.
- The body name and classification.
- One short contextual datum, chosen consistently from existing catalog data.
- A visible selected indicator and reinforced border/background treatment.

Cards use the existing body identifier and selection action. They do not own or
duplicate navigation state. The selected item stays visually identifiable and
should be brought into the visible scroll area when selection changes outside
the catalog.

Search continues to filter locally as the user types. When no bodies match, the
panel renders an explicit empty state instead of an empty list.

## Visual language

The interface uses a near-black blue foundation with layered radial light,
subtle atmospheric texture, and restrained translucent surfaces. Panels use
dark glass rather than pale transparency, with fine cool borders and soft
shadowing to separate them from the scene.

The primary accent is an ice blue. Celestial bodies retain individual display
colors so their cards are distinguishable at a glance. Bright accents are
reserved for focus, selection, and active controls.

Typography has a clear hierarchy:

- Expressive, tightly spaced titles for the product and selected body.
- Neutral, readable body copy.
- Small uppercase technical labels with generous tracking for metadata.

Icons supplement view, pause, speed, search, and profile actions. Text or
accessible names remain available so meaning never depends on an icon alone.

## Selected-body summary and controls

The compact focus card remains the bridge between scene selection and the full
profile. It presents the selected body's name, type, summary, and a concise set
of existing key facts before the profile action.

View mode, pause, and speed controls retain their existing store actions. Their
new presentation emphasizes active state, groups related actions, and keeps the
control bar visually lighter than the catalog and focus card. Icon buttons have
accessible names and tooltips where their visible text is shortened.

## Mobile composition

On small screens, the scene appears first and remains the primary viewport. The
catalog becomes a horizontal, touch-friendly card strip rather than a tall
panel. Search remains easy to reach without permanently reducing the scene.

The selected-body summary follows the scene and the full profile opens as a
full-width reading panel. Controls wrap or compact without requiring horizontal
page scrolling. Touch targets meet a minimum practical size of approximately
44 pixels.

## Components and data flow

The redesign keeps the existing application boundaries:

1. `ExplorePanel` reads the current query, filters the local catalog, and renders
   a dedicated celestial-body card for each result.
2. Each card receives body data, selected state, and the existing selection
   callback. It contains no independent application state.
3. `FocusCard`, `ViewControls`, and `ProfilePanel` continue reading from the
   Zustand store and the local catalog.
4. `SceneCanvas` and `AtlasScene` continue reacting to the same selected body,
   view mode, and simulation state.

Small presentational components may be introduced for the body thumbnail,
status indicator, and icon control. The orbital domain logic and scientific
data schema are out of scope.

## Accessibility and resilience

- Existing keyboard navigation, semantic regions, dialog behavior, labels, and
  focus restoration remain intact.
- Selected cards expose their current state semantically as well as visually.
- Text and critical controls maintain strong contrast against translucent
  surfaces.
- Motion remains short and calm, and `prefers-reduced-motion` removes nonessential
  transitions.
- The WebGL fallback remains fully usable and is restyled to match the cockpit.
- Missing optional scientific values continue to use explicit unavailable-data
  text rather than blanks.

## Testing and verification

Automated component coverage will verify:

- Celestial-body cards render body names and contextual metadata.
- Selecting a card updates its visible and semantic selected state.
- Search filtering still works and displays a useful empty state.
- Focus-card, profile, view, pause, and speed interactions retain their behavior.

The existing unit and end-to-end suites must continue passing. A production
build and responsive browser pass will verify desktop, tablet, and mobile
composition, overflow behavior, contrast, WebGL fallback styling, and reduced
motion behavior.

## Explicitly out of scope

- Changes to orbital calculations, camera behavior, or simulation timing.
- New scientific bodies or new catalog fields.
- Photorealistic image assets or network-fetched media.
- Localization or changes to the existing English scientific content.
- Deployment changes.
