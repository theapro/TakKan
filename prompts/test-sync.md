# Test sync checklist (mandatory)

Whenever lesson JSON under `data/kanji/` or `data/goi/` is created or updated:

1. Run `npm run tests:generate`
2. Confirm matching files exist under `data/test/{section}/`
3. Confirm `data/test/{section}/final.json` was regenerated
4. Confirm generator reported coverage success (≥2 questions per study item)

Never leave study lessons without matching tests.
Never ask the user to remind you to sync tests.
