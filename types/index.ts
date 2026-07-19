export const sections = ["kanji", "goi"] as const;
export type Section = (typeof sections)[number];

/** Headword for a kanji group (or vocabulary head for goi). */
export interface KanjiInfo {
  word: string;
  reading: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
}

/** Usage example belonging to a kanji group. */
export interface Example {
  id: number;
  word: string;
  reading: string;
  meaning: string;
}

/** One study unit: a kanji (or headword) with its examples. */
export interface KanjiGroup {
  id: number;
  kanji: KanjiInfo;
  examples: Example[];
}

export interface Lesson {
  title: string;
  groups: KanjiGroup[];
}

export interface LessonSummary {
  section: Section;
  slug: string;
  title: string;
  description: string;
  count: number;
}
