export function ProgressBar({ current, total }: { current: number; total: number }) {
  const segments = Array.from({ length: total }, (_, index) => index);

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-2">
      <div
        className="flex max-w-full flex-wrap items-center justify-center gap-1"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-label="Example progress"
      >
        {segments.map((segment) => (
          <span
            key={segment}
            className={
              segment <= current
                ? "h-1.5 w-2 rounded-full bg-[var(--primary)] transition-colors duration-300 sm:w-2.5 lg:w-3"
                : "h-1.5 w-2 rounded-full bg-[var(--border)] transition-colors duration-300 sm:w-2.5 lg:w-3"
            }
          />
        ))}
      </div>
      <p className="text-xs tabular-nums text-[var(--text-muted)]">
        {current + 1} / {total}
      </p>
    </div>
  );
}
