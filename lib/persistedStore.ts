import { LONG_LIFETIME_SECONDS, readCookie, writeCookie } from "./cookies";

/**
 * A tiny external store backed by one first-party cookie, shaped for
 * useSyncExternalStore. Falls back to memory when cookies are blocked.
 */
export type PersistedStore<T> = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
};

type Options<T> = {
  /** Cookie name. */
  name: string;
  fallback: T;
  /** Return the parsed value, or null when the cookie content is unusable. */
  parse: (raw: string) => T | null;
  /** Encode with cookie-safe characters only. */
  serialize: (value: T) => string;
  /** Long-lived cookie when true, session cookie when false. */
  persist: () => boolean;
};

const stores = new Set<{ rewrite: () => void }>();

/** Re-write every store's cookie so a changed `persist()` takes effect. */
export function rewriteAllCookies(): void {
  stores.forEach((store) => store.rewrite());
}

export function createPersistedStore<T>({
  name,
  fallback,
  parse,
  serialize,
  persist,
}: Options<T>): PersistedStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;
  // Set once cookies turn out to be unusable; the value then lives in memory.
  let memoryOnly = false;
  let hasValue = false;

  const notify = () => listeners.forEach((listener) => listener());

  const lifetime = () => (persist() ? LONG_LIFETIME_SECONDS : undefined);

  const read = (): T => {
    if (memoryOnly) return cachedValue;
    const raw = readCookie(name);
    // Keep the same object while the cookie is unchanged: React compares
    // snapshots with Object.is.
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = (raw === null ? null : parse(raw)) ?? fallback;
    hasValue = raw !== null;
    return cachedValue;
  };

  const store: PersistedStore<T> = {
    subscribe(onChange) {
      listeners.add(onChange);
      // Cookies have no change event: re-check when the tab regains attention.
      const onVisible = () => {
        if (document.visibilityState === "visible") onChange();
      };
      window.addEventListener("focus", onChange);
      document.addEventListener("visibilitychange", onVisible);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("focus", onChange);
        document.removeEventListener("visibilitychange", onVisible);
      };
    },
    getSnapshot: read,
    getServerSnapshot: () => fallback,
    set(value) {
      cachedValue = value;
      hasValue = true;
      const raw = serialize(value);
      writeCookie(name, raw, lifetime());
      // Reading back detects blocked cookies.
      if (readCookie(name) === raw) {
        cachedRaw = raw;
      } else {
        memoryOnly = true;
      }
      notify();
    },
  };

  stores.add({
    rewrite: () => {
      if (!hasValue || memoryOnly) return;
      writeCookie(name, serialize(read()), lifetime());
    },
  });

  return store;
}
