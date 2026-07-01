import type { CSSProperties } from "react";

// Words break on a literal space (U+0020) only; a non-breaking space (U+00A0) keeps
// its neighbours in the same group, for widow prevention.
const WORD_GROUP = /[^ ]+ */g;

/**
 * Renders text as per-character reveal markup: an `aria-hidden` `.split-text` wrapper,
 * one `.inline-flex.flex-nowrap` span per word group, and one `.split-char` span per
 * character carrying the stagger custom properties the CSS animation reads —
 * `--show-char-delay = i*showStep`, `--hide-char-delay` counting `hideStep` per char
 * either forwards (`i`) or, when `hideReverse`, from the end (`n-1-i`). The hero reveals
 * at 18ms with a reversed 9ms hide; the pill nav at 24ms with a forward 12ms hide. Pair
 * with a visually-hidden copy of the full text (the caller renders the `.sr-only` span).
 */
export function SplitText({
  text,
  className,
  showStep = 18,
  hideStep = 9,
  hideReverse = true,
}: {
  text: string;
  className: string;
  showStep?: number;
  hideStep?: number;
  hideReverse?: boolean;
}) {
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
                    "--show-char-delay": `${i * showStep}ms`,
                    "--hide-char-delay": `${(hideReverse ? total - 1 - i : i) * hideStep}ms`,
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
