"use client";

import { ArrowUpRight } from "lucide-react";

import { getBodyById } from "@/data/solar-system";
import { getAtlasCopy } from "@/i18n/atlas-copy";
import { formatNumber } from "@/lib/format-number";
import { useAtlasStore } from "@/store/atlas-store";

const valueWithUnit = (
  value: number | undefined,
  unit: string,
  locale: "fr" | "en",
  unavailable: string,
) =>
  value === undefined
    ? unavailable
    : `${formatNumber(value, locale)} ${unit}`;

export function FocusCard() {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const setProfileOpen = useAtlasStore((state) => state.setProfileOpen);
  const isProfileOpen = useAtlasStore((state) => state.isProfileOpen);
  const locale = useAtlasStore((state) => state.locale);
  const copy = getAtlasCopy(locale);
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
          <dt>{copy.diameter}</dt>
          <dd>{valueWithUnit(selectedBody.diameterKm, "km", locale, copy.unavailable)}</dd>
        </div>
        <div>
          <dt>{selectedBody.temperatureLabel}</dt>
          <dd>{valueWithUnit(selectedBody.temperatureC, "°C", locale, copy.unavailable)}</dd>
        </div>
        <div>
          <dt>{copy.orbitalPeriod}</dt>
          <dd>{valueWithUnit(selectedBody.orbitalPeriodDays, locale === "fr" ? "jours" : "days", locale, copy.unavailable)}</dd>
        </div>
      </dl>
      <button
        id={`profile-trigger-${selectedBody.id}`}
        type="button"
        aria-label={copy.openProfile(selectedBody.name)}
        disabled={isProfileOpen}
        onClick={() => setProfileOpen(true)}
      >
        {copy.openProfile(selectedBody.name)}
        <ArrowUpRight aria-hidden="true" />
      </button>
    </section>
  );
}
