import { useEffect, useMemo, useRef } from "react";

/**
 * The rotating "Everywhere" word ring behind the hero heading. Thirty upright
 * letters — the word repeated three times — sit on a vertical-axis cylinder
 * (`rotateY(slot) translateZ(radius)`) viewed through the heading's `perspective`,
 * so the word wraps around and reads at the front as the ring turns.
 *
 * Motion (all from the reference scene): an intro spin eased from `RING_FROM_DEG`
 * to `RING_TO_DEG`, then a slow continuous ambient rotation; the whole ring is
 * tilted on X, spun further by scroll, and nudged by the pointer. Letters reveal
 * with a per-letter left-to-right `clip-path` wipe, staggered by word then letter.
 */

// Per-letter font metrics (advance width in 1000-unit em) + tracking, from the
// reference. These drive the angular width of each glyph on the ring.
const LETTERS: ReadonlyArray<{ ch: string; advance: number; tracking: number }> = [
  { ch: "E", advance: 577, tracking: -0.08 },
  { ch: "v", advance: 504, tracking: -0.08 },
  { ch: "e", advance: 520, tracking: -0.08 },
  { ch: "r", advance: 375, tracking: -0.03 },
  { ch: "y", advance: 504, tracking: -0.04 },
  { ch: "w", advance: 708, tracking: -0.08 },
  { ch: "h", advance: 564, tracking: -0.08 },
  { ch: "e", advance: 520, tracking: -0.08 },
  { ch: "r", advance: 375, tracking: -0.08 },
  { ch: "e", advance: 520, tracking: -0.08 },
];

const WORD_REPEATS = 3;
const UNITS_PER_EM = 1000;
const LETTER_SIZE_RATIO = 0.35;
const RAD_TO_DEG = 180 / Math.PI;

const RING_FROM_DEG = 102;
const RING_TO_DEG = -295;
const INTRO_DURATION_MS = 4500;
const AMBIENT_DURATION_MS = 150_000; // one full 360° turn
const INTRO_BEZIER: readonly [number, number, number, number] = [0.2, 0.9, 0.3, 0.986];
const REVEAL_BEZIER: readonly [number, number, number, number] = [0, 0, 0.58, 1];
const RING_TILT_DEG = 18;
const SCROLL_SPIN_DEG_PER_PX = 0.12;
const SCROLL_Y_PER_PX = 0.01;
const POINTER_X_ROTATION_DEG = 18;
const POINTER_DAMPING = 8;

const WORD_STAGGER_MS = 600;
const LETTER_STAGGER_MS = 55;
const SLIDE_DURATION_MS = 650;
const WIPE_DURATION_MS = 300;
const REVEAL_SWEEP_DEG = 14;
// Intro pre-roll: the original offsets its timeline by this before the spin/reveal begin.
const INTRO_START_DELAY_MS = 1300;

