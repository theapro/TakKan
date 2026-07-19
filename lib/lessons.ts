import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Lesson, LessonSummary, Section, StudyItem } from "@/types";
import { naturalCompare } from "@/lib/utils";

const dataRoot = path.join(process.cwd(), "data");

function assertString(value: unknown, field: string, file: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${file}: "${field}" must be a non-empty string`);
  }
}

function lessonTitle(slug: string) {
  const suffix = slug.replace(/^lesson-/, "").replaceAll("-", " ");
  return `Lesson ${suffix.replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
}

function normalizeReadingField(value: unknown, field: string, file: string, index: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((part) => typeof part === "string")) {
    return value.join("・");
  }
  throw new Error(`${file}: items[${index}].${field} must be a string or string array`);
}

function parseStudyItem(raw: unknown, file: string, index: number): StudyItem {
  if (!raw || typeof raw !== "object") {
    throw new Error(`${file}: items[${index}] must be an object`);
  }

  const entry = raw as Record<string, unknown>;

  if (typeof entry.id !== "number" || !Number.isFinite(entry.id)) {
    throw new Error(`${file}: items[${index}].id must be a finite number`);
  }

  // Prefer `word`. Accept legacy `kanji` only as a migration path while normalizing to StudyItem.
  const wordValue = entry.word ?? entry.kanji;
  assertString(wordValue, `items[${index}].word`, file);
  assertString(entry.reading, `items[${index}].reading`, file);
  assertString(entry.meaning, `items[${index}].meaning`, file);

  const item: StudyItem = {
    id: entry.id,
    word: wordValue,
    reading: entry.reading,
    meaning: entry.meaning,
    onyomi: "",
    kunyomi: "",
  };

  const onyomi = normalizeReadingField(entry.onyomi, "onyomi", file, index);
  const kunyomi = normalizeReadingField(entry.kunyomi, "kunyomi", file, index);
  item.onyomi = onyomi ?? "";
  item.kunyomi = kunyomi ?? "";

  return item;
}

function parseLesson(raw: unknown, file: string, slug: string): Lesson {
  const isSimpleFormat = Array.isArray(raw);
  if (!isSimpleFormat && (!raw || typeof raw !== "object")) {
    throw new Error(`${file}: root must be an array or lesson object`);
  }

  const value = isSimpleFormat
    ? { title: lessonTitle(slug), items: raw }
    : raw as Record<string, unknown>;

  assertString(value.title, "title", file);
  if (!Array.isArray(value.items) || value.items.length === 0) {
    throw new Error(`${file}: "items" must be a non-empty array`);
  }

  const ids = new Set<number>();
  const items = value.items.map((item, index) => {
    const parsed = parseStudyItem(item, file, index);
    if (ids.has(parsed.id)) throw new Error(`${file}: duplicate item id "${parsed.id}"`);
    ids.add(parsed.id);
    return parsed;
  });

  return { title: value.title, items };
}

export async function getLessonSlugs(section: Section) {
  const dir = path.join(dataRoot, section);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((name) => /^lesson-.+\.json$/.test(name))
      .map((name) => name.slice(0, -5))
      .sort(naturalCompare);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function getLesson(section: Section, slug: string) {
  if (!/^lesson-[a-z0-9-]+$/.test(slug)) return null;
  const filename = path.join(dataRoot, section, `${slug}.json`);
  try {
    const raw = JSON.parse(await fs.readFile(filename, "utf8")) as unknown;
    return parseLesson(raw, filename, slug);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function getLessonSummaries(section: Section): Promise<LessonSummary[]> {
  const slugs = await getLessonSlugs(section);
  return Promise.all(slugs.map(async (slug) => {
    const lesson = await getLesson(section, slug);
    if (!lesson) throw new Error(`Discovered lesson could not be loaded: ${section}/${slug}`);
    return {
      section,
      slug,
      title: lesson.title,
      description: "",
      count: lesson.items.length,
    };
  }));
}
