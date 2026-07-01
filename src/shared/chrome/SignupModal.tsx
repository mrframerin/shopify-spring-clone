import { useEffect, useId, useRef, useState } from "react";
import { onOpenSignupModal } from "./signupModalBus";

/**
 * The "Get notified" dialog for not-yet-available features. Opens on an
 * `openSignupModal()` request, closes on backdrop/×/Escape with scroll lock and focus
 * return. The email form validates and shows a confirming state locally without
 * POSTing anywhere.
 */
export function SignupModal() {
  const headingId = useId();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<Element | null>(null);

  useEffect(
    () =>
      onOpenSignupModal(() => {
        lastTrigger.current = document.activeElement;
        setSubmitted(false);
        setOpen(true);
      }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
      role="dialog"
      aria-labelledby={headingId}
      aria-modal="true"
      aria-hidden={!open}
      className={`fixed inset-0 w-full h-full bg-b100/70 flex items-center justify-center sm:p-12 z-[100]${open ? "" : " hidden"}`}
    >
      <button
        type="button"
        className="w-full h-full absolute top-0 left-0"
        aria-label="Close"
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
      <div
        data-color-mode="light"
        className="relative w-full max-w-[calc(100vw-24px)] sm:w-448 bg-w100 rounded-[3px] px-16 py-32 sm:p-32 text-b100"
        style={{ viewTransitionName: "signup-modal" }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-20 top-20 flex items-center justify-center rounded-[4px] outline-none focus-visible:ring-1 focus-visible:ring-theme-focus-ring forced-colors:focus-visible:outline forced-colors:focus-visible:outline-1 forced-colors:focus-visible:outline-offset-2 forced-colors:focus-visible:outline-[Highlight] size-20"
          aria-label="Close"
        >
          <div className="block place-content-center place-items-center [&>svg]:mx-auto size-13" aria-hidden="true">
            <svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M11.4598 0.146373C11.655 -0.0487994 11.9716 -0.0486195 12.1669 0.146373C12.3621 0.341635 12.3621 0.658142 12.1669 0.853404L6.86317 6.15614L12.1669 11.4598C12.3621 11.6551 12.3621 11.9716 12.1669 12.1669C11.9716 12.3621 11.6551 12.3621 11.4598 12.1669L6.15614 6.86317L0.853401 12.1669C0.658139 12.3621 0.341632 12.3621 0.14637 12.1669C-0.0486225 11.9716 -0.0488022 11.655 0.14637 11.4598L5.4491 6.15614L0.14637 0.853404C-0.0487427 0.658132 -0.0488372 0.341586 0.14637 0.146373C0.341583 -0.0488401 0.658127 -0.0487417 0.853401 0.146373L6.15614 5.44911L11.4598 0.146373Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </button>
        <div className="flex flex-col gap-23">
          <div className="flex flex-col gap-28">
            <h2 id={headingId} className="font-shopify-inter text-[32px] leading-[0.92] tracking-[-0.03em] sm:text-[40px] text-b100">
              Get notified
            </h2>
            <p className="t5 text-b90 pr-1">
              This feature will be available soon. Sign up to get notified when it&#x27;s available.
            </p>
          </div>
          {submitted ? (
            <p className="t5 text-b100" role="status">
              Thanks — we&#x27;ll let you know when it&#x27;s ready.
            </p>
          ) : (
            // Submit reflects a confirming state locally; it does not POST anywhere.
            <form
              className="flex flex-col gap-12 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Email address"
                aria-label="Email address"
                className="t5 min-w-0 flex-1 rounded-[4px] border border-b20 bg-w100 px-12 py-10 text-b100 outline-none focus-visible:ring-1 focus-visible:ring-theme-focus-ring"
              />
              <button
                type="submit"
                className="button-small rounded-full bg-b100 px-16 py-10 text-w100 outline-none focus-visible:ring-1 focus-visible:ring-theme-focus-ring"
              >
                Notify me
              </button>
            </form>
          )}
          <div>
            <div className="rich-text t6 text-b60 [&_a]:text-b100 [&_a:hover]:text-b100">
              <p>
                By signing up, you agree to receive marketing emails from Shopify. Personal data will be
                used in accordance with Shopify&#x27;s{" "}
                <a
                  className="relative link-underline visited:text-theme-link outline-none ring-offset-1 focus-visible:ring-1 focus-visible:ring-theme-focus-ring text-w70 hover:text-w100 transition-colors [--color-link-underline-hover:var(--color-link-underline)]"
                  href="https://www.shopify.com/legal/privacy?utm_source=s26-editions-website&utm_medium=product-cta&utm_campaign=spring26edition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
