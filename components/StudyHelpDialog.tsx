"use client";

import { useEffect, useId, useState } from "react";
import { Info, X } from "lucide-react";

export function StudyHelpDialog() {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        aria-label="Study mode help"
      >
        <Info className="size-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--overlay)]"
            aria-label="Close help dialog"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 max-h-[min(80vh,640px)] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                Study Mode
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  How it works
                </h3>
                <p className="mt-2">
                  Study Mode pairs each Kanji with real usage examples. Learn the concept on the left,
                  then reinforce it through sentences on the right.
                </p>
              </section>

              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Kanji Card
                </h3>
                <p className="mt-2">
                  The smaller left card shows the current Kanji. Tap to flip for reading, meaning,
                  onyomi, and kunyomi. It stays visible while you move through that Kanji’s examples.
                </p>
              </section>

              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Example Card
                </h3>
                <p className="mt-2">
                  The larger right card is the main study focus. Front shows the sentence with the
                  target Kanji highlighted. Tap or press Space to flip for reading and meaning.
                </p>
              </section>

              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Keyboard Shortcuts
                </h3>
                <dl className="mt-3 space-y-2.5">
                  {[
                    ["Space", "Flip example card"],
                    ["Shift + Space", "Flip kanji card"],
                    ["←", "Previous example"],
                    ["→", "Next example"],
                    ["R", "Restart lesson"],
                    ["S", "Shuffle groups"],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <dt className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 font-mono text-[11px] text-[var(--text-secondary)]">
                        {key}
                      </dt>
                      <dd className="text-right text-[var(--text-muted)]">{label}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
