// Shared geometry, unchanged from the original browser simulation.
export const AIM_OFFSET = 0.2;
export const MUZZLE_OFFSET = 0.85;
export const HIT_RADIUS = 0.35;

export function canAimForward(col: number, enemyX: number): boolean {
  return enemyX > col + AIM_OFFSET;
}

/** A fresh right-moving projectile cannot hit behind its starting tolerance. */
export function canReachForward(col: number, enemyX: number): boolean {
  return (
    canAimForward(col, enemyX) && enemyX >= col + MUZZLE_OFFSET - HIT_RADIUS
  );
}
