import type { GridPosition } from "@/types/agent";

export const TILE_WIDTH = 120;
export const TILE_HEIGHT = 60;

/**
 * Projects a grid coordinate to a 2:1 isometric screen offset.
 * Using 2D coordinate math (not CSS 3D transforms) keeps text/emoji undistorted.
 */
export function gridToScreen({ x, y }: GridPosition): { left: number; top: number } {
  return {
    left: (x - y) * (TILE_WIDTH / 2),
    top: (x + y) * (TILE_HEIGHT / 2),
  };
}
