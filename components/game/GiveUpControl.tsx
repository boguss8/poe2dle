"use client";

import { useState } from "react";

/** "Stuck? Give up" link that asks for a second click before it reveals the answer. */
export default function GiveUpControl({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="link text-muted">
        Stuck? Give up
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center justify-end gap-x-3 text-muted">
      Reveal the answer and end today&apos;s game?
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          onConfirm();
        }}
        className="link font-bold !text-attr-str"
      >
        Yes, give up
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="link">
        Keep playing
      </button>
    </span>
  );
}
