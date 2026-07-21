"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

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
      aria-label="Interactive Solar System scene"
      className="scene-canvas"
    >
      <Canvas
        gl={{ alpha: true }}
        camera={{ position: [0, 42, 70], fov: 48 }}
        tabIndex={0}
      >
        <AtlasScene />
      </Canvas>
    </section>
  );
}
