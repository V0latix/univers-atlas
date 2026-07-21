import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

import type { CelestialBody } from "@/domain/types";

export type SurfaceStyle =
  | "solar-granulation"
  | "terrestrial-clouds"
  | "gas-bands"
  | "cratered-rock"
  | "hazy-clouds"
  | "ice-giant";
export type RingStyle = "icy-bands";

const atmosphereColors: Record<string, string> = {
  earth: "#8ed7ff",
  venus: "#f4d48c",
  titan: "#e59c4d",
};

export const getCelestialPresentation = (body: CelestialBody): {
  surface: SurfaceStyle;
  atmosphereColor: string | undefined;
  ringStyle: RingStyle | undefined;
} => ({
  surface:
    body.id === "sun"
      ? "solar-granulation"
      : body.id === "earth"
        ? "terrestrial-clouds"
        : ["jupiter", "saturn"].includes(body.id)
          ? "gas-bands"
          : ["venus", "titan"].includes(body.id)
            ? "hazy-clouds"
            : ["uranus", "neptune"].includes(body.id)
              ? "ice-giant"
              : "cratered-rock",
  atmosphereColor: atmosphereColors[body.id],
  ringStyle: body.hasRings ? "icy-bands" : undefined,
});

function seededRandom(seedText: string) {
  let seed = 2166136261;
  for (const character of seedText) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  }

  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function drawCircle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function drawClouds(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 38; index += 1) {
    context.fillStyle = `rgba(255, 255, 255, ${0.16 + random() * 0.26})`;
    context.beginPath();
    context.ellipse(
      random() * 256,
      random() * 128,
      8 + random() * 22,
      2 + random() * 5,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
}

function drawGasBands(
  context: CanvasRenderingContext2D,
  random: () => number,
  body: CelestialBody,
) {
  const colors =
    body.id === "jupiter"
      ? ["#d8ad7f", "#9f6047", "#f1d2a1", "#76503e"]
      : ["#f2d59d", "#c99f6e", "#e6c285", "#ab8058"];
  for (let y = 0; y < 128; y += 8) {
    context.fillStyle = colors[Math.floor(random() * colors.length)]!;
    context.globalAlpha = 0.34 + random() * 0.3;
    context.fillRect(0, y, 256, 3 + random() * 8);
  }
  context.globalAlpha = 0.55;
  if (body.id === "jupiter") {
    context.fillStyle = "#a55139";
    context.beginPath();
    context.ellipse(182, 78, 18, 7, -0.1, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}

function drawCraters(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 45; index += 1) {
    const x = random() * 256;
    const y = random() * 128;
    const radius = 1 + random() * 7;
    drawCircle(context, x + radius * 0.25, y + radius * 0.25, radius, "rgba(40, 34, 31, 0.3)");
    drawCircle(context, x, y, radius * 0.86, "rgba(220, 210, 190, 0.16)");
  }
}

function drawGranulation(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 180; index += 1) {
    drawCircle(
      context,
      random() * 256,
      random() * 128,
      1 + random() * 5,
      random() > 0.5 ? "rgba(255, 238, 160, 0.36)" : "rgba(224, 102, 35, 0.3)",
    );
  }
}

function drawHaze(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 26; index += 1) {
    context.fillStyle = `rgba(255, 238, 190, ${0.08 + random() * 0.2})`;
    context.fillRect(0, random() * 128, 256, 5 + random() * 14);
  }
}

function drawIceBands(context: CanvasRenderingContext2D, random: () => number) {
  for (let y = 0; y < 128; y += 10) {
    context.fillStyle = random() > 0.5 ? "rgba(154, 224, 243, 0.25)" : "rgba(64, 139, 194, 0.2)";
    context.fillRect(0, y, 256, 5 + random() * 8);
  }
}

export function createSurfaceTexture(
  body: CelestialBody,
): CanvasTexture | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context =
    typeof CanvasRenderingContext2D === "undefined"
      ? null
      : canvas.getContext("2d");
  if (context) {
    const random = seededRandom(body.id);
    const presentation = getCelestialPresentation(body);
    context.fillStyle = body.color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    switch (presentation.surface) {
      case "solar-granulation":
        drawGranulation(context, random);
        break;
      case "terrestrial-clouds":
        drawClouds(context, random);
        break;
      case "gas-bands":
        drawGasBands(context, random, body);
        break;
      case "cratered-rock":
        drawCraters(context, random);
        break;
      case "hazy-clouds":
        drawHaze(context, random);
        break;
      case "ice-giant":
        drawIceBands(context, random);
        break;
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function disposeSurfaceTexture(texture: CanvasTexture | undefined): void {
  texture?.dispose();
}
