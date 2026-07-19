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

export type HomeTab = Section | "test";

export const questionTypes = [
  "reading",
  "meaning",
  "word",
  "kanji",
  "sentence",
  "recognition",
] as const;
export type QuestionType = (typeof questionTypes)[number];

export interface TestQuestion {
  id: number;
  questionType: QuestionType;
  question: string;
  word: string;
  choices: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
  /** Optional; used during generation/validation only. */
  covers?: string[];
}

export interface TestLesson {
  title: string;
  type: Section;
  lesson?: string;
  questions: TestQuestion[];
}

export interface TestSummary {
  section: Section;
  slug: string;
  title: string;
  questionCount: number;
  isFinal: boolean;
}
