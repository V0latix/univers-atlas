import type { CSSProperties } from "react";

import type { CelestialBody } from "@/domain/types";

import { getCelestialPresentation } from "./celestial-presentation";

export function CelestialBodyPortrait({ body }: { body: CelestialBody }): JSX.Element {
  const presentation = getCelestialPresentation(body);
  const style = { "--body-color": body.color } as CSSProperties;

  return (
    <div
      role="img"
      aria-label={`${body.name} illustration`}
      className={`celestial-portrait celestial-portrait--${presentation.surface} celestial-portrait--${presentation.ringStyle ?? "ringless"}`}
      style={style}
    >
      {presentation.ringStyle ? (
        <span
          className={`celestial-portrait__rings celestial-portrait__rings--${presentation.ringStyle}`}
          aria-label={`${body.name} rings`}
        />
      ) : null}
      <span className="celestial-portrait__globe" aria-hidden="true" />
    </div>
  );
}
