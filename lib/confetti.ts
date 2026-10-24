/** Pure confetti physics, kept separate from the canvas so it can be tested. */

export type Piece = {
  x: number;
  y: number;
  /** px per second */
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  /** radians per second */
  spin: number;
  color: string;
  round: boolean;
};

/** Gold, parchment, forest green, gem teal and blood red: the site's own palette. */
export const CONFETTI_COLORS = [
  "#d9b765",
  "#f1e4bd",
  "#c8a45c",
  "#3a8449",
  "#3fd0c4",
  "#b84a5a",
  "#8d9cff",
];

export const CONFETTI_SECONDS = 3.6;
/** The last stretch of the animation over which pieces fade out. */
export const FADE_SECONDS = 0.7;

const GRAVITY = 1500;
const DRAG = 0.9;

/**
 * Two cannons, one at each side of the window, fire up and inwards.
 * `random` is injectable so tests are deterministic.
 */
export function spawnConfetti(
  width: number,
  height: number,
  count = 170,
  random: () => number = Math.random,
): Piece[] {
  const pieces: Piece[] = [];
  for (let i = 0; i < count; i++) {
    const fromLeft = i % 2 === 0;
    // Up-and-inwards, fanned by about 25 degrees either side of 60° from horizontal.
    const angle = ((60 + (random() - 0.5) * 50) * Math.PI) / 180;
    const speed = 750 + random() * 750;
    pieces.push({
      x: fromLeft ? 0 : width,
      y: height * 0.7,
      vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
      vy: -Math.sin(angle) * speed,
      width: 6 + random() * 6,
      height: 9 + random() * 9,
      rotation: random() * Math.PI * 2,
      spin: (random() - 0.5) * 16,
      color: CONFETTI_COLORS[Math.floor(random() * CONFETTI_COLORS.length)],
      round: random() < 0.25,
    });
  }
  return pieces;
}

/** Advance one piece by `seconds` (gravity plus air drag). */
export function stepPiece(piece: Piece, seconds: number): void {
  const damping = Math.exp(-DRAG * seconds);
  piece.vx *= damping;
  piece.vy = piece.vy * damping + GRAVITY * seconds;
  piece.x += piece.vx * seconds;
  piece.y += piece.vy * seconds;
  piece.rotation += piece.spin * seconds;
}

/** 1 until the fade starts, then falling to 0 at the end of the animation. */
export function confettiAlpha(elapsedSeconds: number): number {
  const fadeStart = CONFETTI_SECONDS - FADE_SECONDS;
  if (elapsedSeconds <= fadeStart) return 1;
  if (elapsedSeconds >= CONFETTI_SECONDS) return 0;
  return 1 - (elapsedSeconds - fadeStart) / FADE_SECONDS;
}
