"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LessonSummary, Section } from "@/types";
import { TopTabs } from "@/components/TopTabs";
import { LessonCard } from "@/components/LessonCard";
import { EmptyState } from "@/components/EmptyState";

export function HomeLessons({ lessons }: { lessons: Record<Section, LessonSummary[]> }) {
  const [section, setSection] = useState<Section>("kanji");

  useEffect(() => {
    const saved = localStorage.getItem("takkan:last-section");
    if (saved !== "kanji" && saved !== "goi") return;
    const timer = window.setTimeout(() => setSection(saved), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function changeSection(next: Section) {
    setSection(next);
    localStorage.setItem("takkan:last-section", next);
  }

  return (
    <>
      <TopTabs value={section} onChange={changeSection} />
      <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
        {lessons[section].length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lessons[section].map((lesson, index) => <LessonCard key={lesson.slug} lesson={lesson} index={index} />)}
          </div>
        ) : <EmptyState />}
      </motion.div>
    </>
  );
}
