import { useEffect, useRef, useState } from "react";

/**
 * The fixed, full-viewport hero background — rendered by embedding the vendored WebGL
 * engine (engine/spring2026) as an <iframe>, so it is pixel- and animation-exact 1:1
 * with the reference site. The engine is served at its own root by the dev/preview
 * helper server (see scripts/vite-plugin-hero-engine.mjs); its URL arrives as
 * import.meta.env.VITE_ENGINE_URL.
 *
 * The iframe sits behind all page content and never takes pointer events. The engine's
 * in-page bridge (in its index.html) hides its own chrome so only the WebGL canvas
 * shows, and reacts to the scroll/pointer we forward via postMessage. We reveal the
 * iframe only once the engine posts "engine-ready", to avoid flashing its loading state.
 */

const ENGINE_URL: string | undefined = import.meta.env.VITE_ENGINE_URL;

/** Prefer the URL as-is, but for localhost swap in the current hostname so the embed
 *  also works when the dev server is opened over the LAN. */
function resolveEngineSrc(raw: string): string {
  try {
    const u = new URL(raw);
    if ((u.hostname === "localhost" || u.hostname === "127.0.0.1") && typeof window !== "undefined") {
      u.hostname = window.location.hostname;
    }
    return u.toString();
  } catch {
    return raw;
  }
}

export function EngineBackground() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const src = ENGINE_URL ? resolveEngineSrc(ENGINE_URL) : "";
  const targetOrigin = (() => {
    try {
      return new URL(src).origin;
    } catch {
      return "*";
    }
  })();

  useEffect(() => {
    if (!src) return;
    const post = (msg: unknown) => frameRef.current?.contentWindow?.postMessage(msg, targetOrigin);

    const onMessage = (e: MessageEvent) => {
      if (e.data && (e.data as { type?: string }).type === "engine-ready") setReady(true);
    };
    window.addEventListener("message", onMessage);

    // Forward scroll + pointer to the engine, coalesced to one post per frame.
    let scrollQueued = false;
    const onScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        post({ type: "engine-scroll", y: window.scrollY || 0 });
      });
    };
    let pointerQueued = false;
    let px = 0;
    let py = 0;
    const onPointerMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (pointerQueued) return;
      pointerQueued = true;
      requestAnimationFrame(() => {
        pointerQueued = false;
        post({ type: "engine-pointer", x: px, y: py });
      });
    };
    const onPointerLeave = () => post({ type: "engine-pointer-leave" });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    // Fallback reveal in case the ready beacon is missed. The engine has its own
    // internal load-fade, so revealing the iframe a touch early only shows its (bridge-
    // hidden) loading state, never a broken frame.
    const revealTimer = window.setTimeout(() => setReady(true), 2000);

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.clearTimeout(revealTimer);
    };
  }, [src, targetOrigin]);

  if (!src) return null;

  return (
    <div id="background-container" aria-hidden="true" className="fixed inset-0 z-0 w-full h-lvh overflow-clip bg-b100 isolate">
      <iframe
        ref={frameRef}
        src={src}
        title="Spring '26 background"
        tabIndex={-1}
        scrolling="no"
        onLoad={() => setReady(true)}
        className="pointer-events-none absolute inset-0 h-full w-full border-0 transition-opacity duration-700 ease-out"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
