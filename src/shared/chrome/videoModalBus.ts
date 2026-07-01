// Event bus connecting the play buttons scattered across chapter media to the single
// shared VideoModal, without threading props through the whole tree.

export interface VideoModalRequest {
  /** Ties the trigger to its modal entry. */
  transitionId?: string;
  /** The video's poster still (shown while/if the source loads). */
  poster?: string;
  /** Accessible label of the source play button, reused as the dialog's label. */
  label?: string;
  /**
   * Direct video source, when known. The per-video source is a runtime-generated
   * signed embed and may be absent; the modal falls back to the poster when unset.
   */
  src?: string;
}

const EVENT = "spring:open-video-modal";

export function openVideoModal(request: VideoModalRequest) {
  window.dispatchEvent(new CustomEvent<VideoModalRequest>(EVENT, { detail: request }));
}

export function onOpenVideoModal(handler: (request: VideoModalRequest) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<VideoModalRequest>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
