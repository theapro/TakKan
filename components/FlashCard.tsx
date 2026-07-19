"use client";

import { motion } from "framer-motion";
import type { Example, KanjiInfo } from "@/types";
import { highlightKanji } from "@/lib/highlightKanji";
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
      highlight?: string;
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
        "h-[min(250px,32vh)] w-full max-w-full cursor-pointer rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D18B]/40 focus-visible:ring-offset-2 sm:h-[min(320px,38vh)] lg:h-[380px]",
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
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-zinc-200/80 bg-white px-5 py-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backface-hidden sm:px-6 sm:py-8 lg:px-8">
          <span
            className={cn(
              "max-w-full break-words font-japanese text-center leading-tight tracking-tight text-zinc-950",
              props.variant === "kanji"
                ? "text-[clamp(2.5rem,11vw,4.5rem)]"
                : "text-[clamp(1.15rem,4.5vw,2rem)]",
            )}
          >
            {props.variant === "example"
              ? highlightKanji(props.data.word, props.highlight ?? "")
              : props.data.word}
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white px-5 py-6 text-center shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backface-hidden transform-[rotateY(180deg)] sm:gap-3 sm:px-6 sm:py-8 lg:gap-4 lg:px-8">
          {props.variant === "kanji" ? (
            <>
              <p className="font-japanese text-[clamp(1rem,3.5vw,1.375rem)] leading-snug text-zinc-500">
                {props.data.reading}
              </p>
              <p className="max-w-xs text-[clamp(1.05rem,3.2vw,1.5rem)] font-semibold leading-snug tracking-tight text-zinc-950">
                {props.data.meaning}
              </p>
              {(props.data.onyomi || props.data.kunyomi) && (
                <div className="mt-1 space-y-1.5 text-[11px] leading-relaxed text-zinc-400 sm:text-[12px]">
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
              <p className="font-japanese text-[clamp(0.95rem,3vw,1.25rem)] leading-snug text-zinc-500">
                {props.data.reading}
              </p>
              <p className="max-w-sm text-[clamp(1.05rem,3.2vw,1.5rem)] font-semibold leading-snug tracking-tight text-zinc-950">
                {props.data.meaning}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </button>
  );
}
