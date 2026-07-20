"use client";

import { Canvas } from "@react-three/fiber";

import { AtlasScene } from "./AtlasScene";

type SceneCanvasProps = {
  onWebglUnavailable: () => void;
};

export function SceneCanvas({ onWebglUnavailable }: SceneCanvasProps) {
  return (
    <section aria-label="Interactive Solar System scene" className="scene-canvas">
      <Canvas
        camera={{ position: [0, 42, 70], fov: 48 }}
        onCreated={({ gl }) => {
          if (!gl.capabilities.isWebGL2) {
            onWebglUnavailable();
          }
        }}
      >
        <AtlasScene />
      </Canvas>
    </section>
  );
}
