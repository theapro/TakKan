export function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-200 px-6 py-20 text-center dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">No lessons yet</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Drop a new <span className="font-medium text-[var(--brand)]">lesson-*.json</span> file into the data folder.
      </p>
    </div>
  );
}
