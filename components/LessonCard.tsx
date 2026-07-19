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
        className="group flex min-h-44 flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:bg-[var(--surface-hover)] hover:shadow-[var(--shadow-card-hover)] sm:min-h-48 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="text-sm font-medium text-[var(--text-muted)]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <ArrowUpRight className="size-5 text-[var(--text-muted)] transition group-hover:text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{lesson.title}</h2>
          {lesson.description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{lesson.description}</p>
          ) : null}
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--primary)]">
            {lesson.count} cards
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
