"use client";

import { OPEN_COOKIE_SETTINGS_EVENT } from "@/lib/consent";

/** Footer link that reopens the cookie settings dialog. */
export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="link"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
    >
      Cookie settings
    </button>
  );
}
