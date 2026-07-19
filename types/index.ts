export const sections = ["kanji", "goi"] as const;
export type Section = (typeof sections)[number];

/** Single flashcard model for both Kanji and Goi lessons. */
export interface StudyItem {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
}

export interface Lesson {
  title: string;
  items: StudyItem[];
}

export interface LessonSummary {
  section: Section;
  slug: string;
  title: string;
  description: string;
  count: number;
}
