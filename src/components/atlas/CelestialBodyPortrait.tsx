import type { CSSProperties, ReactElement } from "react";

import type { CelestialBody } from "@/domain/types";
import { getAtlasCopy, type AtlasLocale } from "@/i18n/atlas-copy";

import { getCelestialPresentation } from "./celestial-presentation";

export function CelestialBodyPortrait({
  body,
  locale = "en",
}: {
  body: CelestialBody;
  locale?: AtlasLocale;
}): ReactElement {
  const presentation = getCelestialPresentation(body);
  const style = { "--body-color": body.color } as CSSProperties;
  const copy = getAtlasCopy(locale);

  return (
    <div
      role="img"
      aria-label={copy.illustration(body.name)}
      className={`celestial-portrait celestial-portrait--${presentation.surface} celestial-portrait--${presentation.ringStyle ?? "ringless"}`}
      style={style}
    >
      {presentation.ringStyle ? (
        <span
          className={`celestial-portrait__rings celestial-portrait__rings--${presentation.ringStyle}`}
          aria-label={copy.rings(body.name)}
          data-ring-layer="rear"
        />
      ) : null}
      <span className="celestial-portrait__globe" aria-hidden="true" />
      {presentation.ringStyle ? (
        <span
          aria-hidden="true"
          className={`celestial-portrait__rings celestial-portrait__rings--${presentation.ringStyle} celestial-portrait__rings--front`}
          data-ring-layer="front"
        />
      ) : null}
    </div>
  );
}
