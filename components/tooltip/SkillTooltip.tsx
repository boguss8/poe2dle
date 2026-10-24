"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ensureDetailsLoaded, useSkillDetails } from "@/lib/games/skill/details";
import type { Skill } from "@/lib/games/skill/types";
import SkillTooltipCard from "./SkillTooltipCard";

const GAP = 10;
const MARGIN = 8;

/**
 * Put the popup beside the anchor: to its right if there is room, else its
 * left, else above/below. It is scaled down when taller than the window so the
 * whole tooltip stays visible.
 */
function place(node: HTMLDivElement | null, anchor: HTMLElement | null): void {
  if (!node || !anchor) return;
  const a = anchor.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;

  const scale = Math.min(1, (viewportHeight - 2 * MARGIN) / node.offsetHeight);
  const width = node.offsetWidth * scale;
  const height = node.offsetHeight * scale;

  let left = a.right + GAP;
  let top = a.top;
  if (left + width > viewportWidth - MARGIN) left = a.left - width - GAP;
  if (left < MARGIN) {
    // Not enough room on either side (phones): sit above or below the anchor.
    left = Math.min(Math.max(MARGIN, a.left), viewportWidth - width - MARGIN);
    top =
      a.bottom + GAP + height <= viewportHeight - MARGIN
        ? a.bottom + GAP
        : a.top - height - GAP;
  }
  top = Math.min(Math.max(MARGIN, top), Math.max(MARGIN, viewportHeight - height - MARGIN));

  node.style.transformOrigin = "top left";
  node.style.transform = scale < 1 ? `scale(${scale})` : "";
  node.style.left = `${Math.max(MARGIN, left)}px`;
  node.style.top = `${top}px`;
  node.style.visibility = "visible";
}

type SkillTooltipProps = {
  skill: Skill;
  className?: string;
  /** Reachable with Tab so keyboard users can read it too. Off inside listboxes. */
  focusable?: boolean;
  /**
   * Element to show the tooltip beside. Defaults to the wrapped content; a
   * suggestion list passes the whole list so the tooltip never covers it.
   */
  anchor?: () => HTMLElement | null;
  children: ReactNode;
};

/**
 * Wraps anything that stands for a skill. Hover (mouse), focus (keyboard) or
 * tap (touch) shows the full in-game style tooltip next to it.
 */
export default function SkillTooltip({
  skill,
  className,
  focusable = true,
  anchor,
  children,
}: SkillTooltipProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef("mouse");
  const [open, setOpen] = useState(false);
  const details = useSkillDetails(skill.id);
  const tooltipId = useId();

  const show = () => {
    ensureDetailsLoaded();
    setOpen(true);
  };

  // A tap outside closes a tooltip that was opened by touch.
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div
      ref={triggerRef}
      tabIndex={focusable ? 0 : undefined}
      aria-describedby={open ? tooltipId : undefined}
      className={className}
      onPointerDown={(event) => {
        lastPointer.current = event.pointerType;
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") show();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setOpen(false);
      }}
      onFocus={show}
      onBlur={() => setOpen(false)}
      onClick={() => {
        if (lastPointer.current === "touch") {
          if (open) setOpen(false);
          else show();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      {children}
      {open
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              ref={(node) => place(node, anchor?.() ?? triggerRef.current)}
              className="pointer-events-none fixed z-[70]"
              style={{ visibility: "hidden", left: 0, top: 0 }}
            >
              <SkillTooltipCard skill={skill} details={details} />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
