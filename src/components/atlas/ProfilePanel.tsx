"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

import { getBodyById } from "@/data/solar-system";
import type { CelestialBody } from "@/domain/types";
import { formatNumber } from "@/lib/format-number";
import { useAtlasStore } from "@/store/atlas-store";

import { CelestialBodyPortrait } from "./CelestialBodyPortrait";

const withUnit = (value: number | undefined, unit: string) =>
  value === undefined ? "Data unavailable" : `${formatNumber(value)} ${unit}`;

const decimal = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);

const kilometresToAu = (kilometres: number | undefined) =>
  kilometres === undefined
    ? "Data unavailable"
    : decimal(kilometres / 149_597_870.7);

const daysToEarthYears = (days: number | undefined) =>
  days === undefined ? "Data unavailable" : decimal(days / 365.25);

const systemRole = (body: CelestialBody, parentName: string) =>
  body.kind === "star"
    ? "Central star"
    : body.kind === "moon"
      ? `Moon of ${parentName}`
      : "Primary planet";

const asReadableLabel = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

export function ProfilePanel() {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const isProfileOpen = useAtlasStore((state) => state.isProfileOpen);
  const setProfileOpen = useAtlasStore((state) => state.setProfileOpen);
  const selectedBody = getBodyById(selectedId);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const closeProfile = useCallback(() => {
    setProfileOpen(false);
    queueMicrotask(() => {
      const lastFocusedElement = lastFocusedElementRef.current;

      if (lastFocusedElement?.isConnected) {
        lastFocusedElement.focus();
      }
    });
  }, [setProfileOpen]);

  useEffect(() => {
    if (!isProfileOpen || !selectedBody) return;

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      lastFocusedElementRef.current = activeElement;
    }

    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeProfile();
      }
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closeProfile, isProfileOpen, selectedBody, selectedId]);

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
      <header className="profile-panel__header" data-testid="profile-sticky-header">
        <CelestialBodyPortrait body={selectedBody} />
        <div className="profile-panel__title">
          <span>{asReadableLabel(selectedBody.kind)}</span>
          <h2 id={titleId}>{selectedBody.name} profile</h2>
        </div>
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
          <dt>Radius</dt>
          <dd>
            {selectedBody.diameterKm === undefined
              ? "Data unavailable"
              : withUnit(selectedBody.diameterKm / 2, "km")}
          </dd>
        </div>
        <div>
          <dt>Orbital period</dt>
          <dd>
            {selectedBody.orbitalPeriodDays === undefined
              ? "Data unavailable"
              : `${withUnit(selectedBody.orbitalPeriodDays, "days")} (${daysToEarthYears(selectedBody.orbitalPeriodDays)} Earth years)`}
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
          <dt>Orbital velocity</dt>
          <dd>{withUnit(selectedBody.orbitalSpeedKmS, "km/s")}</dd>
        </div>
        <div>
          <dt>Distance from the Sun</dt>
          <dd>
            {selectedBody.distanceFromSunKm === undefined
              ? "Data unavailable"
              : `${withUnit(selectedBody.distanceFromSunKm, "km")} (${kilometresToAu(selectedBody.distanceFromSunKm)} AU)`}
          </dd>
        </div>
        <div>
          <dt>System role</dt>
          <dd>{systemRole(selectedBody, parentName)}</dd>
        </div>
        <div>
          <dt>Catalogue coverage</dt>
          <dd>
            {selectedBody.notableFacts.length} notable facts ·{" "}
            {selectedBody.missions.length} missions
          </dd>
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
