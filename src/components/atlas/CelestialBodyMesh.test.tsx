import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { getBodyById } from "@/data/solar-system";

import { CelestialBodyMesh } from "./CelestialBodyMesh";

vi.mock("@react-three/fiber", () => ({ useFrame: () => undefined }));
const presentationState = vi.hoisted(() => ({
  ringStyle: "actual" as "actual" | undefined,
}));
vi.mock("./celestial-presentation", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("./celestial-presentation")
  >();

  return {
    ...actual,
    getCelestialPresentation: (
      body: Parameters<typeof actual.getCelestialPresentation>[0],
    ) => {
      const presentation = actual.getCelestialPresentation(body);

      return {
        ...presentation,
        ringStyle:
          presentationState.ringStyle === "actual"
            ? presentation.ringStyle
            : undefined,
      };
    },
  };
});

const getBodyPosition = () => ({ x: 0, y: 0, z: 0 });
const simulationDaysRef = { current: 0 };

it("layers Saturn's rings behind and in front of the globe", () => {
  presentationState.ringStyle = "actual";
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

it("omits 3D rings when the presentation has no ring style", () => {
  presentationState.ringStyle = undefined;
  const { container } = render(
    <CelestialBodyMesh
      body={getBodyById("saturn")!}
      getBodyPosition={getBodyPosition}
      simulationDaysRef={simulationDaysRef}
    />,
  );

  expect(container.querySelector("ringGeometry")).not.toBeInTheDocument();
});
