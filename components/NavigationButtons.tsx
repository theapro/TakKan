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
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950 disabled:pointer-events-none disabled:opacity-35"
      >
        <ChevronLeft className="size-3.5" />
        Previous
      </button>
      <button
        type="button"
        onClick={next}
        disabled={!canNext}
        aria-label="Next example"
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#00D18B] px-4 text-sm font-medium text-white transition-colors hover:bg-[#00b87a] disabled:pointer-events-none disabled:opacity-35"
      >
        Next
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}
