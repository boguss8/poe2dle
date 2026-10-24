"use client";

import { openCookieSettings } from "@/lib/consent";

/** Footer link that reopens the cookie settings dialog. */
export default function CookieSettingsButton() {
  return (
    <button type="button" className="link" onClick={openCookieSettings}>
      Cookie settings
    </button>
  );
}
