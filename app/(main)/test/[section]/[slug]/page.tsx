import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TestRunner } from "@/components/TestRunner";
import { getTest, getTestSlugs } from "@/lib/tests";
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

  return <TestRunner test={data} />;
}
