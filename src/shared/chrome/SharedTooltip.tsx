/**
 * The single shared tooltip surface used across the page; the interaction layer sets
 * its text and position, and it renders empty and hidden while inactive.
 */
export function SharedTooltip() {
  return (
    <div aria-hidden="true" data-visible="false" className="shared-tooltip">
      <span className="shared-tooltip__track grid overflow-hidden">
        <span className="relative block min-w-0 whitespace-nowrap">
          <span className="shared-tooltip__text block whitespace-nowrap" />
          <span className="shared-tooltip__text absolute inset-0 block whitespace-nowrap opacity-0" />
        </span>
      </span>
      <span aria-hidden="true" className="invisible absolute left-0 top-0 whitespace-nowrap" />
      <span
        aria-hidden="true"
        className="shared-tooltip__arrow pointer-events-none absolute left-1/2 z-20 block size-14 -translate-x-1/2 bg-white"
      />
    </div>
  );
}
