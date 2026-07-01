import { useId } from "react";
import type { TitleLink as TitleLinkData, InlineLink as InlineLinkData } from "../../content/types";

/** The link wrapping a card/feature heading. Its tooltip is exposed to assistive
 *  tech via an aria-describedby'd visually-hidden span. */
export function TitleLink({ link, children }: { link: TitleLinkData; children: string }) {
  const descId = useId();
  return (
    <>
      <a
        className="relative link-underline text-theme-link visited:text-theme-link outline-none ring-offset-1 focus-visible:ring-1 focus-visible:ring-theme-focus-ring [text-box:normal] t5 text-left"
        aria-describedby={link.tooltip ? descId : undefined}
        rel="noopener noreferrer"
        href={link.href}
        target={link.target}
      >
        {children}
      </a>
      {link.tooltip ? (
        <span id={descId} hidden>
          {link.tooltip}
        </span>
      ) : null}
    </>
  );
}

/** An inline link inside body copy. */
export function BodyLink({ link }: { link: InlineLinkData }) {
  const descId = useId();
  return (
    <>
      <a
        className="relative link-underline visited:text-theme-link outline-none ring-offset-1 focus-visible:ring-1 focus-visible:ring-theme-focus-ring text-w70 hover:text-w100 transition-colors [--color-link-underline-hover:var(--color-link-underline)]"
        aria-describedby={link.tooltip ? descId : undefined}
        href={link.href}
        target={link.target}
      >
        {link.text}
      </a>
      {link.tooltip ? (
        <span id={descId} hidden>
          {link.tooltip}
        </span>
      ) : null}
    </>
  );
}

/** A pill button CTA, e.g. "Get Shopify Inbox". */
export function CtaXxlButton({
  label,
  href,
  target,
  ariaLabel,
}: {
  label: string;
  href: string;
  target?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      target={target}
      rel="noopener noreferrer"
      className="bg-theme-cta-bg text-theme-cta-text hover:bg-theme-cta-bg-hover active:bg-theme-cta-bg-pressed rounded-full outline-none focus-visible:ring-2 focus-visible:ring-theme-cta-focus-ring transition-colors disabled:bg-theme-cta-bg-disabled disabled:text-theme-cta-text-disabled disabled:cursor-not-allowed button-small px-8 py-7 self-start"
      href={href}
      aria-label={ariaLabel}
    >
      {label}
    </a>
  );
}

/** A standalone title-style CTA below body copy (e.g. "See cashback rewards").
 *  Distinct from the heading TitleLink: it carries an aria-label, not a tooltip. */
export function CtaTitleLink({
  label,
  href,
  target,
  ariaLabel,
}: {
  label: string;
  href: string;
  target?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      target={target}
      rel="noopener noreferrer"
      className="[text-box:normal] t5 text-theme-link visited:text-theme-link link-underline focus-visible:ring-1 focus-visible:ring-theme-focus-ring outline-none self-start"
      href={href}
      aria-label={ariaLabel}
    >
      {label}
    </a>
  );
}
