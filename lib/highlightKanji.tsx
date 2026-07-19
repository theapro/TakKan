import { Fragment, type ReactNode } from "react";

/**
 * Highlights every occurrence of `kanji` inside `sentence` with the brand accent.
 * Surrounding characters (including okurigana) stay uncolored.
 */
export function highlightKanji(sentence: string, kanji: string): ReactNode {
  if (!kanji || !sentence.includes(kanji)) return sentence;

  const parts = sentence.split(kanji);
  const nodes: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(<Fragment key={`text-${index}`}>{part}</Fragment>);
    }
    if (index < parts.length - 1) {
      nodes.push(
        <span key={`kanji-${index}`} className="font-semibold text-[#00D18B]">
          {kanji}
        </span>,
      );
    }
  });

  return nodes;
}
