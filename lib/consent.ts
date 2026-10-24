"use client";

import { useSyncExternalStore } from "react";
import { LONG_LIFETIME_SECONDS } from "./cookies";
import { createPersistedStore, rewriteAllCookies } from "./persistedStore";

/**
 * "accepted": progress cookies last up to a year, so streaks survive.
 * "declined": progress cookies are session-only and vanish when the browser closes.
 * "unset": not asked yet; treated like declined until the player chooses.
 */
export type ConsentState = "unset" | "accepted" | "declined";

/** The choice itself is always remembered, otherwise we would ask on every visit. */
const consentStore = createPersistedStore<ConsentState>({
  name: "poe2dle_consent",
  fallback: "unset",
  parse: (raw) => (raw === "accepted" || raw === "declined" ? raw : null),
  serialize: (value) => value,
  persist: () => true,
});

export const CONSENT_COOKIE_LIFETIME_DAYS = Math.round(
  LONG_LIFETIME_SECONDS / 86_400,
);

/** Whether progress cookies should be long-lived right now. */
export const persistsProgress = () => consentStore.getSnapshot() === "accepted";

export function setConsent(choice: Exclude<ConsentState, "unset">): void {
  consentStore.set(choice);
  rewriteAllCookies();
}

/** Current choice; null while rendering on the server or hydrating. */
export function useConsent(): ConsentState | null {
  return useSyncExternalStore(
    consentStore.subscribe,
    consentStore.getSnapshot,
    () => null,
  );
}

/** Event the footer dispatches to open the cookie settings dialog. */
export const OPEN_COOKIE_SETTINGS_EVENT = "poe2dle:open-cookie-settings";
