"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Orbit } from "lucide-react";
import { MOUSE } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { getAtlasCopy } from "@/i18n/atlas-copy";
import { useAtlasStore } from "@/store/atlas-store";

import { AtlasScene } from "./AtlasScene";

type SceneCanvasProps = {
  onWebglUnavailable: () => void;
};

export function canUseWebGL2() {
  if (typeof document === "undefined") {
    return false;
  }

  try {
    return document.createElement("canvas").getContext("webgl2") !== null;
  } catch {
    return false;
  }
}

export function SceneCanvas({ onWebglUnavailable }: SceneCanvasProps) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  const [focusRevision, setFocusRevision] = useState(0);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const locale = useAtlasStore((state) => state.locale);
  const copy = getAtlasCopy(locale);

  useEffect(() => {
    const available = canUseWebGL2();
    // This external capability is intentionally read only after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebglAvailable(available);

    if (!available) {
      onWebglUnavailable();
    }
  }, [onWebglUnavailable]);

  if (webglAvailable !== true) {
    return null;
  }

  return (
    <section
      aria-label={copy.sceneAriaLabel}
      className="scene-canvas"
    >
      <Canvas
        gl={{ alpha: true }}
        camera={{ position: [0, 42, 70], fov: 48 }}
        tabIndex={0}
      >
        <AtlasScene controlsRef={controlsRef} focusRevision={focusRevision} />
        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          mouseButtons={{
            LEFT: MOUSE.PAN,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE,
          }}
          minDistance={1.5}
          maxDistance={220}
          zoomSpeed={0.85}
          panSpeed={0.8}
          rotateSpeed={0.65}
          onStart={() => setFocusRevision((revision) => revision + 1)}
        />
      </Canvas>
      <aside aria-label={copy.sceneHelpLabel} className="scene-help">
        <Orbit aria-hidden="true" />
        <span>{copy.sceneHelp}</span>
      </aside>
    </section>
  );
}
