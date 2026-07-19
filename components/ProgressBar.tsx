export function ProgressBar({ current, total }: { current: number; total: number }) {
  const segments = Array.from({ length: total }, (_, index) => index);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex flex-wrap items-center justify-center gap-1"
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
                ? "h-1.5 w-3 rounded-full bg-[#00D18B] transition-colors duration-300"
                : "h-1.5 w-3 rounded-full bg-zinc-200 transition-colors duration-300"
            }
          />
        ))}
      </div>
      <p className="text-xs tabular-nums text-zinc-400">
        {current + 1} / {total}
      </p>
    </div>
  );
}
