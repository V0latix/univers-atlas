import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { getBodyById } from "@/data/solar-system";

import { CelestialBodyMesh } from "./CelestialBodyMesh";

vi.mock("@react-three/fiber", () => ({ useFrame: () => undefined }));

const getBodyPosition = () => ({ x: 0, y: 0, z: 0 });
const simulationDaysRef = { current: 0 };

it("layers Saturn's rings behind and in front of the globe", () => {
  const { container, rerender } = render(
    <CelestialBodyMesh
      body={getBodyById("saturn")!}
      getBodyPosition={getBodyPosition}
      simulationDaysRef={simulationDaysRef}
    />,
  );

  const ringGeometries = container.querySelectorAll("ringGeometry");
  expect(ringGeometries).toHaveLength(2);
  expect(
    container.querySelector('[data-ring-layer="rear"]'),
  ).toBeInTheDocument();
  expect(
    container.querySelector('[data-ring-layer="front"]'),
  ).toHaveAttribute("renderOrder", "3");

  rerender(
    <CelestialBodyMesh
      body={getBodyById("earth")!}
      getBodyPosition={getBodyPosition}
      simulationDaysRef={simulationDaysRef}
    />,
  );

  expect(container.querySelector("ringGeometry")).not.toBeInTheDocument();
});
