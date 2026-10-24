"use client";

import { useEffect, type RefObject } from "react";

/**
 * While `active`, call `onDismiss` when the user presses anywhere outside
 * `ref`, and (unless `escape` is false) when they press Escape.
 */
export function useOutsidePress(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void,
  escape = true,
): void {
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    if (escape) document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, active, onDismiss, escape]);
}
