/** Minimal first-party cookie helpers. Safe to import on the server (they no-op). */

const SECONDS_PER_DAY = 86_400;

/** Browsers cap cookie lifetime at about 400 days. */
export const LONG_LIFETIME_SECONDS = 400 * SECONDS_PER_DAY;

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return null;
}

/**
 * Write a first-party cookie. Without `maxAgeSeconds` it is a session cookie
 * and disappears when the browser closes. `value` must only use cookie-safe
 * characters (no spaces, commas, semicolons or quotes).
 */
export function writeCookie(
  name: string,
  value: string,
  maxAgeSeconds?: number,
): void {
  if (typeof document === "undefined") return;
  const attributes = ["Path=/", "SameSite=Lax"];
  if (maxAgeSeconds !== undefined) attributes.push(`Max-Age=${maxAgeSeconds}`);
  if (window.location.protocol === "https:") attributes.push("Secure");
  document.cookie = `${name}=${value}; ${attributes.join("; ")}`;
}
