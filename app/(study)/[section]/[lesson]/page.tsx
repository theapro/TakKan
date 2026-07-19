import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StudyDeck } from "@/components/StudyDeck";
import { StudyHelpDialog } from "@/components/StudyHelpDialog";
import { getLesson, getLessonSlugs } from "@/lib/lessons";
import { sections, type Section } from "@/types";

type PageParams = Promise<{ section: string; lesson: string }>;

export async function generateStaticParams() {
  const values = await Promise.all(
    sections.map(async (section) =>
      (await getLessonSlugs(section)).map((lesson) => ({ section, lesson })),
    ),
  );
  return values.flat();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { section, lesson } = await params;
  if (!sections.includes(section as Section)) return {};
  const data = await getLesson(section as Section, lesson);
  return data ? { title: data.title } : {};
}

export default async function LessonPage({ params }: { params: PageParams }) {
  const { section: rawSection, lesson } = await params;
  if (!sections.includes(rawSection as Section)) notFound();
  const section = rawSection as Section;
  const data = await getLesson(section, lesson);
  if (!data) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <header className="mx-auto grid w-full max-w-5xl shrink-0 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 px-4 pt-4 sm:grid-cols-[2.5rem_1fr_auto] sm:gap-3 sm:px-8 sm:pt-6">
        <Link
          href="/"
          className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-zinc-700"
          aria-label="Back to lessons"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <h1 className="min-w-0 truncate text-center text-lg font-semibold leading-tight tracking-tight text-zinc-950 sm:text-[22px]">
          {data.title}
        </h1>

        <div className="flex items-center justify-end gap-1 sm:gap-1.5">
          <span className="hidden rounded-full border border-zinc-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:inline-flex">
            {section === "kanji" ? "Kanji" : "Goi"}
          </span>
          <StudyHelpDialog />
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-x-hidden px-4 pb-3 pt-4 sm:px-8 sm:pb-4 sm:pt-5">
        <StudyDeck section={section} lesson={lesson} groups={data.groups} />
      </main>
    </div>
  );
}
