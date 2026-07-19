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

const cardFaceClass =
  "absolute inset-0 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] backface-hidden transition-shadow duration-200";

export function FlashCard(props: FlashCardProps) {
  const { flipped, onFlip, className } = props;

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={flipped ? "Show front of card" : "Show answer"}
      aria-pressed={flipped}
      className={cn(
        "group h-[min(260px,34vh)] w-full max-w-full cursor-pointer rounded-[26px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)] sm:h-[min(340px,40vh)] lg:h-[400px]",
        className,
      )}
      style={{ perspective: 1400 }}
    >
      <motion.div
        className="relative size-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <div
          className={cn(
            cardFaceClass,
            "flex items-center justify-center px-6 py-7 sm:px-8 sm:py-9 lg:px-10",
            "group-hover:shadow-[var(--shadow-card-hover)]",
          )}
        >
          <span
            className={cn(
              "max-w-full text-center font-japanese tracking-wide text-[var(--text-primary)]",
              props.variant === "kanji"
                ? "text-[clamp(3rem,12vw,5rem)] leading-none"
                : "text-[clamp(1.5rem,4.2vw,2.375rem)] leading-[1.45] break-keep",
            )}
          >
            {props.variant === "example"
              ? highlightKanji(props.data.word, props.highlight ?? "")
              : props.data.word}
          </span>
        </div>

        <div
          className={cn(
            cardFaceClass,
            "flex flex-col items-center justify-center overflow-hidden px-6 py-7 text-center [transform:rotateY(180deg)] sm:px-8 sm:py-9 lg:px-10",
            "group-hover:shadow-[var(--shadow-card-hover)]",
          )}
        >
          {props.variant === "kanji" ? (
            <div className="flex w-full max-w-xs flex-col items-center gap-3 sm:gap-4">
              <p className="font-japanese text-[clamp(1.05rem,2.8vw,1.25rem)] leading-relaxed tracking-wide text-[var(--text-secondary)]">
                {props.data.reading}
              </p>
              <p className="text-[clamp(1.05rem,2.8vw,1.35rem)] font-medium leading-snug tracking-tight text-[var(--text-primary)]">
                {props.data.meaning}
              </p>
              {(props.data.onyomi || props.data.kunyomi) ? (
                <div className="mt-1 w-full space-y-2 border-t border-[var(--border)] pt-3 text-left text-[11px] leading-relaxed text-[var(--text-muted)] sm:text-[12px]">
                  {props.data.onyomi ? (
                    <p className="flex items-baseline gap-2">
                      <span className="w-8 shrink-0 uppercase tracking-[0.14em]">On</span>
                      <span className="font-japanese text-[var(--text-secondary)]">{props.data.onyomi}</span>
                    </p>
                  ) : null}
                  {props.data.kunyomi ? (
                    <p className="flex items-baseline gap-2">
                      <span className="w-8 shrink-0 uppercase tracking-[0.14em]">Kun</span>
                      <span className="font-japanese text-[var(--text-secondary)]">{props.data.kunyomi}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex max-w-md flex-col items-center gap-3 sm:gap-4">
              <p className="font-japanese text-[clamp(1.05rem,2.6vw,1.3rem)] leading-relaxed tracking-wide text-[var(--text-secondary)]">
                {props.data.reading}
              </p>
              <p className="text-[clamp(1.15rem,2.8vw,1.5rem)] font-medium leading-snug tracking-tight text-[var(--text-primary)]">
                {props.data.meaning}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </button>
  );
}
