"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Shuffle } from "lucide-react";
import type { Section, StudyItem } from "@/types";
import { FlashCard } from "@/components/FlashCard";
import { NavigationButtons } from "@/components/NavigationButtons";
import { ProgressBar } from "@/components/ProgressBar";

const STORAGE_VERSION = 2;

interface SavedProgress {
  version: number;
  section: Section;
  lesson: string;
  currentId: string;
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
  items,
}: {
  section: Section;
  lesson: string;
  items: StudyItem[];
}) {
  const originalIds = useMemo(() => items.map((item) => String(item.id)), [items]);
  const itemMap = useMemo(
    () => new Map(items.map((item) => [String(item.id), item])),
    [items],
  );
  const [order, setOrder] = useState(originalIds);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [ready, setReady] = useState(false);
  const [direction, setDirection] = useState(0);
  const storageKey = `takkan:progress:${section}:${lesson}`;

  useEffect(() => {
    let restored: Pick<SavedProgress, "order" | "currentId" | "shuffled"> | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedProgress>;
        const validOrder =
          Array.isArray(saved.order)
          && saved.order.length === originalIds.length
          && new Set(saved.order).size === originalIds.length
          && saved.order.every((id) => typeof id === "string" && itemMap.has(id));
        if (
          saved.version === STORAGE_VERSION
          && saved.section === section
          && saved.lesson === lesson
          && validOrder
        ) {
          restored = {
            order: saved.order as string[],
            currentId: saved.currentId ?? "",
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
        setOrder(restored.order);
        setCurrent(Math.max(0, restored.order.indexOf(restored.currentId)));
        setShuffled(restored.shuffled);
      }
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [itemMap, lesson, originalIds, section, storageKey]);

  useEffect(() => {
    if (!ready) return;
    const saved: SavedProgress = {
      version: STORAGE_VERSION,
      section,
      lesson,
      currentId: order[current],
      order,
      shuffled,
    };
    localStorage.setItem(storageKey, JSON.stringify(saved));
  }, [current, lesson, order, ready, section, shuffled, storageKey]);

  const goPrevious = useCallback(() => {
    setDirection(-1);
    setCurrent((value) => Math.max(0, value - 1));
    setFlipped(false);
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((value) => Math.min(order.length - 1, value + 1));
    setFlipped(false);
  }, [order.length]);

  const restart = useCallback(() => {
    setOrder(originalIds);
    setCurrent(0);
    setFlipped(false);
    setShuffled(false);
  }, [originalIds]);

  const shuffle = useCallback(() => {
    setOrder(shuffledIds(order));
    setCurrent(0);
    setFlipped(false);
    setShuffled(true);
  }, [order]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select") || target?.isContentEditable) return;
      if (event.code === "Space") {
        event.preventDefault();
        setFlipped((value) => !value);
      } else if (event.key === "ArrowLeft") goPrevious();
      else if (event.key === "ArrowRight") goNext();
      else if (event.key.toLowerCase() === "r") restart();
      else if (event.key.toLowerCase() === "s") shuffle();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrevious, restart, shuffle]);

  const item = itemMap.get(order[current]) ?? items[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col justify-center"
    >
      <div className="shrink-0">
        <ProgressBar current={current} total={order.length} />
      </div>

      <div className="mt-5 flex shrink-0 justify-center">
        <motion.div
          key={order[current]}
          initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <FlashCard
            item={item}
            flipped={flipped}
            onFlip={() => setFlipped((value) => !value)}
          />
        </motion.div>
      </div>

      <div className="mt-6 shrink-0">
        <NavigationButtons
          current={current}
          total={order.length}
          previous={goPrevious}
          next={goNext}
        />
      </div>

      <div className="mt-4 flex shrink-0 justify-center gap-5">
        <button
          type="button"
          onClick={shuffle}
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <Shuffle className="size-3" />
          Shuffle
        </button>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <RotateCcw className="size-3" />
          Restart
        </button>
      </div>

      <p className="mt-3 shrink-0 text-center text-[11px] tracking-wide text-zinc-300 dark:text-zinc-600">
        Space flip · ← → navigate · S shuffle · R restart
      </p>
    </motion.div>
  );
}
