"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { openCookieSettings } from "@/lib/consent";
import { GAMES } from "@/lib/games/registry";
import { ISSUES_URL, REPO_URL } from "@/lib/site";
import { useOutsidePress } from "@/lib/useOutsidePress";

type HeaderProps = {
  activeGameId: string;
  onHelp: () => void;
  onStats: () => void;
};

function Menu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsidePress(ref, open, close);

  const item = "block w-full rounded-lg px-3 py-2 text-left hover:bg-white/10";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="icon-btn"
        aria-label="Menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </Icon>
      </button>
      {open ? (
        <div
          role="menu"
          className="card absolute right-0 top-full z-30 mt-2 w-52 p-1.5 text-sm font-bold shadow-[0_10px_30px_rgb(0_0_0/0.45)]"
        >
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              close();
              openCookieSettings();
            }}
          >
            Cookie settings
          </button>
          <a role="menuitem" className={item} href={REPO_URL} target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
          <a role="menuitem" className={item} href={ISSUES_URL} target="_blank" rel="noreferrer">
            Report a problem
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default function Header({ activeGameId, onHelp, onStats }: HeaderProps) {
  return (
    <header>
      <div className="topbar">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-3">
          <div className="flex justify-start">
            <button type="button" className="icon-btn" aria-label="How to play" onClick={onHelp}>
              <Icon>
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9.5a2.6 2.6 0 1 1 3.7 2.4c-.8.4-1.2 1-1.2 1.8M12 17h.01" />
              </Icon>
            </button>
          </div>

          <Link href="/" aria-label="PoE2dle home" className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
              <path d="M16 3l11 10-11 16L5 13z" fill="#c8a45c" />
              <path d="M16 3l11 10H5z" fill="#f1dca0" />
              <path d="M16 13v16L5 13z" fill="#8c6f35" />
            </svg>
            <h1 className="text-3xl font-bold tracking-tight text-heading">
              PoE<span className="text-accent">2</span>dle
            </h1>
          </Link>

          <div className="flex justify-end gap-2">
            <button type="button" className="icon-btn" aria-label="Statistics" onClick={onStats}>
              <Icon>
                <path d="M6 20V11M12 20V4M18 20v-6" />
              </Icon>
            </button>
            <Menu />
          </div>
        </div>
      </div>

      <nav aria-label="Games" className="flex justify-center px-3 pt-4">
        <ul className="pill-track">
          {GAMES.map((game) => (
            <li key={game.id}>
              {game.available ? (
                <Link
                  href={game.href}
                  aria-current={game.id === activeGameId ? "page" : undefined}
                  className="pill block"
                >
                  {game.title}
                </Link>
              ) : (
                <span aria-disabled="true" className="pill pill-off block">
                  {game.title} · soon
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