/** Cubic-bezier easing solved for y at a given x (Newton + bisection fallback). */
function cubicBezier([x1, y1, x2, y2]: readonly [number, number, number, number]) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-4) return sampleY(t);
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const mid = sampleX(t);
      if (Math.abs(mid - x) < 1e-4) break;
      if (mid < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

interface Glyph {
  ch: string;
  slot: number; // resting angle on the ring (deg)
  wordIndex: number;
  letterIndex: number;
}

/** Distribute the three words evenly around 360°, centering each letter on its
 *  advance and splitting the leftover as equal gaps between words (the `Q0` math). */
function layoutGlyphs(): Glyph[] {
  const widths = LETTERS.map(
    (l) => (l.advance / UNITS_PER_EM + l.tracking) * LETTER_SIZE_RATIO * RAD_TO_DEG,
  );
  const wordSpan = widths.reduce((a, b) => a + b, 0);
  const gap = (360 - WORD_REPEATS * wordSpan) / WORD_REPEATS;
  const glyphs: Glyph[] = [];
  let cursor = 0;
  for (let w = 0; w < WORD_REPEATS; w++) {
    cursor += gap / 2;
    for (let i = 0; i < LETTERS.length; i++) {
      cursor += widths[i] / 2;
      glyphs.push({ ch: LETTERS[i].ch, slot: cursor, wordIndex: w, letterIndex: i });
      cursor += widths[i] / 2;
    }
    cursor += gap / 2;
  }
  return glyphs;
}

export function HeroRing() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<HTMLSpanElement[]>([]);
  const glyphs = useMemo(layoutGlyphs, []);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introEase = cubicBezier(INTRO_BEZIER);
    const revealEase = cubicBezier(REVEAL_BEZIER);

    let pointerTarget = 0;
    let pointerCurrent = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointerTarget = (e.clientX / window.innerWidth - 0.5) * 2 * POINTER_X_ROTATION_DEG;
    };
    if (!reduced) window.addEventListener("pointermove", onPointerMove, { passive: true });

    let raf = 0;
    let startTime = 0;
    let lastTime = 0;

    const introSpin = (t: number) => {
      if (t <= 0) return RING_FROM_DEG;
      if (t < INTRO_DURATION_MS) {
        return RING_FROM_DEG + (RING_TO_DEG - RING_FROM_DEG) * introEase(t / INTRO_DURATION_MS);
      }
      return RING_TO_DEG - 360 * ((t - INTRO_DURATION_MS) / AMBIENT_DURATION_MS);
    };

    const frame = (now: number) => {
      if (!startTime) {
        startTime = now;
        lastTime = now;
      }
      const t = now - startTime;
      const introT = t - INTRO_START_DELAY_MS; // spin + reveal begin after the pre-roll
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      const scrollY = window.scrollY || 0;
      const scrollSpin = -scrollY * SCROLL_SPIN_DEG_PER_PX;

      if (reduced) {
        outer.style.transform = `rotateX(${RING_TILT_DEG}deg)`;
        inner.style.transform = `rotateY(${RING_TO_DEG + scrollSpin}deg)`;
      } else {
        // Pointer tilt eased with exponential damping.
        pointerCurrent += (pointerTarget - pointerCurrent) * (1 - Math.exp(-POINTER_DAMPING * dt));
        outer.style.transform = `translateY(${scrollY * SCROLL_Y_PER_PX * -1}px) rotateX(${RING_TILT_DEG}deg)`;
        inner.style.transform = `rotateY(${introSpin(introT) + scrollSpin + pointerCurrent}deg)`;

        // Per-letter reveal: slide-in on the ring + left-to-right clip wipe.
        for (let g = 0; g < glyphs.length; g++) {
          const el = letterRefs.current[g];
          if (!el) continue;
          const { slot, wordIndex, letterIndex } = glyphs[g];
          const wordStart = wordIndex * WORD_STAGGER_MS;
          const slideT = revealEase(Math.min(Math.max((introT - wordStart) / SLIDE_DURATION_MS, 0), 1));
          const offset = -REVEAL_SWEEP_DEG * (1 - slideT);
          const wipeStart = wordStart + letterIndex * LETTER_STAGGER_MS;
          const wipeT = revealEase(Math.min(Math.max((introT - wipeStart) / WIPE_DURATION_MS, 0), 1));
          el.style.transform = `translate(-50%, -50%) rotateY(${slot + offset}deg) translateZ(var(--hero-ring-radius))`;
          el.style.clipPath = `inset(0 ${(1 - wipeT) * 100}% 0 0)`;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [glyphs]);

  return (
    <div className="relative h-full w-full [transform-style:preserve-3d]">
      <div
        ref={outerRef}
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${RING_TILT_DEG}deg)` }}
      >
        <div ref={innerRef} className="absolute inset-0 [transform-style:preserve-3d]">
          {glyphs.map((g, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) letterRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 block font-medium leading-none text-white [backface-visibility:hidden] [transform-origin:center]"
              style={{
                fontSize: "var(--hero-ring-letter-size)",
                transform: `translate(-50%, -50%) rotateY(${g.slot - REVEAL_SWEEP_DEG}deg) translateZ(var(--hero-ring-radius))`,
                clipPath: "inset(0 100% 0 0)",
              }}
            >
              {g.ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
