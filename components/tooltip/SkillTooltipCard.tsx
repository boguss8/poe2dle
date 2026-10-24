import { Fragment, type ReactNode } from "react";
import type { Skill, SkillDetails } from "@/lib/games/skill/types";

/** Render RePoE text: ⟦keyword⟧ is underlined, "\n" breaks the line. */
function GameText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 ? <br /> : null}
          {line.split(/(⟦[^⟧]+⟧)/).map((part, index) =>
            part.startsWith("⟦") ? (
              <span key={index} className="poe-kw">
                {part.slice(1, -1)}
              </span>
            ) : (
              <Fragment key={index}>{part}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p>
      <span className="poe-label">{label}: </span>
      <span className="poe-value">{children}</span>
    </p>
  );
}

const sec = (seconds: number) => `${seconds.toFixed(2)} sec`;

type SkillTooltipCardProps = {
  skill: Skill;
  details: SkillDetails | null;
  className?: string;
  /** The item class / metadata id box. Hover tooltips show it, the win screen does not. */
  showMetadata?: boolean;
};

/**
 * The gem as the game prints it: name bar, tags, tier/level/cost/cast time,
 * description, blue stat lines, quality, then acquisition and metadata.
 */
export default function SkillTooltipCard({
  skill,
  details,
  className = "",
  showMetadata = true,
}: SkillTooltipCardProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="poe-tip">
        <div className="poe-tip-head">{skill.name}</div>
        {details ? (
          <div className="px-3 py-2">
            <p className="poe-desc !text-[#c9c9c9]">
              {details.tags.map((tag, index) => (
                <Fragment key={tag}>
                  {index > 0 ? ", " : ""}
                  <span className="poe-kw">{tag}</span>
                </Fragment>
              ))}
            </p>
            {details.craftable ? (
              <Property label="Tier">{details.tier}</Property>
            ) : null}
            <Property label="Level">(1-20)</Property>
            {details.cost.map((cost) => (
              <Property key={cost.label} label="Cost">
                {cost.min === cost.max ? cost.min : `(${cost.min}-${cost.max})`}{" "}
                {cost.label}
              </Property>
            ))}
            {details.reservation !== null ? (
              <Property label="Reservation">{details.reservation} Spirit</Property>
            ) : null}
            {details.castTime > 0 ? (
              <Property label="Cast Time">{sec(details.castTime)}</Property>
            ) : null}
            {details.critChance !== null ? (
              <Property label="Critical Strike Chance">
                {details.critChance.toFixed(2)}%
              </Property>
            ) : null}

            {details.description ? (
              <>
                <div className="poe-tip-sep" />
                <p className="poe-desc">
                  <GameText text={details.description} />
                </p>
              </>
            ) : null}

            {details.sets.length > 0 ? <div className="poe-tip-sep" /> : null}
            {details.sets.map((set, setIndex) => (
              <div key={setIndex} className={setIndex > 0 ? "mt-1.5" : ""}>
                {set.label ? (
                  <p className="poe-caps text-[#cfcfcf]">{set.label}</p>
                ) : null}
                {set.lines.map((line, index) => (
                  <p key={index} className="poe-blue">
                    <GameText text={line} />
                  </p>
                ))}
              </div>
            ))}

            {details.quality.length > 0 ? (
              <div className="mt-2">
                <p className="poe-caps text-white">
                  Additional Effects From 1-20% Quality:
                </p>
                {details.quality.map((line, index) => (
                  <p key={index} className="poe-blue">
                    <GameText text={line} />
                  </p>
                ))}
              </div>
            ) : null}

            <p className="mt-2 italic text-[#8a8a8a]">
              Skills can be managed in the Skills Panel.
            </p>
          </div>
        ) : (
          <p className="px-3 py-4 text-[#8a8a8a]">Loading…</p>
        )}
      </div>

      {details && (details.craftable || showMetadata) ? (
        <div className="poe-tip px-3 py-2">
          {details.craftable ? (
            <>
              <p className="poe-label">Acquisition</p>
              <p className="poe-value">Drop restricted</p>
              <p className="text-[#c9c9c9]">
                It can be obtained by engraving an Uncut{" "}
                {details.itemClass === "Spirit Gem" ? "Spirit" : "Skill"} Gem.
              </p>
            </>
          ) : null}
          {showMetadata ? (
            <>
              {details.craftable ? <div className="poe-tip-sep" /> : null}
              <p className="poe-label">Metadata</p>
              <p>
                <span className="poe-label">Item class: </span>
                <span className="poe-value">{details.itemClass}</span>
              </p>
              <p className="break-all">
                <span className="poe-label">Metadata ID: </span>
                <span className="poe-value">{skill.id}</span>
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
