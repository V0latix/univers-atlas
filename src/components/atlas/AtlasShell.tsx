"use client";

import { useCallback, useState } from "react";

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
      <header className="atlas-brand">
        <p>Interactive planetary guide</p>
        <h1>Univers Atlas</h1>
      </header>
      <ExplorePanel />
      {fallback ? (
        <WebglFallback />
      ) : (
        <SceneCanvas onWebglUnavailable={showFallback} />
      )}
      <ViewControls />
      <FocusCard />
      <ProfilePanel />
    </main>
  );
}
