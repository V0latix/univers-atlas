export type VectorTuple = [number, number, number];

export type CameraFocusTransition = {
  startedAt: number;
  durationMs: 450;
  startPosition: VectorTuple;
  startTarget: VectorTuple;
  endPosition: VectorTuple;
  target: VectorTuple;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export const getFocusDistance = (radius: number) =>
  clamp((radius * 56) / 10, 4.5, 18);

export const easeOutCubic = (progress: number) =>
  1 - (1 - clamp(progress, 0, 1)) ** 3;

export function createFocusTransition({
  cameraPosition,
  currentTarget,
  bodyPosition,
  bodyRadius,
  startedAt,
}: {
  cameraPosition: VectorTuple;
  currentTarget: VectorTuple;
  bodyPosition: VectorTuple;
  bodyRadius: number;
  startedAt: number;
}): CameraFocusTransition {
  const direction = [
    cameraPosition[0] - currentTarget[0],
    cameraPosition[1] - currentTarget[1],
    cameraPosition[2] - currentTarget[2],
  ] as VectorTuple;
  const directionLength = Math.hypot(...direction) || 1;
  const focusDistance = getFocusDistance(bodyRadius);
  const normalizedDirection =
    directionLength === 1 && direction.every((value) => value === 0)
      ? ([0, 0.6, 0.8] as VectorTuple)
      : ([
        direction[0] / directionLength,
        direction[1] / directionLength,
        direction[2] / directionLength,
        ] as VectorTuple);

  return {
    startedAt,
    durationMs: 450,
    startPosition: cameraPosition,
    startTarget: currentTarget,
    endPosition: [
      bodyPosition[0] + normalizedDirection[0] * focusDistance,
      bodyPosition[1] + normalizedDirection[1] * focusDistance,
      bodyPosition[2] + normalizedDirection[2] * focusDistance,
    ],
    target: bodyPosition,
  };
}
