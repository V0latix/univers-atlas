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
      style={{
        background:
          "radial-gradient(ellipse at 18% 14%, rgb(36 84 137 / 52%) 0%, transparent 46%), radial-gradient(ellipse at 82% 78%, rgb(13 42 82 / 62%) 0%, transparent 54%), linear-gradient(145deg, #050918 0%, #07182e 52%, #02050d 100%)",
      }}
    >
      <Canvas gl={{ alpha: true }} camera={{ position: [0, 42, 70], fov: 48 }}>
        <AtlasScene />
      </Canvas>
    </section>
  );
}
