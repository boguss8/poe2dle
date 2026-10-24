import { describe, expect, it } from "vitest";
import {
  CONFETTI_COLORS,
  CONFETTI_SECONDS,
  confettiAlpha,
  spawnConfetti,
  stepPiece,
} from "./confetti";

/** Deterministic "random" sequence. */
const sequence = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe("spawnConfetti", () => {
  it("fires the requested number of pieces from both sides, up and inwards", () => {
    const pieces = spawnConfetti(1000, 800, 40, sequence([0.1, 0.5, 0.9]));
    expect(pieces).toHaveLength(40);
    const left = pieces.filter((piece) => piece.x === 0);
    const right = pieces.filter((piece) => piece.x === 1000);
    expect(left.length).toBe(20);
    expect(right.length).toBe(20);
    for (const piece of left) expect(piece.vx).toBeGreaterThan(0);
    for (const piece of right) expect(piece.vx).toBeLessThan(0);
    for (const piece of pieces) {
      expect(piece.vy).toBeLessThan(0);
      expect(piece.y).toBe(800 * 0.7);
      expect(CONFETTI_COLORS).toContain(piece.color);
    }
  });
});

describe("stepPiece", () => {
  it("pulls pieces down over time and slows their sideways speed", () => {
    const [piece] = spawnConfetti(1000, 800, 1, sequence([0.5]));
    const startVx = piece.vx;
    const startVy = piece.vy;
    for (let i = 0; i < 60; i++) stepPiece(piece, 1 / 60);
    expect(Math.abs(piece.vx)).toBeLessThan(Math.abs(startVx));
    expect(piece.vy).toBeGreaterThan(startVy);
  });

  it("eventually falls below the window", () => {
    const [piece] = spawnConfetti(1000, 800, 1, sequence([0.5]));
    for (let i = 0; i < 60 * CONFETTI_SECONDS; i++) stepPiece(piece, 1 / 60);
    expect(piece.y).toBeGreaterThan(800);
  });
});

describe("confettiAlpha", () => {
  it("is opaque, then fades to nothing by the end", () => {
    expect(confettiAlpha(0)).toBe(1);
    expect(confettiAlpha(CONFETTI_SECONDS - 1)).toBe(1);
    expect(confettiAlpha(CONFETTI_SECONDS - 0.35)).toBeCloseTo(0.5, 1);
    expect(confettiAlpha(CONFETTI_SECONDS)).toBe(0);
    expect(confettiAlpha(CONFETTI_SECONDS + 5)).toBe(0);
  });
});
