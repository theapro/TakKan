import { ChevronLeft, ChevronRight } from "lucide-react";

export function NavigationButtons({
  current,
  total,
  previous,
  next,
}: {
  current: number;
  total: number;
  previous: () => void;
  next: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={previous}
        disabled={current === 0}
        aria-label="Previous card"
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950 disabled:pointer-events-none disabled:opacity-35 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
      >
        <ChevronLeft className="size-3.5" />
        Previous
      </button>
      <button
        type="button"
        onClick={next}
        disabled={current === total - 1}
        aria-label="Next card"
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#00D18B] px-4 text-sm font-medium text-white transition-colors hover:bg-[#00b87a] disabled:pointer-events-none disabled:opacity-35"
      >
        Next
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}
