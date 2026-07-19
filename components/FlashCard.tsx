"use client";

import { motion } from "framer-motion";
import type { Example, KanjiInfo } from "@/types";
import { cn } from "@/lib/utils";

type FlashCardProps =
  | {
      variant: "kanji";
      data: KanjiInfo;
      flipped: boolean;
      onFlip: () => void;
      className?: string;
    }
  | {
      variant: "example";
      data: Example;
      flipped: boolean;
      onFlip: () => void;
      className?: string;
    };

export function FlashCard(props: FlashCardProps) {
  const { flipped, onFlip, className } = props;

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={flipped ? "Show front of card" : "Show answer"}
      aria-pressed={flipped}
      className={cn(
        "h-[min(360px,40vh)] w-full cursor-pointer rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D18B]/40 focus-visible:ring-offset-2 sm:h-[380px]",
        className,
      )}
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="relative size-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-zinc-200/80 bg-white px-6 py-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backface-hidden sm:px-8">
          <span
            className={cn(
              "font-japanese text-center leading-tight tracking-tight text-zinc-950",
              props.variant === "kanji"
                ? "text-[clamp(3rem,7vw,4.5rem)]"
                : "text-[clamp(1.35rem,3.2vw,2rem)]",
            )}
          >
            {props.data.word}
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-200/80 bg-white px-6 py-8 text-center shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backface-hidden transform-[rotateY(180deg)] sm:gap-4 sm:px-8">
          {props.variant === "kanji" ? (
            <>
              <p className="font-japanese text-[clamp(1.125rem,2.4vw,1.375rem)] leading-snug text-zinc-500">
                {props.data.reading}
              </p>
              <p className="max-w-xs text-[clamp(1.15rem,2.6vw,1.5rem)] font-semibold leading-snug tracking-tight text-zinc-950">
                {props.data.meaning}
              </p>
              {(props.data.onyomi || props.data.kunyomi) && (
                <div className="mt-1 space-y-1.5 text-[12px] leading-relaxed text-zinc-400">
                  {props.data.onyomi ? (
                    <p>
                      <span className="mr-1.5 uppercase tracking-[0.14em]">On</span>
                      <span className="font-japanese text-zinc-500">{props.data.onyomi}</span>
                    </p>
                  ) : null}
                  {props.data.kunyomi ? (
                    <p>
                      <span className="mr-1.5 uppercase tracking-[0.14em]">Kun</span>
                      <span className="font-japanese text-zinc-500">{props.data.kunyomi}</span>
                    </p>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="font-japanese text-[clamp(1.05rem,2.2vw,1.25rem)] leading-snug text-zinc-500">
                {props.data.reading}
              </p>
              <p className="max-w-sm text-[clamp(1.15rem,2.6vw,1.5rem)] font-semibold leading-snug tracking-tight text-zinc-950">
                {props.data.meaning}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </button>
  );
}
