import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  Example,
  KanjiGroup,
  KanjiInfo,
  Lesson,
  LessonSummary,
  Section,
} from "@/types";
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

function normalizeReadingField(
  value: unknown,
  field: string,
  file: string,
  context: string,
): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((part) => typeof part === "string")) {
    return value.join("・");
  }
  throw new Error(`${file}: ${context}.${field} must be a string or string array`);
}

function parseKanjiInfo(raw: unknown, file: string, groupIndex: number): KanjiInfo {
  if (!raw || typeof raw !== "object") {
    throw new Error(`${file}: groups[${groupIndex}].kanji must be an object`);
  }

  const entry = raw as Record<string, unknown>;
  const wordValue = entry.word ?? entry.kanji;
  assertString(wordValue, `groups[${groupIndex}].kanji.word`, file);
  assertString(entry.reading, `groups[${groupIndex}].kanji.reading`, file);
  assertString(entry.meaning, `groups[${groupIndex}].kanji.meaning`, file);

  return {
    word: wordValue,
    reading: entry.reading,
    meaning: entry.meaning,
    onyomi: normalizeReadingField(entry.onyomi, "onyomi", file, `groups[${groupIndex}].kanji`),
    kunyomi: normalizeReadingField(entry.kunyomi, "kunyomi", file, `groups[${groupIndex}].kanji`),
  };
}

function parseExample(raw: unknown, file: string, groupIndex: number, index: number): Example {
  if (!raw || typeof raw !== "object") {
    throw new Error(`${file}: groups[${groupIndex}].examples[${index}] must be an object`);
  }

  const entry = raw as Record<string, unknown>;
  if (typeof entry.id !== "number" || !Number.isFinite(entry.id)) {
    throw new Error(`${file}: groups[${groupIndex}].examples[${index}].id must be a finite number`);
  }

  assertString(entry.word, `groups[${groupIndex}].examples[${index}].word`, file);
  assertString(entry.reading, `groups[${groupIndex}].examples[${index}].reading`, file);
  assertString(entry.meaning, `groups[${groupIndex}].examples[${index}].meaning`, file);

  return {
    id: entry.id,
    word: entry.word,
    reading: entry.reading,
    meaning: entry.meaning,
  };
}

function parseGroup(raw: unknown, file: string, index: number): KanjiGroup {
  if (!raw || typeof raw !== "object") {
    throw new Error(`${file}: groups[${index}] must be an object`);
  }

  const entry = raw as Record<string, unknown>;
  if (typeof entry.id !== "number" || !Number.isFinite(entry.id)) {
    throw new Error(`${file}: groups[${index}].id must be a finite number`);
  }
  if (!Array.isArray(entry.examples) || entry.examples.length === 0) {
    throw new Error(`${file}: groups[${index}].examples must be a non-empty array`);
  }

  const exampleIds = new Set<number>();
  const examples = entry.examples.map((example, exampleIndex) => {
    const parsed = parseExample(example, file, index, exampleIndex);
    if (exampleIds.has(parsed.id)) {
      throw new Error(`${file}: groups[${index}] duplicate example id "${parsed.id}"`);
    }
    exampleIds.add(parsed.id);
    return parsed;
  });

  return {
    id: entry.id,
    kanji: parseKanjiInfo(entry.kanji, file, index),
    examples,
  };
}

/** Legacy flat `items` → one group per item (example mirrors the headword). */
function migrateFlatItems(items: unknown[], file: string): KanjiGroup[] {
  return items.map((raw, index) => {
    if (!raw || typeof raw !== "object") {
      throw new Error(`${file}: items[${index}] must be an object`);
    }
    const entry = raw as Record<string, unknown>;
    if (typeof entry.id !== "number" || !Number.isFinite(entry.id)) {
      throw new Error(`${file}: items[${index}].id must be a finite number`);
    }

    const wordValue = entry.word ?? entry.kanji;
    assertString(wordValue, `items[${index}].word`, file);
    assertString(entry.reading, `items[${index}].reading`, file);
    assertString(entry.meaning, `items[${index}].meaning`, file);

    const kanji: KanjiInfo = {
      word: wordValue,
      reading: entry.reading,
      meaning: entry.meaning,
      onyomi: normalizeReadingField(entry.onyomi, "onyomi", file, `items[${index}]`),
      kunyomi: normalizeReadingField(entry.kunyomi, "kunyomi", file, `items[${index}]`),
    };

    return {
      id: entry.id,
      kanji,
      examples: [
        {
          id: 1,
          word: kanji.word,
          reading: kanji.reading,
          meaning: kanji.meaning,
        },
      ],
    };
  });
}

function parseLesson(raw: unknown, file: string, slug: string): Lesson {
  const isSimpleFormat = Array.isArray(raw);
  if (!isSimpleFormat && (!raw || typeof raw !== "object")) {
    throw new Error(`${file}: root must be an array or lesson object`);
  }

  const value = isSimpleFormat
    ? { title: lessonTitle(slug), groups: undefined, items: raw }
    : raw as Record<string, unknown>;

  assertString(value.title, "title", file);

  let groups: KanjiGroup[];

  if (Array.isArray(value.groups)) {
    if (value.groups.length === 0) {
      throw new Error(`${file}: "groups" must be a non-empty array`);
    }
    const ids = new Set<number>();
    groups = value.groups.map((group, index) => {
      const parsed = parseGroup(group, file, index);
      if (ids.has(parsed.id)) throw new Error(`${file}: duplicate group id "${parsed.id}"`);
      ids.add(parsed.id);
      return parsed;
    });
  } else if (Array.isArray(value.items) && value.items.length > 0) {
    groups = migrateFlatItems(value.items, file);
  } else {
    throw new Error(`${file}: "groups" must be a non-empty array`);
  }

  return { title: value.title, groups };
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
      count: lesson.groups.reduce((sum, group) => sum + group.examples.length, 0),
    };
  }));
}
