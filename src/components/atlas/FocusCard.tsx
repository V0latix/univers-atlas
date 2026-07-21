"use client";

import { ArrowUpRight } from "lucide-react";

import { getBodyById } from "@/data/solar-system";
import { useAtlasStore } from "@/store/atlas-store";

const valueWithUnit = (value: number | undefined, unit: string) =>
  value === undefined ? "Unavailable" : `${value.toLocaleString()} ${unit}`;

export function FocusCard() {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const setProfileOpen = useAtlasStore((state) => state.setProfileOpen);
  const isProfileOpen = useAtlasStore((state) => state.isProfileOpen);
  const selectedBody = getBodyById(selectedId);

  if (!selectedBody) return null;

  return (
    <section
      aria-label={`${selectedBody.name} focus`}
      aria-hidden={isProfileOpen}
      className="focus-card"
      hidden={isProfileOpen}
    >
      <div className="focus-card__heading">
        <p>{selectedBody.kind}</p>
        <h2>{selectedBody.name}</h2>
      </div>
      <p className="focus-card__summary">{selectedBody.summary}</p>
      <dl className="focus-facts">
        <div>
          <dt>Diameter</dt>
          <dd>{valueWithUnit(selectedBody.diameterKm, "km")}</dd>
        </div>
        <div>
          <dt>Temperature</dt>
          <dd>{valueWithUnit(selectedBody.temperatureC, "°C")}</dd>
        </div>
        <div>
          <dt>Orbit</dt>
          <dd>{valueWithUnit(selectedBody.orbitalPeriodDays, "days")}</dd>
        </div>
      </dl>
      <button
        id={`profile-trigger-${selectedBody.id}`}
        type="button"
        aria-label={`Open ${selectedBody.name} profile`}
        disabled={isProfileOpen}
        onClick={() => setProfileOpen(true)}
      >
        Open {selectedBody.name} profile
        <ArrowUpRight aria-hidden="true" />
      </button>
    </section>
  );
}
