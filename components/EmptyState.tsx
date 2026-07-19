export function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-200 px-6 py-20 text-center">
      <h2 className="text-lg font-semibold text-zinc-950">No lessons yet</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Drop a new <span className="font-medium text-[var(--brand)]">lesson-*.json</span> file into the data folder.
      </p>
    </div>
  );
}
