"use client";

import { useSyncExternalStore } from "react";
import { DAY_MS } from "@/lib/games/skill/daily";

type Clock = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => number;
};

/**
 * Store whose snapshot is `Math.floor(Date.now() / unitMs)`, re-checked every
 * `pollMs`. Subscribers only re-render when the snapshot actually changes.
 */
function createClock(unitMs: number, pollMs: number): Clock {
  return {
    subscribe(onChange) {
      const id = window.setInterval(onChange, pollMs);
      return () => window.clearInterval(id);
    },
    getSnapshot: () => Math.floor(Date.now() / unitMs),
  };
}

const secondClock = createClock(1000, 1000);
const dayClock = createClock(DAY_MS, 15_000);

/** Current time in whole seconds; null during server render and hydration. */
export function useSeconds(): number | null {
  return useSyncExternalStore(
    secondClock.subscribe,
    secondClock.getSnapshot,
    () => null,
  );
}

/** Current UTC day number; null during server render and hydration. */
export function useToday(): number | null {
  return useSyncExternalStore(
    dayClock.subscribe,
    dayClock.getSnapshot,
    () => null,
  );
}
