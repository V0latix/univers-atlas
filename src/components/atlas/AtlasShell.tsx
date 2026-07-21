"use client";

import { useCallback, useState } from "react";
import { Orbit } from "lucide-react";

import { solarSystem } from "@/data/solar-system";

import { ExplorePanel } from "./ExplorePanel";
import { FocusCard } from "./FocusCard";
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

  return (
    <main className="atlas-shell">
      <header className="atlas-topbar">
        <div className="atlas-brand">
          <span className="brand-mark" aria-hidden="true">
            <Orbit size={20} />
          </span>
          <div>
            <span className="eyebrow">Interactive planetary guide</span>
            <h1>Univers Atlas</h1>
          </div>
        </div>
        <div className="mission-status">
          <span className="status-dot" aria-hidden="true" />
          <span>
            <strong>Live simulation</strong>
            {solarSystem.length} tracked bodies
          </span>
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
        <FocusCard />
        <ViewControls />
      </div>
      <ExplorePanel />
      <ProfilePanel />
    </main>
  );
}
