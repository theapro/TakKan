/**
 * Generates data/test/{kanji|goi}/*.json from study lesson JSON.
 * Ensures every study item is covered by ≥2 questions, 4 choices each,
 * and regenerates final.json for each section.
 *
 * Usage: npm run tests:generate
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataRoot = path.join(root, "data");
const sections = ["kanji", "goi"];

function createRng(seed) {
  let state = 0;
  for (let i = 0; i < seed.length; i += 1) {
    state = (Math.imul(31, state) + seed.charCodeAt(i)) | 0;
  }
  if (state === 0) state = 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, random) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function uniqueValues(values, exclude) {
  const seen = new Set([exclude]);
  const result = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function pickDistractors(values, correct, count, random) {
  return shuffle(uniqueValues(values, correct), random).slice(0, count);
}

function buildChoices(correct, distractors, fallbackValues, random) {
  const seen = new Set([correct]);
  const choices = [correct];

  for (const value of [...distractors, ...shuffle(uniqueValues(fallbackValues, correct), random)]) {
    if (choices.length >= 4) break;
    if (!value || seen.has(value)) continue;
    seen.add(value);
    choices.push(value);
  }

  if (choices.length < 4) {
    throw new Error(`Not enough realistic distractors for "${correct}" (need 4 unique choices)`);
  }

  const shuffled = shuffle(choices.slice(0, 4), random);
  const correctAnswer = shuffled.indexOf(correct);
  if (correctAnswer < 0 || correctAnswer > 3) {
    throw new Error(`Failed to place correct answer: ${correct}`);
  }

  return {
    choices: /** @type {[string, string, string, string]} */ (shuffled),
    correctAnswer: /** @type {0|1|2|3} */ (correctAnswer),
  };
}

function flattenLesson(lesson, slug) {
  /** @type {Array<{
   *  key: string;
   *  word: string;
   *  reading: string;
   *  meaning: string;
   *  kanjiChar: string;
   *  kind: "kanji" | "example";
   *  slug: string;
   * }>} */
  const items = [];

  for (const group of lesson.groups) {
    const kanji = group.kanji;
    items.push({
      key: `${slug}:g${group.id}:kanji`,
      word: kanji.word,
      reading: kanji.reading,
      meaning: kanji.meaning,
      kanjiChar: kanji.word,
      kind: "kanji",
      slug,
    });

    for (const example of group.examples) {
      items.push({
        key: `${slug}:g${group.id}:e${example.id}`,
        word: example.word,
        reading: example.reading,
        meaning: example.meaning,
        kanjiChar: kanji.word,
        kind: "example",
        slug,
      });
    }
  }

  return items;
}

function looksLikeSentence(word) {
  return word.length >= 4 || /[をにがではと]$/.test(word) || word.includes("する");
}

function makeQuestion(id, type, question, word, correct, distractorValues, fallbackValues, explanation, covers, random) {
  const distractors = pickDistractors(distractorValues, correct, 3, random);
  const { choices, correctAnswer } = buildChoices(correct, distractors, fallbackValues, random);
  return {
    id,
    questionType: type,
    question,
    word,
    choices,
    correctAnswer,
    explanation,
    covers,
  };
}

/**
 * @param {ReturnType<typeof flattenLesson>} items items that must be covered
 * @param {ReturnType<typeof flattenLesson>} pool distractor pool (usually all section items)
 */
function generateQuestionsForItems(items, pool, section, random) {
  const questions = [];
  let nextId = 1;

  const poolReadings = pool.map((item) => item.reading);
  const poolMeanings = pool.map((item) => item.meaning);
  const poolWords = pool.map((item) => item.word);

  for (const item of items) {
    const others = pool.filter((candidate) => candidate.key !== item.key);

    // Q1 — sentence meaning or reading
    if (item.kind === "example" && looksLikeSentence(item.word)) {
      questions.push(
        makeQuestion(
          nextId++,
          "sentence",
          `『${item.word}』ning ma'nosi qaysi?`,
          item.word,
          item.meaning,
          others.map((x) => x.meaning),
          poolMeanings,
          `${item.word} → ${item.meaning}`,
          [item.key],
          random,
        ),
      );
    } else {
      questions.push(
        makeQuestion(
          nextId++,
          "reading",
          `『${item.word}』ning o'qilishi qaysi?`,
          item.word,
          item.reading,
          others.map((x) => x.reading),
          poolReadings,
          `${item.word} → ${item.reading}`,
          [item.key],
          random,
        ),
      );
    }

    // Q2 — meaning or reverse meaning→word
    if (random() < 0.5) {
      questions.push(
        makeQuestion(
          nextId++,
          "meaning",
          `『${item.word}』ning ma'nosi qaysi?`,
          item.word,
          item.meaning,
          others.map((x) => x.meaning),
          poolMeanings,
          `${item.word} → ${item.meaning}`,
          [item.key],
          random,
        ),
      );
    } else {
      questions.push(
        makeQuestion(
          nextId++,
          "word",
          `『${item.meaning}』ning yaponcha ifodasi qaysi?`,
          item.word,
          item.word,
          others.map((x) => x.word),
          poolWords,
          `${item.meaning} → ${item.word}`,
          [item.key],
          random,
        ),
      );
    }

    // Q3 — reading → written form (Type D), for heads and short compounds
    if (item.kind === "kanji" || item.word.length <= 4) {
      questions.push(
        makeQuestion(
          nextId++,
          "kanji",
          `『${item.reading}』qaysi yozuvga mos?`,
          item.word,
          item.word,
          others.map((x) => x.word),
          poolWords,
          `${item.reading} → ${item.word}`,
          [item.key],
          random,
        ),
      );
    }

    // Type F — recognition
    if (
      section === "kanji"
      && item.kind === "example"
      && item.kanjiChar
      && item.word.includes(item.kanjiChar)
      && random() < 0.4
    ) {
      questions.push(
        makeQuestion(
          nextId++,
          "recognition",
          `『${item.kanjiChar}』kanjisi qaysi so‘zda to‘g‘ri ishlatilgan?`,
          item.word,
          item.word,
          others.map((x) => x.word),
          poolWords,
          `${item.kanjiChar} → ${item.word}`,
          [item.key],
          random,
        ),
      );
    }
  }

  return shuffle(questions, random).map((question, index) => ({
    ...question,
    id: index + 1,
  }));
}

