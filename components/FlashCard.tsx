"use client";

import { motion } from "framer-motion";
import type { StudyItem } from "@/types";

export function FlashCard({
  item,
  flipped,
  onFlip,
}: {
  item: StudyItem;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={flipped ? "Show front of card" : "Show answer"}
      aria-pressed={flipped}
      className="mx-auto h-[min(380px,42vh)] w-full max-w-[600px] cursor-pointer rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D18B]/40 focus-visible:ring-offset-2 sm:h-[400px]"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="relative size-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-zinc-200/80 bg-white px-10 py-12 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backface-hidden">
          <span className="font-japanese text-center text-[clamp(2.25rem,5.5vw,3.5rem)] leading-tight tracking-tight text-zinc-950">
            {item.word}
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border border-zinc-200/80 bg-white px-10 py-12 text-center shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backface-hidden transform-[rotateY(180deg)]">
          <p className="font-japanese text-[clamp(1.125rem,2.5vw,1.375rem)] leading-snug text-zinc-500">
            {item.reading}
          </p>
          <p className="max-w-sm text-[clamp(1.25rem,3vw,1.625rem)] font-semibold leading-snug tracking-tight text-zinc-950">
            {item.meaning}
          </p>
        </div>
      </motion.div>
    </button>
  );
}
