"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/modals/Modal";
import {
  CONSENT_COOKIE_LIFETIME_DAYS,
  OPEN_COOKIE_SETTINGS_EVENT,
  setConsent,
  useConsent,
} from "@/lib/consent";
import { COOKIES } from "@/lib/cookieCatalog";

/** Cookie notice shown on the first visit, plus the settings dialog behind the footer link. */
export default function CookieConsent() {
  const consent = useConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
  }, []);

  if (consent === null) return null;

  const choose = (choice: "accepted" | "declined") => {
    setConsent(choice);
    setSettingsOpen(false);
  };

  return (
    <>
      {consent === "unset" ? (
        <section
          aria-label="Cookie notice"
          className="card animate-fade-up fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl shadow-[0_10px_40px_rgb(0_0_0/0.5)]"
        >
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm leading-snug">
              <strong>Cookies.</strong>{" "}
              PoE2dle uses first-party cookies to remember today&apos;s guesses
              and your streak. No ads, no tracking, nothing shared with third
              parties.{" "}
              <button type="button" className="link" onClick={() => setSettingsOpen(true)}>
                Details
              </button>
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" className="btn" onClick={() => choose("accepted")}>
                Accept
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => choose("declined")}>
                Session only
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Cookie settings"
      >
        <div className="space-y-4">
          <p>
            PoE2dle sets a few first-party cookies so your daily game works. They
            never leave this site, and there are no analytics, advertising or
            third-party cookies.
          </p>
          <ul className="space-y-2">
            {Object.values(COOKIES).map((cookie) => (
              <li key={cookie.name} className="card-deep px-3 py-2">
                <code className="text-sm font-bold">{cookie.name}</code>
                <p className="text-sm text-muted">{cookie.purpose}</p>
              </li>
            ))}
          </ul>
          <p>
            <strong>Accept</strong> keeps them for up to {CONSENT_COOKIE_LIFETIME_DAYS}{" "}
            days so your streak and statistics survive between visits.{" "}
            <strong>Session only</strong> deletes your progress when you close
            the browser — your streak will not carry over.
          </p>
          <p className="text-sm text-muted">
            Current choice:{" "}
            <span className="font-bold text-foreground">
              {consent === "accepted"
                ? "Accepted"
                : consent === "declined"
                  ? "Session only"
                  : "Not chosen yet (session only until you accept)"}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={() => choose("accepted")}>
              Accept
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => choose("declined")}>
              Session only
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
