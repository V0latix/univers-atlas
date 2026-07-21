"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

import { getBodyById } from "@/data/solar-system";
import { formatNumber } from "@/lib/format-number";
import { useAtlasStore } from "@/store/atlas-store";

const withUnit = (value: number | undefined, unit: string) =>
  value === undefined ? "Data unavailable" : `${formatNumber(value)} ${unit}`;

const asReadableLabel = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

export function ProfilePanel() {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const isProfileOpen = useAtlasStore((state) => state.isProfileOpen);
  const setProfileOpen = useAtlasStore((state) => state.setProfileOpen);
  const selectedBody = getBodyById(selectedId);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeProfile = useCallback(() => {
    setProfileOpen(false);
    queueMicrotask(() => {
      document.getElementById(`profile-trigger-${selectedId}`)?.focus();
    });
  }, [selectedId, setProfileOpen]);

  useEffect(() => {
    if (!isProfileOpen || !selectedBody) return;

    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeProfile();
      }
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closeProfile, isProfileOpen, selectedBody]);

  if (!isProfileOpen || !selectedBody) return null;

  const titleId = `${selectedBody.id}-profile-title`;
  const parentBody = selectedBody.parentId
    ? getBodyById(selectedBody.parentId)
    : undefined;
  const parentName = selectedBody.parentId
    ? (parentBody?.name ?? asReadableLabel(selectedBody.parentId))
    : "None";

  return (
    <aside
      role="dialog"
      aria-labelledby={titleId}
      className="profile-panel"
    >
      <header>
        <h2 id={titleId}>{selectedBody.name} profile</h2>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close profile"
          onClick={closeProfile}
        >
          <X aria-hidden="true" />
        </button>
      </header>

      <p>{selectedBody.summary}</p>

      <dl>
        <div>
          <dt>Classification</dt>
          <dd>{asReadableLabel(selectedBody.kind)}</dd>
        </div>
        <div>
          <dt>Parent body</dt>
          <dd>{parentName}</dd>
        </div>
        <div>
          <dt>Atmosphere</dt>
          <dd>{selectedBody.atmosphere ?? "Data unavailable"}</dd>
        </div>
        <div>
          <dt>Composition</dt>
          <dd>{selectedBody.composition}</dd>
        </div>
        <div>
          <dt>{selectedBody.temperatureLabel}</dt>
          <dd>{withUnit(selectedBody.temperatureC, "°C")}</dd>
        </div>
        <div>
          <dt>Rotation</dt>
          <dd>{selectedBody.rotation}</dd>
        </div>
        <div>
          <dt>Orbital period</dt>
          <dd>{withUnit(selectedBody.orbitalPeriodDays, "days")}</dd>
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
          <dt>Orbital velocity</dt>
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
