"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

import { getBodyById } from "@/data/solar-system";
import type { CelestialBody } from "@/domain/types";
import { getAtlasCopy, type AtlasLocale } from "@/i18n/atlas-copy";
import { formatDecimal, formatNumber } from "@/lib/format-number";
import { useAtlasStore } from "@/store/atlas-store";

import { CelestialBodyPortrait } from "./CelestialBodyPortrait";

const withUnit = (
  value: number | undefined,
  unit: string,
  locale: AtlasLocale,
  unavailable: string,
) =>
  value === undefined
    ? unavailable
    : `${formatNumber(value, locale)} ${unit}`;

const kilometresToAu = (
  kilometres: number | undefined,
  locale: AtlasLocale,
  unavailable: string,
) =>
  kilometres === undefined
    ? unavailable
    : formatDecimal(kilometres / 149_597_870.7, locale);

const daysToEarthYears = (
  days: number | undefined,
  locale: AtlasLocale,
  unavailable: string,
) =>
  days === undefined ? unavailable : formatDecimal(days / 365.25, locale);

const systemRole = (
  body: CelestialBody,
  parentName: string,
  locale: AtlasLocale,
) => {
  const copy = getAtlasCopy(locale);

  return body.kind === "star"
    ? copy.centralStar
    : body.kind === "moon"
      ? copy.moonOf(parentName)
      : copy.primaryPlanet;
};

export function ProfilePanel() {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const isProfileOpen = useAtlasStore((state) => state.isProfileOpen);
  const setProfileOpen = useAtlasStore((state) => state.setProfileOpen);
  const locale = useAtlasStore((state) => state.locale);
  const copy = getAtlasCopy(locale);
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
    ? (parentBody?.name ?? selectedBody.parentId)
    : locale === "fr"
      ? "Aucun"
      : "None";

  return (
    <aside
      role="dialog"
      aria-labelledby={titleId}
      className="profile-panel"
    >
      <header className="profile-panel__header" data-testid="profile-sticky-header">
        <CelestialBodyPortrait body={selectedBody} locale={locale} />
        <div className="profile-panel__title">
          <span>{copy.bodyKinds[selectedBody.kind]}</span>
          <h2 id={titleId}>{copy.profile(selectedBody.name)}</h2>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label={copy.closeProfile}
          onClick={closeProfile}
        >
          <X aria-hidden="true" />
        </button>
      </header>

      <section aria-labelledby={`${selectedBody.id}-essential-title`} className="profile-essential">
        <h3 id={`${selectedBody.id}-essential-title`}>{copy.essential}</h3>
        <p>{selectedBody.summary}</p>
        <dl className="profile-essential__facts">
          <div>
            <dt>{copy.classification}</dt>
            <dd>{copy.bodyKinds[selectedBody.kind]}</dd>
          </div>
          <div>
            <dt>{selectedBody.temperatureLabel}</dt>
            <dd>{withUnit(selectedBody.temperatureC, "°C", locale, copy.unavailable)}</dd>
          </div>
          <div>
            <dt>{copy.diameter}</dt>
            <dd>{withUnit(selectedBody.diameterKm, "km", locale, copy.unavailable)}</dd>
          </div>
          <div>
            <dt>{copy.orbitalPeriod}</dt>
            <dd>
              {selectedBody.orbitalPeriodDays === undefined
                ? copy.unavailable
                : `${withUnit(selectedBody.orbitalPeriodDays, locale === "fr" ? "jours" : "days", locale, copy.unavailable)} (${copy.earthYears(daysToEarthYears(selectedBody.orbitalPeriodDays, locale, copy.unavailable))})`}
            </dd>
          </div>
        </dl>
      </section>

      <details className="profile-details" open>
        <summary>{copy.physicalData}</summary>
        <dl>
          <div>
            <dt>{copy.parentBody}</dt>
            <dd>{parentName}</dd>
          </div>
          <div>
            <dt>{copy.atmosphere}</dt>
            <dd>{selectedBody.atmosphere ?? copy.unavailable}</dd>
          </div>
          <div>
            <dt>{copy.composition}</dt>
            <dd>{selectedBody.composition}</dd>
          </div>
          <div>
            <dt>{copy.rotation}</dt>
            <dd>{selectedBody.rotation}</dd>
          </div>
          <div>
            <dt>{copy.radius}</dt>
            <dd>
              {selectedBody.diameterKm === undefined
                ? copy.unavailable
                : withUnit(selectedBody.diameterKm / 2, "km", locale, copy.unavailable)}
            </dd>
          </div>
          <div>
            <dt>{copy.surfaceGravity}</dt>
            <dd>{withUnit(selectedBody.gravityMs2, "m/s²", locale, copy.unavailable)}</dd>
          </div>
          <div>
            <dt>{copy.orbitalVelocity}</dt>
            <dd>{withUnit(selectedBody.orbitalSpeedKmS, "km/s", locale, copy.unavailable)}</dd>
          </div>
          <div>
            <dt>{copy.distanceFromSun}</dt>
            <dd>
              {selectedBody.distanceFromSunKm === undefined
                ? copy.unavailable
                : `${withUnit(selectedBody.distanceFromSunKm, "km", locale, copy.unavailable)} (${kilometresToAu(selectedBody.distanceFromSunKm, locale, copy.unavailable)} AU)`}
            </dd>
          </div>
          <div>
            <dt>{copy.systemRole}</dt>
            <dd>{systemRole(selectedBody, parentName, locale)}</dd>
          </div>
        </dl>
      </details>

      <details className="profile-details">
        <summary>{copy.missionsAndFacts}</summary>
        <section aria-labelledby={`${selectedBody.id}-facts-title`}>
          <h3 id={`${selectedBody.id}-facts-title`}>{copy.notableFacts}</h3>
          <ul>
            {selectedBody.notableFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby={`${selectedBody.id}-missions-title`}>
          <h3 id={`${selectedBody.id}-missions-title`}>{copy.missions}</h3>
          <ul>
            {selectedBody.missions.map((mission) => (
              <li key={mission}>{mission}</li>
            ))}
          </ul>
        </section>
        <p className="profile-details__coverage">
          {copy.catalogueCoverage}: {copy.notableAndMissions(selectedBody.notableFacts.length, selectedBody.missions.length)}
        </p>
      </details>

      <p className="profile-panel__source">
        {copy.source}:{" "}
        <a href={selectedBody.sourceUrl}>{selectedBody.sourceName}</a>
      </p>
    </aside>
  );
}
