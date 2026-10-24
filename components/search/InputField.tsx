"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SKILLS, searchSkills } from "@/lib/games/skill/pool";
import type { Skill } from "@/lib/games/skill/types";
import ItemList, { optionId } from "./ItemList";

type InputFieldProps = {
  guessedIds: ReadonlySet<string>;
  onGuess: (skill: Skill) => void;
};

export default function InputField({ guessedIds, onGuess }: InputFieldProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const matches = useMemo(
    () => searchSkills(query, SKILLS, guessedIds),
    [query, guessedIds],
  );
  const showList = open && query.trim() !== "";

  // Desktop only: a focused input on touch screens pops the keyboard open.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  const submit = (skill: Skill | undefined) => {
    if (!skill) {
      setShaking(true);
      return;
    }
    onGuess(skill);
    setQuery("");
    setOpen(false);
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setOpen(true);
        setActiveIndex((index) => Math.min(index + 1, matches.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        submit(matches[activeIndex] ?? matches[0]);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full">
      <div
        className={`flex gap-2 ${shaking ? "animate-shake" : ""}`}
        onAnimationEnd={() => setShaking(false)}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Guess a skill gem"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && matches.length > 0
              ? optionId(listId, activeIndex)
              : undefined
          }
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Type a skill name…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="field h-12 min-w-0 flex-1 text-lg"
        />
        <button
          type="button"
          onClick={() => submit(matches[activeIndex] ?? matches[0])}
          className="btn h-12"
        >
          Guess
        </button>
      </div>

      {showList ? (
        <ItemList
          id={listId}
          items={matches}
          activeIndex={activeIndex}
          onSelect={submit}
          onHover={setActiveIndex}
        />
      ) : null}
    </div>
  );
}
