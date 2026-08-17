"use client";

import { getAtlasCopy } from "@/i18n/atlas-copy";
import { useAtlasStore } from "@/store/atlas-store";

export function WebglFallback() {
  const locale = useAtlasStore((state) => state.locale);
  const copy = getAtlasCopy(locale);

  return (
    <section className="webgl-fallback" aria-label={copy.webglUnavailable}>
      <p>{copy.webglUnavailable}</p>
      <p>{copy.webglFallback}</p>
    </section>
  );
}
