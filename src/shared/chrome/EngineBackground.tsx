import { useEffect, useRef } from "react";

/**
 * The 3D scene is a full React Router + Three.js/Theatre.js/Rive/Lenis app that only
 * boots correctly when served from its own origin, so it runs in a fixed background
 * `<iframe>` behind our content. A bridge script on that origin hides the iframe's own
 * foreground and drives its scroll from the messages we post in, so only the WebGL
 * canvas shows through.
 *
 * Enabled by setting `VITE_ENGINE_URL` to the scene's origin, e.g.
 * `VITE_ENGINE_URL=http://localhost:3001/ca/editions/spring2026`. When unset, `Chrome`
 * renders the empty `#background-container` canvas layer instead.
 *
 * The iframe is `pointer-events:none` so our content stays clickable, which means
 * pointer input can't reach the scene directly. We forward it: the parent's
 * `pointermove` position is posted in and the bridge re-dispatches it on the scene's
 * window, so the hero reacts to the cursor (the iframe is full-viewport, so coordinates
 * map directly).
 */
export function EngineBackground({ url }: { url: string }) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const win = () => frame.current?.contentWindow ?? null;
    const post = () => win()?.postMessage({ type: "engine-scroll", y: window.scrollY }, "*");

    let scrollRaf = 0;
    const onScroll = () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(post);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Forward cursor position so the engine's pointer-driven parallax reacts.
    let pointerRaf = 0;
    let px = 0;
    let py = 0;
    const flushPointer = () => win()?.postMessage({ type: "engine-pointer", x: px, y: py }, "*");
    const onPointerMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      cancelAnimationFrame(pointerRaf);
      pointerRaf = requestAnimationFrame(flushPointer);
    };
    const onPointerLeave = () => win()?.postMessage({ type: "engine-pointer-leave" }, "*");
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    // push the current scroll once the engine signals it's ready (and as a fallback)
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "engine-ready") post();
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("message", onMessage);
      cancelAnimationFrame(scrollRaf);
      cancelAnimationFrame(pointerRaf);
    };
  }, []);

  return (
    <iframe
      ref={frame}
      src={url}
      title=""
      aria-hidden="true"
      tabIndex={-1}
      scrolling="no"
      className="fixed inset-0 z-0 h-lvh w-full border-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
}
