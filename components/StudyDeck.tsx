"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Shuffle } from "lucide-react";
import type { KanjiGroup, Section } from "@/types";
import { FlashCard } from "@/components/FlashCard";
import { NavigationButtons } from "@/components/NavigationButtons";
import { ProgressBar } from "@/components/ProgressBar";

const STORAGE_VERSION = 3;

const slideTransition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 36 : -36,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -36 : 36,
    opacity: 0,
  }),
};

interface SavedProgress {
  version: number;
  section: Section;
  lesson: string;
  currentGroupId: string;
  exampleIndex: number;
  order: string[];
  shuffled: boolean;
}

function shuffledIds(ids: string[]) {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.length > 1 && result.every((id, index) => id === ids[index])) {
    result.push(result.shift()!);
  }
  return result;
}

export function StudyDeck({
  section,
  lesson,
  groups,
}: {
  section: Section;
  lesson: string;
  groups: KanjiGroup[];
}) {
  const originalIds = useMemo(() => groups.map((group) => String(group.id)), [groups]);
  const groupMap = useMemo(
    () => new Map(groups.map((group) => [String(group.id), group])),
    [groups],
  );

  const [order, setOrder] = useState(originalIds);
  const [groupIndex, setGroupIndex] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [kanjiFlipped, setKanjiFlipped] = useState(false);
  const [exampleFlipped, setExampleFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [ready, setReady] = useState(false);
  const storageKey = `takkan:progress:${section}:${lesson}`;

  useEffect(() => {
    let restored: Pick<SavedProgress, "order" | "currentGroupId" | "exampleIndex" | "shuffled"> | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedProgress>;
        const validOrder =
          Array.isArray(saved.order)
          && saved.order.length === originalIds.length
          && new Set(saved.order).size === originalIds.length
          && saved.order.every((id) => typeof id === "string" && groupMap.has(id));

        if (
          saved.version === STORAGE_VERSION
          && saved.section === section
          && saved.lesson === lesson
          && validOrder
        ) {
          restored = {
            order: saved.order as string[],
            currentGroupId: saved.currentGroupId ?? "",
            exampleIndex: typeof saved.exampleIndex === "number" ? saved.exampleIndex : 0,
            shuffled: saved.shuffled === true,
          };
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    }

    localStorage.setItem("takkan:last-section", section);
    localStorage.setItem(
      "takkan:last-opened",
      JSON.stringify({ version: STORAGE_VERSION, section, lesson }),
    );

    const timer = window.setTimeout(() => {
      if (restored) {
        const nextGroupIndex = Math.max(0, restored.order.indexOf(restored.currentGroupId));
        const group = groupMap.get(restored.order[nextGroupIndex]);
        const maxExample = Math.max(0, (group?.examples.length ?? 1) - 1);
        setOrder(restored.order);
        setGroupIndex(nextGroupIndex);
        setExampleIndex(Math.min(Math.max(0, restored.exampleIndex), maxExample));
        setShuffled(restored.shuffled);
      }
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [groupMap, lesson, originalIds, section, storageKey]);

  useEffect(() => {
    if (!ready) return;
    const saved: SavedProgress = {
      version: STORAGE_VERSION,
      section,
      lesson,
      currentGroupId: order[groupIndex],
      exampleIndex,
      order,
      shuffled,
    };
    localStorage.setItem(storageKey, JSON.stringify(saved));
  }, [exampleIndex, groupIndex, lesson, order, ready, section, shuffled, storageKey]);

  const currentGroup = groupMap.get(order[groupIndex]) ?? groups[0];
  const currentExample = currentGroup.examples[exampleIndex] ?? currentGroup.examples[0];
  const exampleCount = currentGroup.examples.length;
  const groupKey = order[groupIndex];
  const exampleKey = `${groupKey}:${currentExample.id}`;

  const totalExamples = useMemo(
    () => order.reduce((sum, id) => sum + (groupMap.get(id)?.examples.length ?? 0), 0),
    [groupMap, order],
  );

  const exampleProgress = useMemo(() => {
    let absolute = 0;
    for (let i = 0; i < groupIndex; i += 1) {
      absolute += groupMap.get(order[i])?.examples.length ?? 0;
    }
    return absolute + exampleIndex;
  }, [exampleIndex, groupIndex, groupMap, order]);

  const isFirst = groupIndex === 0 && exampleIndex === 0;
  const isLast = groupIndex === order.length - 1 && exampleIndex === exampleCount - 1;

  const resetFlips = useCallback(() => {
    setKanjiFlipped(false);
    setExampleFlipped(false);
  }, []);

  const goPrevious = useCallback(() => {
    setDirection(-1);
    if (exampleIndex > 0) {
      setExampleIndex((value) => value - 1);
      setExampleFlipped(false);
      return;
    }
    if (groupIndex > 0) {
      const previousGroup = groupMap.get(order[groupIndex - 1]);
      const lastExample = Math.max(0, (previousGroup?.examples.length ?? 1) - 1);
      setGroupIndex((value) => value - 1);
      setExampleIndex(lastExample);
      resetFlips();
    }
  }, [exampleIndex, groupIndex, groupMap, order, resetFlips]);

  const goNext = useCallback(() => {
    setDirection(1);
    if (exampleIndex < exampleCount - 1) {
      setExampleIndex((value) => value + 1);
      setExampleFlipped(false);
      return;
    }
    if (groupIndex < order.length - 1) {
      setGroupIndex((value) => value + 1);
      setExampleIndex(0);
      resetFlips();
    }
  }, [exampleCount, exampleIndex, groupIndex, order.length, resetFlips]);

  const restart = useCallback(() => {
    setDirection(1);
    setOrder(originalIds);
    setGroupIndex(0);
    setExampleIndex(0);
    resetFlips();
    setShuffled(false);
  }, [originalIds, resetFlips]);

  const shuffle = useCallback(() => {
    setDirection(1);
    setOrder(shuffledIds(order));
    setGroupIndex(0);
    setExampleIndex(0);
    resetFlips();
    setShuffled(true);
  }, [order, resetFlips]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select") || target?.isContentEditable) return;
      if (event.code === "Space") {
        event.preventDefault();
        if (event.shiftKey) setKanjiFlipped((value) => !value);
        else setExampleFlipped((value) => !value);
      } else if (event.key === "ArrowLeft") goPrevious();
      else if (event.key === "ArrowRight") goNext();
      else if (event.key.toLowerCase() === "r") restart();
      else if (event.key.toLowerCase() === "s") shuffle();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrevious, restart, shuffle]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col justify-center"
    >
      <div className="shrink-0 px-0.5">
        <ProgressBar current={exampleProgress} total={totalExamples} />
      </div>

      <div className="mt-4 grid w-full min-w-0 shrink-0 grid-cols-1 items-start gap-3 sm:mt-5 sm:grid-cols-[minmax(0,32fr)_minmax(0,68fr)] sm:gap-4 lg:gap-5">
        <div className="relative min-w-0 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={groupKey}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full"
            >
              <FlashCard
                variant="kanji"
                data={currentGroup.kanji}
                flipped={kanjiFlipped}
                onFlip={() => setKanjiFlipped((value) => !value)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative min-w-0 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={exampleKey}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full"
            >
              <FlashCard
                variant="example"
                data={currentExample}
                highlight={currentGroup.kanji.word}
                flipped={exampleFlipped}
                onFlip={() => setExampleFlipped((value) => !value)}
              />
              <p className="mt-2.5 text-center text-[12px] text-[var(--text-muted)]">
                Example {exampleIndex + 1} of {exampleCount}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 shrink-0 sm:mt-6">
        <NavigationButtons
          canPrevious={!isFirst}
          canNext={!isLast}
          previous={goPrevious}
          next={goNext}
        />
      </div>

      <div className="mt-3 flex shrink-0 justify-center gap-5 sm:mt-4">
        <button
          type="button"
          onClick={shuffle}
          className="inline-flex min-h-11 items-center gap-1.5 px-1 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
        >
          <Shuffle className="size-3" />
          Shuffle
        </button>
        <button
          type="button"
          onClick={restart}
          className="inline-flex min-h-11 items-center gap-1.5 px-1 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
        >
          <RotateCcw className="size-3" />
          Restart
        </button>
      </div>
    </motion.div>
  );
}
