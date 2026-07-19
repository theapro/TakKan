"use client";

import type { HomeTab } from "@/types";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "kanji", label: "Kanji" },
  { id: "goi", label: "Goi" },
  { id: "test", label: "Test" },
] as const;

export function TopTabs({
  value,
  onChange,
}: {
  value: HomeTab;
  onChange: (value: HomeTab) => void;
}) {
  const activeIndex = tabs.findIndex((tab) => tab.id === value);

  return (
    <div
      className="relative mx-auto grid w-full max-w-sm grid-cols-3 rounded-xl bg-[var(--surface-muted)] p-1 transition-colors duration-200 sm:mx-0 sm:inline-grid sm:w-auto sm:max-w-none"
      role="tablist"
      aria-label="Sections"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-[var(--surface)] shadow-sm ring-1 ring-[var(--primary)]/20 transition-transform duration-300 ease-out"
        style={{ transform: `translateX(calc(${Math.max(activeIndex, 0)} * 100%))`, left: "0.25rem" }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative z-10 min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 sm:min-w-24 sm:px-5",
            value === tab.id
              ? "text-[var(--primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
