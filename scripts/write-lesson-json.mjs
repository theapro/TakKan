import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const sections = new Set(["kanji", "goi"]);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

function usage() {
  return [
    "Usage:",
    "  npm run lesson:write -- --section kanji --lesson lesson-3 --input converted.json",
    "  npm run lesson:write -- --section goi --lesson 4 --title \"Lesson 4\" < converted.json",
  ].join("\n");
}

function requireString(value, label) {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }
  if (!value.trim()) {
    throw new Error(`${label} must not be empty`);
  }
  return value;
}

function requireOptionalString(value, label) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }
  return value;
}

function normalizeLessonName(value) {
  if (!value || typeof value !== "string") return null;
  if (/^\d+$/.test(value)) return `lesson-${value}`;
  if (/^lesson-[a-z0-9-]+$/.test(value)) return value;
  return null;
}

function validateLesson(raw, titleOverride) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("JSON root must be an object");
  }
  if ("description" in raw) {
    throw new Error('Lesson JSON must not include "description"');
  }
  if ("items" in raw) {
    throw new Error('Lesson JSON must use "groups", not flat "items"');
  }
  if (typeof raw.title !== "string" && typeof titleOverride !== "string") {
    throw new Error('"title" must be a string');
  }
  if (!Array.isArray(raw.groups) || raw.groups.length === 0) {
    throw new Error('"groups" must be a non-empty array');
  }

  const groups = raw.groups.map((group, groupIndex) => {
    if (!group || typeof group !== "object" || Array.isArray(group)) {
      throw new Error(`groups[${groupIndex}] must be an object`);
    }
    if (group.id !== groupIndex + 1) {
      throw new Error(`groups[${groupIndex}].id must be ${groupIndex + 1}`);
    }
    if (!group.kanji || typeof group.kanji !== "object" || Array.isArray(group.kanji)) {
      throw new Error(`groups[${groupIndex}].kanji must be an object`);
    }
    if (!Array.isArray(group.examples) || group.examples.length === 0) {
      throw new Error(`groups[${groupIndex}].examples must be a non-empty array`);
    }

    const kanji = {
      word: requireString(group.kanji.word, `groups[${groupIndex}].kanji.word`),
      reading: requireString(group.kanji.reading, `groups[${groupIndex}].kanji.reading`),
      meaning: requireString(group.kanji.meaning, `groups[${groupIndex}].kanji.meaning`),
      onyomi: requireOptionalString(group.kanji.onyomi, `groups[${groupIndex}].kanji.onyomi`),
      kunyomi: requireOptionalString(group.kanji.kunyomi, `groups[${groupIndex}].kanji.kunyomi`),
    };

    const examples = group.examples.map((example, exampleIndex) => {
      if (!example || typeof example !== "object" || Array.isArray(example)) {
        throw new Error(`groups[${groupIndex}].examples[${exampleIndex}] must be an object`);
      }
      if (example.id !== exampleIndex + 1) {
        throw new Error(`groups[${groupIndex}].examples[${exampleIndex}].id must be ${exampleIndex + 1}`);
      }
      return {
        id: example.id,
        word: requireString(example.word, `groups[${groupIndex}].examples[${exampleIndex}].word`),
        reading: requireString(example.reading, `groups[${groupIndex}].examples[${exampleIndex}].reading`),
        meaning: requireString(example.meaning, `groups[${groupIndex}].examples[${exampleIndex}].meaning`),
      };
    });

    return { id: group.id, kanji, examples };
  });

  return {
    title: titleOverride || raw.title,
    groups,
  };
}

async function readInput(inputPath) {
  if (inputPath) return readFile(inputPath, "utf8");

  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const args = parseArgs(process.argv.slice(2));
const section = args.section;
const lesson = normalizeLessonName(args.lesson);

if (!sections.has(section) || !lesson) {
  console.error(usage());
  process.exit(1);
}

try {
  const rawText = await readInput(args.input);
  const parsed = JSON.parse(rawText);
  const lessonJson = validateLesson(parsed, args.title);
  const outputDir = path.join(process.cwd(), "data", section);
  const outputPath = path.join(outputDir, `${lesson}.json`);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(lessonJson, null, 2)}\n`, "utf8");
  console.log(`Saved ${outputPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
