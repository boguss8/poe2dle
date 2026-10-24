# POE2dle

A Wordle-like guessing game for Path of Exile 2 skill gems. Guess the skill gem based on its icon and information!

## ⚠️ Disclaimer

**This project is NOT affiliated with, endorsed by, or associated with Grinding Gear Games (GGG) or Path of Exile 2.** It is an independent fan-made project created for entertainment purposes only. Path of Exile is a trademark of Grinding Gear Games Limited.

## About

POE2dle challenges players to identify Path of Exile 2 skill gems from their icons and information. It's a fun way to test your knowledge of the game's vast skill gem library.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)

### Installation

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to play.

### Project Structure

- `app/` - Next.js app directory with main pages and layouts (`/` is the skill gem game)
- `components/` - React components for game UI, search, layout and modals
- `lib/games/` - game registry and per-game logic (`skill/`: comparison, daily answer, progress, share text)
- `data/` - raw RePoE data plus the generated `skill_pool.json` the game uses
- `public/` - Static assets including game icons

### Scripts

| Command | What it does |
| --- | --- |
| `pnpm fetch-data` | Download `skill_gems.json` into `data/` and `skills.json` (~27 MB, git-ignored) into `data/raw/` |
| `pnpm build-skill-versions` | Work out the PoE2 version each gem first appeared in from the RePoE data repo's history → `data/skill_versions.json` |
| `pnpm build-skill-pool` | Regenerate `data/skill_pool.json` (the guessable skills) and `data/skill_details.json` (hover tooltips) |
| `pnpm download-icons` | Mirror the gem icons into `public/icons/poe2/` |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm typecheck` / `pnpm lint` | Static checks |

After a game patch, run `fetch-data`, `build-skill-versions`, `build-skill-pool` and `download-icons` in that order. See [ROADMAP.md](ROADMAP.md) for the plan.

### Fonts

The interface is set in Oxygen (Google Fonts, bundled by Next.js). In-game text — skill names and the item tooltip — is set in **Fontin**, the typeface Path of Exile uses. Fontin is free to use on a website but its licence **forbids redistributing the font files**, so they are not in this repository (`public/fonts/` is git-ignored). To get the exact look:

1. Download the "PC (TTF)" zip from <https://www.exljbris.com/fontin.html>.
2. Copy `Fontin-Regular.ttf`, `Fontin-Bold.ttf`, `Fontin-Italic.ttf` and `Fontin-SmallCaps.ttf` into `public/fonts/`.

Without them the site falls back to Georgia. The site footer and `globals.css` carry the credit the licence requires.

## Technologies

- **Next.js** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS styling

## Development

The project uses [Next.js](https://nextjs.org) with automatic hot-reload as you edit files.

To build for production:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
