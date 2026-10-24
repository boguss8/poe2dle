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

/** Clock value, or null during server render and hydration. */
const useClock = ({ subscribe, getSnapshot }: Clock): number | null =>
  useSyncExternalStore<number | null>(subscribe, getSnapshot, () => null);

/** Current time in whole seconds. */
export const useSeconds = () => useClock(secondClock);

/** Current UTC day number. */
export const useToday = () => useClock(dayClock);
