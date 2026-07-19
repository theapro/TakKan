"use client";

import type { Section } from "@/types";
import { cn } from "@/lib/utils";

export function TopTabs({
  value,
  onChange,
}: {
  value: Section;
  onChange: (value: Section) => void;
}) {
  return (
    <div
      className="relative inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800"
      role="tablist"
      aria-label="Sections"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-1 left-1 top-1 w-24 rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out dark:bg-zinc-700",
          "ring-1 ring-[var(--brand)]/20",
          value === "goi" && "translate-x-full",
        )}
      />
      {(["kanji", "goi"] as const).map((section) => (
        <button
          key={section}
          type="button"
          role="tab"
          aria-selected={value === section}
          onClick={() => onChange(section)}
          className={cn(
            "relative z-10 min-w-24 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
            value === section
              ? "text-[var(--brand)]"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200",
          )}
        >
          {section === "kanji" ? "Kanji" : "Goi"}
        </button>
      ))}
    </div>
  );
}
