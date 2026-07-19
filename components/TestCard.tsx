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
          "group flex min-h-44 flex-col justify-between rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:min-h-48 sm:p-6",
          test.isFinal
            ? "border-[#00D18B]/55 hover:border-[#00D18B]"
            : "border-zinc-200 hover:border-[var(--brand)]/30",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {test.isFinal ? (
            <span className="rounded-full bg-[#00D18B] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
              Final
            </span>
          ) : (
            <span className="text-sm font-medium text-zinc-400">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          {test.isFinal ? (
            <Trophy className="size-5 text-[#00D18B] transition group-hover:scale-105" />
          ) : (
            <ArrowUpRight className="size-5 text-zinc-300 transition group-hover:text-[var(--brand)]" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">{test.title}</h2>
          <p
            className={cn(
              "mt-4 text-xs font-medium uppercase tracking-wider",
              test.isFinal ? "text-[#00D18B]" : "text-[var(--brand)]",
            )}
          >
            {test.questionCount} questions
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
