"use client";

import { Canvas } from "@react-three/fiber";
import { Component, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { AtlasScene } from "./AtlasScene";

type SceneCanvasProps = {
  onWebglUnavailable: () => void;
};

type CanvasErrorBoundaryProps = {
  children: ReactNode;
  onWebglUnavailable: () => void;
};

type CanvasErrorBoundaryState = {
  hasError: boolean;
};

class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onWebglUnavailable();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

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
  const [webglAvailable] = useState(() => canUseWebGL2());

  useEffect(() => {
    if (!webglAvailable) {
      onWebglUnavailable();
    }
  }, [onWebglUnavailable, webglAvailable]);

  if (!webglAvailable) {
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
      <CanvasErrorBoundary onWebglUnavailable={onWebglUnavailable}>
        <Canvas gl={{ alpha: true }} camera={{ position: [0, 42, 70], fov: 48 }}>
          <AtlasScene />
        </Canvas>
      </CanvasErrorBoundary>
    </section>
  );
}
