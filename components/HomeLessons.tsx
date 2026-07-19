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
  if (!tests.length) return <EmptyState />;

  return (
    <section>
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {tests.map((test, index) => (
          <TestCard key={`${test.section}-${test.slug}`} test={test} index={index} />
        ))}
      </div>
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
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 sm:mt-10">
        {tab === "test" ? (
          <div className="space-y-10 sm:space-y-12">
            <TestSection title="Kanji Tests" tests={tests.kanji} />
            <TestSection title="Goi Tests" tests={tests.goi} />
          </div>
        ) : lessons[tab].length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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
