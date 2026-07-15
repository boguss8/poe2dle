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

- `app/` - Next.js app directory with main pages and layouts
- `components/` - React components for game UI, search, and modals
- `data/` - JSON files containing skill gem and item data
- `public/` - Static assets including game icons

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
