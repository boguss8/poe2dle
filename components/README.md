# Component structure

This folder is organized by feature and usage:

- layout/ - shared page chrome: header (top bar, game switcher, menu) and footer
- game/ - gameplay UI: the board, guess grid, hints, end-of-game panel, confetti
- search/ - the skill search combobox and its suggestion list
- tooltip/ - the in-game style item tooltip (hover/focus/tap) and its card
- modals/ - dialogs: how-to-play, statistics, and the shared `Modal` shell
- consent/ - cookie notice and the cookie settings dialog
- ui/ - small building blocks with no game knowledge (e.g. `Icon`)

Shared logic lives next door in `lib/` (game rules, cookie stores, formatting,
site URLs); components import from there instead of redefining it.
