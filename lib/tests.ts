import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Section, TestLesson, TestQuestion, TestSummary } from "@/types";
import { questionTypes, sections } from "@/types";
import { naturalCompare } from "@/lib/utils";

const testRoot = path.join(process.cwd(), "data", "test");

function assertString(value: unknown, field: string, file: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${file}: "${field}" must be a non-empty string`);
  }
}

function parseQuestion(raw: unknown, file: string, index: number): TestQuestion {
  if (!raw || typeof raw !== "object") {
    throw new Error(`${file}: questions[${index}] must be an object`);
  }
  const entry = raw as Record<string, unknown>;

  if (typeof entry.id !== "number" || !Number.isFinite(entry.id)) {
    throw new Error(`${file}: questions[${index}].id must be a finite number`);
  }
  if (typeof entry.questionType !== "string" || !questionTypes.includes(entry.questionType as never)) {
    throw new Error(`${file}: questions[${index}].questionType is invalid`);
  }
  assertString(entry.question, `questions[${index}].question`, file);
  assertString(entry.word, `questions[${index}].word`, file);
  assertString(entry.explanation, `questions[${index}].explanation`, file);

  if (!Array.isArray(entry.choices) || entry.choices.length !== 4) {
    throw new Error(`${file}: questions[${index}].choices must have exactly 4 items`);
  }
  if (!entry.choices.every((choice) => typeof choice === "string" && choice.trim())) {
    throw new Error(`${file}: questions[${index}].choices must be non-empty strings`);
  }
  if (
    typeof entry.correctAnswer !== "number"
    || !Number.isInteger(entry.correctAnswer)
    || entry.correctAnswer < 0
    || entry.correctAnswer > 3
  ) {
    throw new Error(`${file}: questions[${index}].correctAnswer must be 0..3`);
  }

  return {
    id: entry.id,
    questionType: entry.questionType as TestQuestion["questionType"],
    question: entry.question,
    word: entry.word,
    choices: entry.choices as TestQuestion["choices"],
    correctAnswer: entry.correctAnswer as TestQuestion["correctAnswer"],
    explanation: entry.explanation,
    covers: Array.isArray(entry.covers)
      ? entry.covers.filter((key): key is string => typeof key === "string")
      : undefined,
  };
}

function parseTestLesson(raw: unknown, file: string): TestLesson {
  if (!raw || typeof raw !== "object") {
    throw new Error(`${file}: root must be an object`);
  }
  const value = raw as Record<string, unknown>;
  assertString(value.title, "title", file);
  if (value.type !== "kanji" && value.type !== "goi") {
    throw new Error(`${file}: "type" must be kanji or goi`);
  }
  if (value.lesson !== undefined && (typeof value.lesson !== "string" || !value.lesson.trim())) {
    throw new Error(`${file}: "lesson" must be a non-empty string when present`);
  }
  if (!Array.isArray(value.questions) || value.questions.length === 0) {
    throw new Error(`${file}: "questions" must be a non-empty array`);
  }

  return {
    title: value.title,
    type: value.type,
    lesson: typeof value.lesson === "string" ? value.lesson : undefined,
    questions: value.questions.map((question, index) => parseQuestion(question, file, index)),
  };
}

export async function getTestSlugs(section: Section) {
  const dir = path.join(testRoot, section);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.slice(0, -5))
      .sort((a, b) => {
        if (a === "final") return 1;
        if (b === "final") return -1;
        return naturalCompare(a, b);
      });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function getTest(section: Section, slug: string) {
  if (!sections.includes(section)) return null;
  if (slug !== "final" && !/^lesson-[a-z0-9-]+$/.test(slug)) return null;

  const filename = path.join(testRoot, section, `${slug}.json`);
  try {
    const raw = JSON.parse(await fs.readFile(filename, "utf8")) as unknown;
    return parseTestLesson(raw, filename);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function getTestSummaries(section: Section): Promise<TestSummary[]> {
  const slugs = await getTestSlugs(section);
  return Promise.all(slugs.map(async (slug) => {
    const test = await getTest(section, slug);
    if (!test) throw new Error(`Discovered test could not be loaded: ${section}/${slug}`);
    return {
      section,
      slug,
      title: test.title,
      questionCount: test.questions.length,
      isFinal: slug === "final",
    };
  }));
}
