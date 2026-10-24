import type { ReactNode } from "react";

/** Stroked 24x24 line icon; pass the paths as children. Decorative: always aria-hidden. */
export default function Icon({
  children,
  className = "h-5 w-5",
  strokeWidth = 2.2,
}: {
  children: ReactNode;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
