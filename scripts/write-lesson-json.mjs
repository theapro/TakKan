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

function requireString(value, label, index) {
  if (typeof value !== "string") {
    throw new Error(`items[${index}].${label} must be a string`);
  }
  if ((label === "word" || label === "reading" || label === "meaning") && !value.trim()) {
    throw new Error(`items[${index}].${label} must not be empty`);
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
  if (typeof raw.title !== "string" && typeof titleOverride !== "string") {
    throw new Error('"title" must be a string');
  }
  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    throw new Error('"items" must be a non-empty array');
  }

  const items = raw.items.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`items[${index}] must be an object`);
    }
    if (item.id !== index + 1) {
      throw new Error(`items[${index}].id must be ${index + 1}`);
    }

    return {
      id: item.id,
      word: requireString(item.word, "word", index),
      reading: requireString(item.reading, "reading", index),
      meaning: requireString(item.meaning, "meaning", index),
      onyomi: requireString(item.onyomi ?? "", "onyomi", index),
      kunyomi: requireString(item.kunyomi ?? "", "kunyomi", index),
    };
  });

  return {
    title: titleOverride || raw.title,
    items,
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
