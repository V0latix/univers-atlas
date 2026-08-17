import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";

import type { CelestialBody } from "@/domain/types";
import { getAtlasCopy } from "@/i18n/atlas-copy";
import { formatNumber } from "@/lib/format-number";
import { useAtlasStore } from "@/store/atlas-store";

type CelestialBodyCardProps = {
  body: CelestialBody;
  selected: boolean;
  onSelect: (id: string) => void;
};

const gaseousBodyIds = new Set(["jupiter", "saturn", "uranus", "neptune"]);

const getContext = (body: CelestialBody, locale: "fr" | "en") => {
  const copy = getAtlasCopy(locale);

  return body.orbitalPeriodDays === undefined
    ? copy.solarSystemStar
    : copy.orbitDays(formatNumber(body.orbitalPeriodDays, locale));
};

export function CelestialBodyCard({
  body,
  selected,
  onSelect,
}: CelestialBodyCardProps) {
  const style = { "--body-color": body.color } as CSSProperties;
  const locale = useAtlasStore((state) => state.locale);
  const copy = getAtlasCopy(locale);

  return (
    <button
      type="button"
      className="body-card"
      aria-label={body.name}
      aria-pressed={selected}
      style={style}
      onClick={() => onSelect(body.id)}
    >
      <span className="body-card__visual">
        <span
          aria-hidden="true"
          className={
            "body-card__orb body-card__orb--" +
            body.kind +
            (gaseousBodyIds.has(body.id) ? " body-card__orb--gaseous" : "")
          }
        />
        {body.hasRings ? (
          <span className="body-card__rings" aria-label={body.name + " rings"} />
        ) : null}
      </span>
      <span className="body-card__content">
        <span className="body-card__kind">{copy.bodyKinds[body.kind]}</span>
        <strong>{body.name}</strong>
        <span className="body-card__meta">{getContext(body, locale)}</span>
      </span>
      <ArrowUpRight className="body-card__arrow" aria-hidden="true" size={16} />
    </button>
  );
}
