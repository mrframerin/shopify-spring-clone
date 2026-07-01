import { useEffect, useRef, useState } from "react";
import { onOpenVideoModal, type VideoModalRequest } from "./videoModalBus";

/**
 * The shared video dialog opened by the play buttons on video media. Open/close,
 * backdrop + Escape dismissal, scroll lock, and focus return are all wired here; the
 * player streams the request's `src` when present, otherwise it shows the video's
 * poster (see `videoModalBus.ts`). Hidden and inert until a play button dispatches a
 * request.
 */
export function VideoModal() {
  const [request, setRequest] = useState<VideoModalRequest | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<Element | null>(null);
  const open = request !== null;

  useEffect(
    () =>
      onOpenVideoModal((req) => {
        lastTrigger.current = document.activeElement;
        setRequest(req);
      }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRequest(null);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Trap focus within the dialog.
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], video, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      (lastTrigger.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  return (
    <div
      ref={dialogRef}
      data-color-mode="dark"
      className={`fixed inset-0 z-9999 overflow-hidden${open ? "" : " hidden"}`}
      role="dialog"
      aria-modal="true"
      aria-label={request?.label ?? "Video player"}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => setRequest(null)}
        className="absolute inset-0 bg-b80"
      >
        <span className="sr-only">Close</span>
      </button>
      <div className="pointer-events-none relative flex min-h-full flex-col items-center justify-center">
        <div className="pointer-events-auto mx-auto flex w-full max-w-[1000px] flex-col items-center gap-32 px-12 sm:gap-40 sm:px-24 md:gap-24 md:px-0">
          <div className="relative w-full aspect-video overflow-hidden rounded-8 bg-b100">
            {open && request?.src ? (
              <video
                src={request.src}
                poster={request.poster}
                controls
                autoPlay
                playsInline
                className="size-full object-contain"
              />
            ) : (
              request?.poster && (
                <img src={request.poster} alt="" className="size-full object-contain" />
              )
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setRequest(null)}
            className="[text-box:normal] t5 text-theme-link visited:text-theme-link link-underline focus-visible:ring-1 focus-visible:ring-theme-focus-ring outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
