"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import type { TestLesson } from "@/types";

export function TestRunner({ test }: { test: TestLesson }) {
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
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#00D18B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#00b87a]"
          >
            Qayta topshirish
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300"
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
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col px-5 py-8 sm:px-8 sm:py-10">
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

        <div className="mt-8 space-y-3">
          {question.choices.map((choice, choiceIndex) => {
            const isSelected = selected === choiceIndex;
            const isAnswer = choiceIndex === question.correctAnswer;
            let stateClass = "border-zinc-200 bg-white hover:border-zinc-300";
            if (revealed && isAnswer) stateClass = "border-[#00D18B] bg-[#e8faf3]";
            else if (revealed && isSelected && !isCorrect) stateClass = "border-red-300 bg-red-50";
            else if (isSelected) stateClass = "border-[#00D18B]/50 bg-white";

            return (
              <button
                key={`${question.id}-${choiceIndex}`}
                type="button"
                disabled={revealed}
                onClick={() => choose(choiceIndex)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition-colors disabled:cursor-default sm:text-[15px] ${stateClass}`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500">
                  {String.fromCharCode(65 + choiceIndex)}
                </span>
                <span className="min-w-0 flex-1 font-japanese leading-snug text-zinc-900">{choice}</span>
                {revealed && isAnswer ? <Check className="size-4 shrink-0 text-[#00D18B]" /> : null}
                {revealed && isSelected && !isCorrect ? <X className="size-4 shrink-0 text-red-400" /> : null}
              </button>
            );
          })}
        </div>

        {revealed ? (
          <p className="mt-5 text-sm text-zinc-500">{question.explanation}</p>
        ) : null}

        <div className="mt-auto pt-10">
          <button
            type="button"
            disabled={!revealed}
            onClick={goNext}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#00D18B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#00b87a] disabled:pointer-events-none disabled:opacity-35 sm:w-auto sm:min-w-40"
          >
            {index >= total - 1 ? "Natijani ko‘rish" : "Keyingi"}
          </button>
        </div>
      </div>
    </div>
  );
}
