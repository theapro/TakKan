"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Shuffle } from "lucide-react";
import type { KanjiGroup, Section } from "@/types";
import { FlashCard } from "@/components/FlashCard";
import { NavigationButtons } from "@/components/NavigationButtons";
import { ProgressBar } from "@/components/ProgressBar";

const STORAGE_VERSION = 3;

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

  const isFirst = groupIndex === 0 && exampleIndex === 0;
  const isLast = groupIndex === order.length - 1 && exampleIndex === exampleCount - 1;

  const resetFlips = useCallback(() => {
    setKanjiFlipped(false);
    setExampleFlipped(false);
  }, []);

  const goPrevious = useCallback(() => {
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
    setOrder(originalIds);
    setGroupIndex(0);
    setExampleIndex(0);
    resetFlips();
    setShuffled(false);
  }, [originalIds, resetFlips]);

  const shuffle = useCallback(() => {
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
      className="flex min-h-0 flex-1 flex-col justify-center"
    >
      <div className="shrink-0">
        <ProgressBar current={groupIndex} total={order.length} />
      </div>

      <div className="mt-5 grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="min-w-0">
          <FlashCard
            variant="kanji"
            data={currentGroup.kanji}
            flipped={kanjiFlipped}
            onFlip={() => setKanjiFlipped((value) => !value)}
          />
        </div>
        <div className="min-w-0">
          <FlashCard
            variant="example"
            data={currentExample}
            flipped={exampleFlipped}
            onFlip={() => setExampleFlipped((value) => !value)}
          />
          <p className="mt-2.5 text-center text-[12px] text-zinc-400">
            Example {exampleIndex + 1} of {exampleCount}
          </p>
        </div>
      </div>

      <div className="mt-6 shrink-0">
        <NavigationButtons
          canPrevious={!isFirst}
          canNext={!isLast}
          previous={goPrevious}
          next={goNext}
        />
      </div>

      <div className="mt-4 flex shrink-0 justify-center gap-5">
        <button
          type="button"
          onClick={shuffle}
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 transition-colors hover:text-zinc-600"
        >
          <Shuffle className="size-3" />
          Shuffle
        </button>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 transition-colors hover:text-zinc-600"
        >
          <RotateCcw className="size-3" />
          Restart
        </button>
      </div>

      <p className="mt-3 shrink-0 text-center text-[11px] tracking-wide text-zinc-300">
        Space flip example · Shift+Space flip kanji · ← → navigate · S shuffle · R restart
      </p>
    </motion.div>
  );
}
