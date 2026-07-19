"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import type { TestLesson } from "@/types";
import { resolveVocabChoice, type VocabEntry } from "@/lib/vocab";

export function TestRunner({
  test,
  catalog,
}: {
  test: TestLesson;
  catalog: VocabEntry[];
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => test.questions.map(() => null),
  );
  const [finished, setFinished] = useState(false);

  const question = test.questions[index];
  const total = test.questions.length;
  const score = useMemo(
    () => answers.reduce<number>((sum, answer, i) => {
      if (answer === null) return sum;
      return sum + (answer === test.questions[i].correctAnswer ? 1 : 0);
    }, 0),
    [answers, test.questions],
  );

  const promptEntry = useMemo(
    () => resolveVocabChoice(question.word, catalog, question.word)
      ?? catalog.find((entry) => entry.word === question.word)
      ?? null,
    [catalog, question.word],
  );

  const resolvedChoices = useMemo(
    () => question.choices.map((choice) => ({
      choice,
      entry: resolveVocabChoice(choice, catalog, question.word),
    })),
    [catalog, question.choices, question.word],
  );

  const correctEntry = resolvedChoices[question.correctAnswer]?.entry ?? promptEntry;

  function choose(choiceIndex: number) {
    if (selected !== null) return;
    setSelected(choiceIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = choiceIndex;
      return next;
    });
  }

  function goNext() {
    if (index >= total - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(answers[index + 1]);
  }

  if (finished) {
    const percent = total ? Math.round((score / total) * 100) : 0;
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-5 py-10 sm:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {test.type === "kanji" ? "Kanji Test" : "Goi Test"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{test.title}</h1>
        <p className="mt-8 text-5xl font-semibold tabular-nums text-[var(--primary)]">{percent}%</p>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {score} / {total} to‘g‘ri javob
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setSelected(null);
              setAnswers(test.questions.map(() => null));
              setFinished(false);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            Qayta topshirish
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          >
            Bosh sahifa
          </Link>
        </div>
      </div>
    );
  }

  const revealed = selected !== null;
  const isCorrect = selected === question.correctAnswer;

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {test.type === "kanji" ? "Kanji" : "Goi"} · {index + 1} / {total}
          </p>
          <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--text-primary)]">{test.title}</h1>
        </div>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-300"
          style={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="mt-10 flex flex-1 flex-col">
        <p className="text-[15px] leading-relaxed text-[var(--text-primary)] sm:text-base">{question.question}</p>

        {!revealed ? (
          <div className="mt-8 space-y-3">
            {question.choices.map((choice, choiceIndex) => (
              <button
                key={`${question.id}-${choiceIndex}`}
                type="button"
                onClick={() => choose(choiceIndex)}
                className="flex min-h-11 w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left text-sm transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] sm:text-[15px]"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-medium text-[var(--text-muted)]">
                  {String.fromCharCode(65 + choiceIndex)}
                </span>
                <span className="min-w-0 flex-1 font-japanese leading-snug text-[var(--text-primary)]">{choice}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-[var(--correct-border)] bg-[var(--correct-bg)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                Correct Answer
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                {correctEntry?.meaning ?? question.choices[question.correctAnswer]}
              </p>
              {(correctEntry?.reading || promptEntry?.reading) ? (
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Reading
                  </span>
                  <span className="font-japanese">
                    {correctEntry?.reading ?? promptEntry?.reading}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              {resolvedChoices.map(({ choice, entry }, choiceIndex) => {
                const isAnswer = choiceIndex === question.correctAnswer;
                const isSelected = selected === choiceIndex;
                const word = entry?.word ?? (choice.match(/[\u3040-\u30ff\u4e00-\u9faf]/) ? choice : question.word);
                const reading = entry?.reading ?? "";
                const meaning = entry?.meaning ?? choice;

                return (
                  <div
                    key={`${question.id}-detail-${choiceIndex}`}
                    className={
                      isAnswer
                        ? "rounded-2xl border border-[var(--correct-border)] bg-[var(--correct-bg)] px-4 py-3.5"
                        : isSelected
                          ? "rounded-2xl border border-[var(--incorrect-border)] bg-[var(--incorrect-bg)] px-4 py-3.5"
                          : "rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5"
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-medium text-[var(--text-muted)] ring-1 ring-[var(--border)]">
                        {String.fromCharCode(65 + choiceIndex)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-japanese text-[15px] leading-snug text-[var(--text-primary)]">{word}</p>
                        {reading ? (
                          <p className="mt-1 font-japanese text-sm text-[var(--text-secondary)]">{reading}</p>
                        ) : null}
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{meaning}</p>
                      </div>
                      {isAnswer ? <Check className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" /> : null}
                      {isSelected && !isCorrect ? <X className="mt-0.5 size-4 shrink-0 text-red-400" /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10 pb-2">
          <button
            type="button"
            disabled={!revealed}
            onClick={goNext}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)] disabled:pointer-events-none disabled:opacity-35 sm:w-auto sm:min-w-40"
          >
            {index >= total - 1 ? "Natijani ko‘rish" : "Keyingi"}
          </button>
        </div>
      </div>
    </div>
  );
}
