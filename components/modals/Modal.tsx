"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** Accessible dialog on top of the native <dialog> (focus trap, Esc, inert page). */
export default function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="card m-auto max-h-[88vh] w-[min(92vw,36rem)] overflow-y-auto p-0 text-foreground shadow-2xl"
    >
      <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-4">
        <h2 id={titleId} className="text-xl font-bold text-heading">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="icon-btn !h-9 !w-9 !bg-deep"
        >
          <Icon className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" />
          </Icon>
        </button>
      </div>
      <div className="px-5 pb-5">{children}</div>
    </dialog>
  );
}
