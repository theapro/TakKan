"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { HomeTab, LessonSummary, Section, TestSummary } from "@/types";
import { TopTabs } from "@/components/TopTabs";
import { LessonCard } from "@/components/LessonCard";
import { TestCard } from "@/components/TestCard";
import { EmptyState } from "@/components/EmptyState";

function TestSection({
  title,
  tests,
}: {
  title: string;
  tests: TestSummary[];
}) {
  const lessonTests = tests.filter((test) => !test.isFinal);
  const finalTests = tests.filter((test) => test.isFinal);

  if (!tests.length) return <EmptyState />;

  return (
    <section>
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
        {title}
      </h2>

      {lessonTests.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lessonTests.map((test, index) => (
            <TestCard key={`${test.section}-${test.slug}`} test={test} index={index} />
          ))}
        </div>
      ) : null}

      {finalTests.length ? (
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-200" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Final Test
            </h3>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {finalTests.map((test, index) => (
              <TestCard key={`${test.section}-${test.slug}`} test={test} index={index} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function HomeLessons({
  lessons,
  tests,
}: {
  lessons: Record<Section, LessonSummary[]>;
  tests: Record<Section, TestSummary[]>;
}) {
  const [tab, setTab] = useState<HomeTab>("kanji");

  useEffect(() => {
    const saved = localStorage.getItem("takkan:last-section");
    if (saved !== "kanji" && saved !== "goi" && saved !== "test") return;
    const timer = window.setTimeout(() => setTab(saved), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function changeTab(next: HomeTab) {
    setTab(next);
    localStorage.setItem("takkan:last-section", next);
  }

  return (
    <>
      <TopTabs value={tab} onChange={changeTab} />
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
        {tab === "test" ? (
          <div className="space-y-12">
            <TestSection title="Kanji Tests" tests={tests.kanji} />
            <TestSection title="Goi Tests" tests={tests.goi} />
          </div>
        ) : lessons[tab].length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lessons[tab].map((lesson, index) => (
              <LessonCard key={lesson.slug} lesson={lesson} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </motion.div>
    </>
  );
}
