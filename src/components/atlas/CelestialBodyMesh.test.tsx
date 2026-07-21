import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { getBodyById } from "@/data/solar-system";

import { CelestialBodyMesh } from "./CelestialBodyMesh";

vi.mock("@react-three/fiber", () => ({ useFrame: () => undefined }));

const getBodyPosition = () => ({ x: 0, y: 0, z: 0 });
const simulationDaysRef = { current: 0 };

it("renders a ring geometry only for Saturn", () => {
  const { container, rerender } = render(
    <CelestialBodyMesh
      body={getBodyById("saturn")!}
      getBodyPosition={getBodyPosition}
      simulationDaysRef={simulationDaysRef}
    />,
  );

  expect(container.querySelector("ringGeometry")).toBeInTheDocument();

  rerender(
    <CelestialBodyMesh
      body={getBodyById("earth")!}
      getBodyPosition={getBodyPosition}
      simulationDaysRef={simulationDaysRef}
    />,
  );

  expect(container.querySelector("ringGeometry")).not.toBeInTheDocument();
});
