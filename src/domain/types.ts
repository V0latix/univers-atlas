export type BodyKind = "star" | "planet" | "moon";
export type ViewMode = "3d" | "top" | "side";

export type CelestialBody = {
  id: string;
  name: string;
  kind: BodyKind;
  parentId?: string;
  color: string;
  radius: number;
  orbitRadius?: number;
  orbitalPeriodDays?: number;
  orbitalSpeedKmS?: number;
  rotation: string;
  diameterKm: number;
  gravityMs2?: number;
  meanTemperatureC?: number;
  composition: string;
  atmosphere?: string;
  distanceFromSunKm?: number;
  summary: string;
  notableFacts: string[];
  missions: string[];
  sourceName: string;
  sourceUrl: string;
};
