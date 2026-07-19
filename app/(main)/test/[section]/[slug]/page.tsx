import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TestRunner } from "@/components/TestRunner";
import { getLesson, getLessonSlugs } from "@/lib/lessons";
import { getTest, getTestSlugs } from "@/lib/tests";
import { buildVocabCatalog } from "@/lib/vocab";
import { sections, type Section } from "@/types";

type PageParams = Promise<{ section: string; slug: string }>;

export async function generateStaticParams() {
  const values = await Promise.all(
    sections.map(async (section) =>
      (await getTestSlugs(section)).map((slug) => ({ section, slug })),
    ),
  );
  return values.flat();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { section, slug } = await params;
  if (!sections.includes(section as Section)) return {};
  const data = await getTest(section as Section, slug);
  return data ? { title: data.title } : {};
}

export default async function TestPage({ params }: { params: PageParams }) {
  const { section: rawSection, slug } = await params;
  if (!sections.includes(rawSection as Section)) notFound();
  const section = rawSection as Section;
  const data = await getTest(section, slug);
  if (!data) notFound();

  const lessonSlugs = await getLessonSlugs(section);
  const lessons = (
    await Promise.all(lessonSlugs.map((lessonSlug) => getLesson(section, lessonSlug)))
  ).filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== null);

  return <TestRunner test={data} catalog={buildVocabCatalog(lessons)} />;
}
