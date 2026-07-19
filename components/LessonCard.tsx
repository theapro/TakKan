"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { LessonSummary } from "@/types";

export function LessonCard({ lesson, index }: { lesson: LessonSummary; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/${lesson.section}/${lesson.slug}`}
        className="group flex min-h-48 flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--brand)]/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] dark:hover:border-[var(--brand)]/30"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
            {String(index + 1).padStart(2, "0")}
          </span>
          <ArrowUpRight className="size-5 text-zinc-300 transition group-hover:text-[var(--brand)] dark:text-zinc-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{lesson.title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{lesson.description}</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--brand)]">
            {lesson.count} cards
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
