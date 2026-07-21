"use client";

import { getBodyById } from "@/data/solar-system";
import { useAtlasStore } from "@/store/atlas-store";

const withUnit = (value: number | undefined, unit: string) =>
  value === undefined ? "Data unavailable" : `${value.toLocaleString()} ${unit}`;

export function ProfilePanel() {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const isProfileOpen = useAtlasStore((state) => state.isProfileOpen);
  const setProfileOpen = useAtlasStore((state) => state.setProfileOpen);
  const selectedBody = getBodyById(selectedId);

  if (!isProfileOpen || !selectedBody) return null;

  const titleId = `${selectedBody.id}-profile-title`;

  return (
    <aside role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header>
        <h2 id={titleId}>{selectedBody.name} profile</h2>
        <button
          type="button"
          aria-label="Close profile"
          onClick={() => setProfileOpen(false)}
        >
          Close
        </button>
      </header>

      <p>{selectedBody.summary}</p>

      <dl>
        <div>
          <dt>Composition</dt>
          <dd>{selectedBody.composition}</dd>
        </div>
        <div>
          <dt>Mean temperature</dt>
          <dd>{withUnit(selectedBody.meanTemperatureC, "°C")}</dd>
        </div>
        <div>
          <dt>Rotation</dt>
          <dd>{selectedBody.rotation}</dd>
        </div>
        <div>
          <dt>Orbital period</dt>
          <dd data-testid="orbital-period">
            {withUnit(selectedBody.orbitalPeriodDays, "days")}
          </dd>
        </div>
        <div>
          <dt>Diameter</dt>
          <dd>{withUnit(selectedBody.diameterKm, "km")}</dd>
        </div>
        <div>
          <dt>Surface gravity</dt>
          <dd>{withUnit(selectedBody.gravityMs2, "m/s²")}</dd>
        </div>
        <div>
          <dt>Orbital speed</dt>
          <dd>{withUnit(selectedBody.orbitalSpeedKmS, "km/s")}</dd>
        </div>
        <div>
          <dt>Distance from the Sun</dt>
          <dd>{withUnit(selectedBody.distanceFromSunKm, "km")}</dd>
        </div>
      </dl>

      <section aria-labelledby={`${selectedBody.id}-facts-title`}>
        <h3 id={`${selectedBody.id}-facts-title`}>Notable facts</h3>
        <ul>
          {selectedBody.notableFacts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={`${selectedBody.id}-missions-title`}>
        <h3 id={`${selectedBody.id}-missions-title`}>Missions</h3>
        <ul>
          {selectedBody.missions.map((mission) => (
            <li key={mission}>{mission}</li>
          ))}
        </ul>
      </section>

      <p>
        Source:{" "}
        <a href={selectedBody.sourceUrl}>{selectedBody.sourceName}</a>
      </p>
    </aside>
  );
}
