import type { Lesson } from "@/types";

export interface VocabEntry {
  word: string;
  reading: string;
  meaning: string;
}

/** Flatten every kanji head + example into a lookup catalog. */
export function buildVocabCatalog(lessons: Lesson[]): VocabEntry[] {
  const entries: VocabEntry[] = [];
  const seen = new Set<string>();

  for (const lesson of lessons) {
    for (const group of lesson.groups) {
      const headKey = `${group.kanji.word}|${group.kanji.reading}|${group.kanji.meaning}`;
      if (!seen.has(headKey)) {
        seen.add(headKey);
        entries.push({
          word: group.kanji.word,
          reading: group.kanji.reading,
          meaning: group.kanji.meaning,
        });
      }

      for (const example of group.examples) {
        const key = `${example.word}|${example.reading}|${example.meaning}`;
        if (seen.has(key)) continue;
        seen.add(key);
        entries.push({
          word: example.word,
          reading: example.reading,
          meaning: example.meaning,
        });
      }
    }
  }

  return entries;
}

/** Resolve a choice string (word, reading, or meaning) back to a vocab entry. */
export function resolveVocabChoice(
  choice: string,
  catalog: VocabEntry[],
  preferredWord?: string,
): VocabEntry | null {
  const byWord = catalog.filter((entry) => entry.word === choice);
  if (byWord.length) {
    return byWord.find((entry) => entry.word === preferredWord) ?? byWord[0];
  }

  const byReading = catalog.filter((entry) => entry.reading === choice);
  if (byReading.length) {
    return byReading.find((entry) => entry.word === preferredWord) ?? byReading[0];
  }

  const byMeaning = catalog.filter((entry) => entry.meaning === choice);
  if (byMeaning.length) {
    return byMeaning.find((entry) => entry.word === preferredWord) ?? byMeaning[0];
  }

  return null;
}
