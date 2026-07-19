# TakKan

Minimal, local-first kanji and vocabulary flashcards built with Next.js App Router, TypeScript, Tailwind CSS 4, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Production checks:

```bash
npm run lint
npm run build
```

## Lesson data

Lessons live in `data/kanji/` and `data/goi/`. Add a file named `lesson-<name>.json`; it is discovered automatically, sorted naturally, shown on the home page, and statically generated at `/<section>/lesson-<name>`.

Every item uses the shared **StudyItem** model. The front of every card shows `word` only.

```json
{
  "title": "Lesson title",
  "description": "Short description",
  "items": [
    {
      "id": 1,
      "word": "水",
      "reading": "みず",
      "meaning": "suv",
      "onyomi": "スイ",
      "kunyomi": "みず"
    }
  ]
}
```

Vocabulary example:

```json
{
  "title": "Lesson title",
  "description": "Short description",
  "items": [
    {
      "id": 1,
      "word": "経験",
      "reading": "けいけん",
      "meaning": "tajriba"
    }
  ]
}
```

- `word` is always the front-side text (kanji character, kanji compound, or kana-only word)
- `onyomi` / `kunyomi` are optional and kept for a future Kanji Details page (not shown on flashcards)
- IDs must be unique numbers within a lesson
- Array-only files are also supported; title is derived from the filename

Malformed files fail the build with a message naming the file and invalid field.
# TakKan
