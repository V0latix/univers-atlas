"use client";

import { useCallback, useEffect, useState } from "react";
import { Orbit } from "lucide-react";

import { solarSystem } from "@/data/solar-system";
import { getAtlasCopy, supportedLocales } from "@/i18n/atlas-copy";
import { useAtlasStore } from "@/store/atlas-store";

import { ExplorePanel } from "./ExplorePanel";
import { ProfilePanel } from "./ProfilePanel";
import { SceneCanvas } from "./SceneCanvas";
import { ViewControls } from "./ViewControls";
import { WebglFallback } from "./WebglFallback";

type AtlasShellProps = {
  forceWebglFallback?: boolean;
};

export function AtlasShell({ forceWebglFallback = false }: AtlasShellProps) {
  const [fallback, setFallback] = useState(forceWebglFallback);
  const showFallback = useCallback(() => setFallback(true), []);
  const locale = useAtlasStore((state) => state.locale);
  const setLocale = useAtlasStore((state) => state.setLocale);
  const copy = getAtlasCopy(locale);

  useEffect(() => {
    document.documentElement.lang = locale;

    try {
      const storage = window.localStorage;
      if (typeof storage?.getItem !== "function") return;
      const storedLocale = storage.getItem("univers-atlas-locale");

      if (
        (storedLocale === "fr" || storedLocale === "en") &&
        storedLocale !== locale
      ) {
        setLocale(storedLocale);
        return;
      }

      storage.setItem("univers-atlas-locale", locale);
    } catch {
      // Storage can be unavailable in private browsing or embedded previews.
    }
  }, [locale, setLocale]);

  return (
    <main className="atlas-shell">
      <header className="atlas-topbar">
        <div className="atlas-brand">
          <span className="brand-mark" aria-hidden="true">
            <Orbit size={20} />
          </span>
          <div>
            <span className="eyebrow">{copy.interactiveGuide}</span>
            <h1>Univers Atlas</h1>
          </div>
        </div>
        <div className="atlas-topbar__actions">
          <div className="mission-status">
            <span className="status-dot" aria-hidden="true" />
            <span>
              <strong>{copy.liveSimulation}</strong>
              {copy.trackedBodies(solarSystem.length)}
            </span>
          </div>
          <div className="language-switcher" role="group" aria-label={copy.language}>
            {supportedLocales.map((language) => (
              <button
                key={language}
                type="button"
                aria-pressed={locale === language}
                onClick={() => {
                  try {
                    window.localStorage.setItem("univers-atlas-locale", language);
                  } catch {
                    // The interface remains usable when storage is unavailable.
                  }
                  setLocale(language);
                }}
              >
                {copy.languages[language]}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="atlas-stage">
        <div className="scene-viewport">
          {fallback ? (
            <WebglFallback />
          ) : (
            <SceneCanvas onWebglUnavailable={showFallback} />
          )}
        </div>
        <ViewControls />
      </div>
      <ExplorePanel />
      <ProfilePanel />
    </main>
  );
}
