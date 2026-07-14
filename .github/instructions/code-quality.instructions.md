---
description: "Enforce high-quality, safe, and root-cause-first coding practices for this project."
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# Code quality and safety

- Prioritize correctness, safety, and maintainability over speed or convenience.
- Do not use workarounds, temporary fixes, or speculative patches when a proper root-cause solution is available.
- Prefer explicit types, clear naming, and simple data flow over clever shortcuts.
- When an implementation blocks a safe, high-quality fix, explain the limitation clearly and address the underlying issue before adding new features.
- Keep changes focused, minimal, and easy to review.
- Favor robust solutions that are easy to reason about and extend.
- If a change introduces risk, pause and look for a cleaner design rather than forcing a quick patch.
- When unsure, ask for clarification rather than making a risky assumption.
