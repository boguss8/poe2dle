"use client";

import { useEffect, useRef } from "react";
import {
  CONFETTI_SECONDS,
  confettiAlpha,
  spawnConfetti,
  stepPiece,
} from "@/lib/confetti";

type ConfettiProps = {
  /** Wait this long before firing, e.g. until the last tile has flipped. */
  delayMs?: number;
};

/** One-off confetti burst over the whole window. Skipped for reduced-motion users. */
export default function Confetti({ delayMs = 0 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let frame = 0;
    let started = 0;
    let last = 0;

    const timer = window.setTimeout(() => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.scale(dpr, dpr);
      const pieces = spawnConfetti(width, height);

      const tick = (now: number) => {
        started ||= now;
        const elapsed = (now - started) / 1000;
        // Cap the step so a background tab doesn't teleport the pieces.
        const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
        last = now;

        context.clearRect(0, 0, width, height);
        if (elapsed >= CONFETTI_SECONDS) return;

        context.globalAlpha = confettiAlpha(elapsed);
        for (const piece of pieces) {
          stepPiece(piece, dt);
          context.save();
          context.translate(piece.x, piece.y);
          context.rotate(piece.rotation);
          context.fillStyle = piece.color;
          if (piece.round) {
            context.beginPath();
            context.arc(0, 0, piece.width / 2, 0, Math.PI * 2);
            context.fill();
          } else {
            context.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
          }
          context.restore();
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [delayMs]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] h-full w-full"
    />
  );
}
