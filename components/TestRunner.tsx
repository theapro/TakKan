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
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
          {test.type === "kanji" ? "Kanji Test" : "Goi Test"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{test.title}</h1>
        <p className="mt-8 text-5xl font-semibold tabular-nums text-[#00D18B]">{percent}%</p>
        <p className="mt-3 text-sm text-zinc-500">
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
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#00D18B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#00b87a]"
          >
            Qayta topshirish
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300"
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
    <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-col px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-zinc-700"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            {test.type === "kanji" ? "Kanji" : "Goi"} · {index + 1} / {total}
          </p>
          <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-950">{test.title}</h1>
        </div>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-[#00D18B] transition-[width] duration-300"
          style={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="mt-10 flex flex-1 flex-col">
        <p className="text-[15px] leading-relaxed text-zinc-800 sm:text-base">{question.question}</p>

        {!revealed ? (
          <div className="mt-8 space-y-3">
            {question.choices.map((choice, choiceIndex) => (
              <button
                key={`${question.id}-${choiceIndex}`}
                type="button"
                onClick={() => choose(choiceIndex)}
                className="flex min-h-11 w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-left text-sm transition-colors hover:border-zinc-300 sm:text-[15px]"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500">
                  {String.fromCharCode(65 + choiceIndex)}
                </span>
                <span className="min-w-0 flex-1 font-japanese leading-snug text-zinc-900">{choice}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-[#00D18B]/25 bg-[#e8faf3] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00b87a]">
                Correct Answer
              </p>
              <p className="mt-2 text-base font-semibold text-zinc-950">
                {correctEntry?.meaning ?? question.choices[question.correctAnswer]}
              </p>
              {(correctEntry?.reading || promptEntry?.reading) ? (
                <p className="mt-3 text-sm text-zinc-600">
                  <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
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
                        ? "rounded-2xl border border-[#00D18B] bg-[#e8faf3] px-4 py-3.5"
                        : isSelected
                          ? "rounded-2xl border border-red-200 bg-red-50/60 px-4 py-3.5"
                          : "rounded-2xl border border-zinc-200 bg-white px-4 py-3.5"
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                        {String.fromCharCode(65 + choiceIndex)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-japanese text-[15px] leading-snug text-zinc-950">{word}</p>
                        {reading ? (
                          <p className="mt-1 font-japanese text-sm text-zinc-500">{reading}</p>
                        ) : null}
                        <p className="mt-1 text-sm text-zinc-700">{meaning}</p>
                      </div>
                      {isAnswer ? <Check className="mt-0.5 size-4 shrink-0 text-[#00D18B]" /> : null}
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
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#00D18B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#00b87a] disabled:pointer-events-none disabled:opacity-35 sm:w-auto sm:min-w-40"
          >
            {index >= total - 1 ? "Natijani ko‘rish" : "Keyingi"}
          </button>
        </div>
      </div>
    </div>
  );
}
