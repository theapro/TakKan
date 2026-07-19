"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Trophy } from "lucide-react";
import type { TestSummary } from "@/types";
import { cn } from "@/lib/utils";

export function TestCard({ test, index }: { test: TestSummary; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/test/${test.section}/${test.slug}`}
        className={cn(
          "group flex min-h-44 flex-col justify-between rounded-3xl border bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:bg-[var(--surface-hover)] hover:shadow-[var(--shadow-card-hover)] sm:min-h-48 sm:p-6",
          test.isFinal
            ? "border-[var(--primary)]/55 hover:border-[var(--primary)]"
            : "border-[var(--border)] hover:border-[var(--primary)]/30",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {test.isFinal ? (
            <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
              Final
            </span>
          ) : (
            <span className="text-sm font-medium text-[var(--text-muted)]">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          {test.isFinal ? (
            <Trophy className="size-5 text-[var(--primary)] transition group-hover:scale-105" />
          ) : (
            <ArrowUpRight className="size-5 text-[var(--text-muted)] transition group-hover:text-[var(--primary)]" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{test.title}</h2>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--primary)]">
            {test.questionCount} questions
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
