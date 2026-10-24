import Legend from "@/components/game/Legend";
import Modal from "./Modal";

type HowToPlayModalProps = { open: boolean; onClose: () => void };

const CLUES = [
  ["Category", "Attack, Spell, Spirit (cut from Uncut Spirit Gems), Minion, Companion, Buff, Curse, Meta or Utility."],
  ["Attribute", "The Strength, Dexterity and/or Intelligence the gem is tied to."],
  ["Source", "Where it comes from or what it needs: the weapon or spell group it is cut for (Bow, Crossbow, Mace, Spear, Quarterstaff, Elemental, Primal, Occult), the item that grants it (Wand, Staff, Sceptre, Shield), Ascendancy, or Runeforged. Other means the data doesn't say."],
  ["Damage", "Physical, fire, cold, lightning and/or chaos."],
  ["Delivery", "Projectile, area and/or melee."],
  ["Tier", "The gem's tier. None means it can't be cut from uncut gems."],
  ["Mana", "Mana cost at gem level 1."],
  ["Cast time", "Seconds per cast."],
  ["Version", "The Path of Exile 2 patch the gem was first released in."],
  ["Mechanics", "The remaining in-game tags, such as duration, trigger or channelling."],
];

export default function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="How to play">
      <div className="space-y-4">
        <p>
          Find today&apos;s mystery <strong>Path of Exile 2 skill gem</strong>.
          Name any skill and each clue tile shows how it compares with the
          answer. Guess as often as you like — a new skill appears every day at
          midnight UTC.
        </p>

        <Legend />

        <div className="card-deep px-4 py-3">
          <h3 className="mb-2 font-bold">The clues</h3>
          <dl className="space-y-1.5 text-sm">
            {CLUES.map(([name, text]) => (
              <div key={name}>
                <dt className="inline font-bold">{name}: </dt>
                <dd className="inline text-muted">{text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card-deep px-4 py-3 text-sm">
          <h3 className="mb-1 font-bold">Stuck?</h3>
          <p className="text-muted">
            After 3 guesses you can reveal the skill&apos;s first letter, and after 6
            its icon. Hints are optional and are noted when you share your result.
          </p>
        </div>

        <p className="text-sm text-muted">
          Hover (or tap) any skill to see its full in-game tooltip. Use ↑ ↓ and
          Enter to pick from the suggestions.
        </p>
      </div>
    </Modal>
  );
}
