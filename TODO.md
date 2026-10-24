## Curernt

- [ ] filtrowanie duplikatów
- [x] weryfikacja odpowiedzi (`lib/gameLogic.ts` verifyGuess; logged to console only)
- [ ] efekty wynikow (render verifyGuess result in the UI)
- [ ] script to combine duplicates
- [ ] replace hardcoded "Ice Shot" answer in InputField with the daily selector

Fields compared in verifyGuess:

- requirement_weights = req
- crafting_level = min level
- crafting_types = weapon
- tags = tags
- base_item.release_state = released (always "released" in current data; manual flag still open)

## Priorytet 1 — fundamenty

- [ ] main page
- [ ] search component
- [ ] connecting api
- [ ] correct/incorrect fields
- [ ] daily selector

## Priorytet 2 — mechanika gry

- [ ] submit guess / enter handling
- [ ] win/lose state
- [ ] number of attempts / max guesses
- [ ] reset game / play again
- [ ] keyboard input and focus handling
- [ ] game history / previous guesses

## Priorytet 3 — UX i treści

- [ ] how to play popup
- [ ] info
- [ ] footer
- [ ] polish / animations / better feedback
