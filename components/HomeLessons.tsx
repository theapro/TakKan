"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { HomeTab, LessonSummary, Section, TestSummary } from "@/types";
import { TopTabs } from "@/components/TopTabs";
import { LessonCard } from "@/components/LessonCard";
import { TestCard } from "@/components/TestCard";
import { EmptyState } from "@/components/EmptyState";

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
            {(["kanji", "goi"] as const).map((section) => (
              <section key={section}>
                <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  {section === "kanji" ? "Kanji Tests" : "Goi Tests"}
                </h2>
                {tests[section].length ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {tests[section].map((test, index) => (
                      <TestCard key={`${test.section}-${test.slug}`} test={test} index={index} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </section>
            ))}
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
