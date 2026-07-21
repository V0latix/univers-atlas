import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";

import type { CelestialBody } from "@/domain/types";
import { formatNumber } from "@/lib/format-number";

type CelestialBodyCardProps = {
  body: CelestialBody;
  selected: boolean;
  onSelect: (id: string) => void;
};

const kindLabels = { star: "Star", planet: "Planet", moon: "Moon" } as const;
const gaseousBodyIds = new Set(["jupiter", "saturn", "uranus", "neptune"]);

const getContext = (body: CelestialBody) =>
  body.orbitalPeriodDays === undefined
    ? "Solar System star"
    : `${formatNumber(body.orbitalPeriodDays)} day orbit`;

export function CelestialBodyCard({
  body,
  selected,
  onSelect,
}: CelestialBodyCardProps) {
  const style = { "--body-color": body.color } as CSSProperties;

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
        <span className="body-card__kind">{kindLabels[body.kind]}</span>
        <strong>{body.name}</strong>
        <span className="body-card__meta">{getContext(body)}</span>
      </span>
      <ArrowUpRight className="body-card__arrow" aria-hidden="true" size={16} />
    </button>
  );
}
