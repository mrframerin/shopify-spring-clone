import type { CSSProperties } from "react";

// Words break on a literal space (U+0020) only; a non-breaking space (U+00A0) keeps
// its neighbours in the same group (the original uses it for widow prevention).
const WORD_GROUP = /[^ ]+ */g;

/**
 * Renders text as the original's per-character reveal markup: an `aria-hidden`
 * `.split-text` wrapper, one `.inline-flex.flex-nowrap` span per word group, and one
 * `.split-char` span per character carrying the stagger custom properties the CSS
 * animation reads — `--show-char-delay = i*18ms`, `--hide-char-delay = (n-1-i)*9ms`.
 * Verified to reproduce the captured spans byte-for-byte. Pair with a visually-hidden
 * copy of the full text for accessibility (the caller renders the `.sr-only` span).
 */
export function SplitText({ text, className }: { text: string; className: string }) {
  const total = [...text].length;
  const groups = text.match(WORD_GROUP) ?? [];
  let index = 0;

  return (
    <span aria-hidden="true" className={className}>
      {groups.map((group, groupIndex) => (
        <span key={groupIndex} className="inline-flex flex-nowrap">
          {[...group].map((char) => {
            const i = index++;
            return (
              <span
                key={i}
                className="split-char inline-block whitespace-pre"
                style={
                  {
                    "--show-char-delay": `${i * 18}ms`,
                    "--hide-char-delay": `${(total - 1 - i) * 9}ms`,
                  } as CSSProperties
                }
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
