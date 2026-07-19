export function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--border)] px-6 py-20 text-center">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">No lessons yet</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Drop a new <span className="font-medium text-[var(--primary)]">lesson-*.json</span> file into the data folder.
      </p>
    </div>
  );
}
