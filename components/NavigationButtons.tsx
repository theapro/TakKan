import { ChevronLeft, ChevronRight } from "lucide-react";

export function NavigationButtons({
  canPrevious,
  canNext,
  previous,
  next,
}: {
  canPrevious: boolean;
  canNext: boolean;
  previous: () => void;
  next: () => void;
}) {
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3">
      <button
        type="button"
        onClick={previous}
        disabled={!canPrevious}
        aria-label="Previous example"
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-35"
      >
        <ChevronLeft className="size-3.5" />
        Previous
      </button>
      <button
        type="button"
        onClick={next}
        disabled={!canNext}
        aria-label="Next example"
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-[var(--primary-hover)] disabled:pointer-events-none disabled:opacity-35"
      >
        Next
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}
