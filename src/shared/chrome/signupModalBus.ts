// Event bus for the "Get notified" signup dialog. The modal ships hidden and no
// feature in the current edition wires a trigger, but coming-soon CTAs open it by
// dispatching here — keeping the modal a single shared instance.

const EVENT = "spring:open-signup-modal";

export function openSignupModal() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onOpenSignupModal(handler: () => void) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