function validateCoverage(items, questions, label) {
  const coverage = new Map(items.map((item) => [item.key, 0]));

  for (const question of questions) {
    if (!Array.isArray(question.choices) || question.choices.length !== 4) {
      throw new Error(`${label}: question ${question.id} must have exactly 4 choices`);
    }
    const uniqueChoices = new Set(question.choices);
    if (uniqueChoices.size !== 4) {
      throw new Error(`${label}: question ${question.id} has duplicate choices`);
    }
    if (question.correctAnswer < 0 || question.correctAnswer > 3) {
      throw new Error(`${label}: question ${question.id} has invalid correctAnswer`);
    }
    for (const key of question.covers ?? []) {
      if (coverage.has(key)) coverage.set(key, (coverage.get(key) ?? 0) + 1);
    }
  }

  const missing = [...coverage.entries()].filter(([, count]) => count < 2);
  if (missing.length) {
    throw new Error(
      `${label}: coverage failed for ${missing.length} items (need ≥2). First: ${missing[0][0]} (${missing[0][1]})`,
    );
  }
}

function stripCovers(questions) {
  return questions.map(({ covers: _covers, ...question }) => question);
}

async function readLesson(section, slug) {
  const file = path.join(dataRoot, section, `${slug}.json`);
  const raw = JSON.parse(await readFile(file, "utf8"));
  if (!raw || !Array.isArray(raw.groups)) {
    throw new Error(`${section}/${slug}: expected groups[]`);
  }
  return raw;
}

async function listLessonSlugs(section) {
  const dir = path.join(dataRoot, section);
  try {
    const files = await readdir(dir);
    return files
      .filter((name) => /^lesson-.+\.json$/.test(name))
      .map((name) => name.slice(0, -5))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch (error) {
    if (error && error.code === "ENOENT") return [];
    throw error;
  }
}

function lessonNumberLabel(slug) {
  const match = /^lesson-(.+)$/.exec(slug);
  return match ? match[1] : slug;
}

async function writeTest(section, slug, payload) {
  const dir = path.join(dataRoot, "test", section);
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${slug}.json`);
  await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return file;
}

async function generateSection(section) {
  const slugs = await listLessonSlugs(section);
  if (!slugs.length) {
    console.log(`No ${section} lessons found.`);
    return;
  }

  const lessons = [];
  for (const slug of slugs) {
    const lesson = await readLesson(section, slug);
    lessons.push({ slug, lesson, items: flattenLesson(lesson, slug) });
  }

  const sectionPool = lessons.flatMap((entry) => entry.items);
  if (uniqueValues(sectionPool.map((item) => item.reading), "").length < 4
    || uniqueValues(sectionPool.map((item) => item.meaning), "").length < 4
    || uniqueValues(sectionPool.map((item) => item.word), "").length < 4) {
    throw new Error(
      `${section}: need at least 4 unique words/readings/meanings across lessons to build realistic choices`,
    );
  }

  for (const entry of lessons) {
    const random = createRng(`${section}:${entry.slug}:v2`);
    const questions = generateQuestionsForItems(entry.items, sectionPool, section, random);
    validateCoverage(entry.items, questions, `${section}/${entry.slug}`);

    const payload = {
      title: `Lesson ${lessonNumberLabel(entry.slug)} Test`,
      type: section,
      lesson: entry.slug,
      questions: stripCovers(questions),
    };
    const file = await writeTest(section, entry.slug, payload);
    console.log(
      `Wrote ${path.relative(root, file)} (${questions.length} questions, ${entry.items.length} items)`,
    );
  }

  const finalRandom = createRng(`${section}:final:v2`);
  const finalQuestions = generateQuestionsForItems(sectionPool, sectionPool, section, finalRandom);
  validateCoverage(sectionPool, finalQuestions, `${section}/final`);

  const finalPayload = {
    title: section === "kanji" ? "Final Kanji Test" : "Final Goi Test",
    type: section,
    questions: stripCovers(finalQuestions),
  };
  const finalFile = await writeTest(section, "final", finalPayload);
  console.log(`Wrote ${path.relative(root, finalFile)} (${finalQuestions.length} questions)`);
}

async function main() {
  for (const section of sections) {
    await generateSection(section);
  }
  console.log("Test generation complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
