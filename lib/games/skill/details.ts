"use client";

import { useSyncExternalStore } from "react";
import type { SkillDetails } from "./types";

type DetailsMap = Record<string, SkillDetails>;

/*
 * Tooltip content is ~340 KB, so it is split into its own chunk and only
 * fetched the first time somebody hovers a skill.
 */
let loaded: DetailsMap | null = null;
let loading = false;
const listeners = new Set<() => void>();

export function ensureDetailsLoaded(): void {
  if (loaded || loading) return;
  loading = true;
  import("@/data/skill_details.json")
    .then((module) => {
      loaded = module.default as unknown as DetailsMap;
      listeners.forEach((listener) => listener());
    })
    .catch(() => {
      loading = false; // try again on the next hover
    });
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Tooltip data for one skill; null until the chunk has loaded. */
export function useSkillDetails(id: string): SkillDetails | null {
  const map = useSyncExternalStore(subscribe, () => loaded, () => null);
  return map?.[id] ?? null;
}
