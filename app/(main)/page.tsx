import { HomeLessons } from "@/components/HomeLessons";
import { getLessonSummaries } from "@/lib/lessons";
import { getTestSummaries } from "@/lib/tests";

export default async function HomePage() {
  const [kanji, goi, kanjiTests, goiTests] = await Promise.all([
    getLessonSummaries("kanji"),
    getLessonSummaries("goi"),
    getTestSummaries("kanji"),
    getTestSummaries("goi"),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <HomeLessons
        lessons={{ kanji, goi }}
        tests={{ kanji: kanjiTests, goi: goiTests }}
      />
    </main>
  );
}
