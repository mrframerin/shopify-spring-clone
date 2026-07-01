import type { CSSProperties } from "react";
import type { ProductMedia, MediaImage } from "../../content/types";
import { openVideoModal } from "../../../../shared/chrome/videoModalBus";

// Where the media sits: a full-bleed feature block or a grid card. The wrappers and
// the poster <img> differ between the two, so each branch has its own markup.
type Context = "feature" | "card";

/** The play button overlaid on video media; opens the shared VideoModal with this
 *  video's poster + source. */
function VideoPlayButton({ media }: { media: ProductMedia }) {
  return (
    <button
      aria-label={media.playLabel}
      aria-haspopup="dialog"
      onClick={() =>
        openVideoModal({
          transitionId: media.transitionId,
          poster: media.image.src,
          label: media.playLabel,
          src: media.videoSrc,
        })
      }
      className="video-play-trigger group flex absolute inset-0 items-center justify-center overflow-hidden outline-none"
    >
      <span className="video-play-circle relative flex items-center justify-center overflow-hidden rounded-full size-48 md:size-80 drop-shadow-[0px_8px_5px_rgba(0,0,0,0.04)] sm:not-touch-device:group-hover:drop-shadow-none group-focus-visible:ring-2 group-focus-visible:ring-theme-focus-ring">
        <span className="video-play-fill flex items-center justify-center bg-w100 sm:not-touch-device:group-hover:bg-b100 sm:group-focus-visible:bg-b100">
          <div
            className="block place-content-center place-items-center [&>svg]:mx-auto video-play-icon text-b100 sm:not-touch-device:group-hover:text-w100 sm:group-focus-visible:text-w100"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-[28px] md:size-[48px]" aria-hidden="true">
              <path
                d="M23.4 11.6536C23.6667 11.8076 23.6667 12.1925 23.4 12.3464L6.6 22.0459C6.33333 22.1999 6 22.0074 6 21.6995L6 2.30051C6 1.99259 6.33333 1.80014 6.6 1.9541L23.4 11.6536Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </span>
      </span>
    </button>
  );
}

const aspectStyle = (aspect?: string): CSSProperties | undefined =>
  aspect ? { aspectRatio: aspect } : undefined;

/** The object-center poster used by rive cards and by video blocks: the still shown
 *  before the Rive canvas / video mounts. Wrapped aria-hidden. */
function Poster({ image }: { image: MediaImage }) {
  return (
    <div className="absolute left-0 top-0 size-full block" aria-hidden="true">
      <img
        alt={image.alt}
        decoding="async"
        height={image.height}
        loading="lazy"
        sizes={image.sizes}
        src={image.src}
        srcSet={image.srcSet}
        width={image.width}
        className="block max-h-full max-w-full absolute left-0 top-0 pointer-events-none size-full object-cover object-center"
        style={{ width: "100%", ...aspectStyle(image.aspect) }}
      />
    </div>
  );
}

/** A product's media block. The wrapper structure depends on the media kind and its
 *  placement (feature vs. card); rive and video kinds render a poster still. */
export function Media({ media, context }: { media: ProductMedia; context: Context }) {
  const { kind, image, mediaAspect } = media;

  if (context === "feature") {
    const wrapperAspect =
      kind === "video" ? "sm:aspect-video" : "sm:aspect-[var(--media-aspect)]";
    return (
      <div
        className={`media-wrapper relative overflow-hidden aspect-4/3 grid place-items-center ${wrapperAspect}`}
        style={mediaAspect ? ({ "--media-aspect": mediaAspect } as CSSProperties) : undefined}
      >
        <div className={kind === "rive" ? "video-content w-full" : "video-content w-full size-full"}>
          {kind === "rive" ? (
            <div
              className="relative w-full max-w-full animate-show-media"
              style={aspectStyle(mediaAspect)}
            >
              <div
                className="relative transition-opacity duration-300 w-full max-w-full opacity-0"
                style={aspectStyle(mediaAspect)}
              >
                <div className="absolute inset-0 overflow-hidden" style={{ transformOrigin: "top left" }} />
                <div className="max-w-full animate-show-media size-full object-cover absolute top-0 left-0 pointer-events-none transition-opacity duration-200 opacity-100 h-full">
                  <img
                    alt={image.alt}
                    decoding="async"
                    height={image.height}
                    loading="lazy"
                    src={image.src}
                    srcSet={image.srcSet}
                    width={image.width}
                    style={aspectStyle(image.aspect)}
                    className="absolute left-0 top-0 size-full block object-cover"
                    draggable="false"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-full animate-show-media h-full">
                <Poster image={image} />
              </div>
              <VideoPlayButton media={media} />
            </>
          )}
        </div>
      </div>
    );
  }

  // context === "card"
  return (
    <div className="media-wrapper relative overflow-hidden aspect-4/3">
      <div className="video-content w-full size-full">
        {kind === "image" ? (
          <div className="relative w-full max-w-full animate-show-media h-full">
            <img
              alt={image.alt}
              decoding="async"
              height={image.height}
              loading="lazy"
              sizes={image.sizes}
              src={image.src}
              srcSet={image.srcSet}
              width={image.width}
              className="absolute left-0 top-0 size-full block object-cover"
              draggable="false"
              style={{ width: "100%", ...aspectStyle(image.aspect) }}
            />
          </div>
        ) : kind === "rive" ? (
          <div
            className="relative w-full max-w-full animate-show-media h-full"
          >
            <Poster image={image} />
          </div>
        ) : (
          <>
            <div className="relative w-full max-w-full animate-show-media h-full">
              <Poster image={image} />
            </div>
            <VideoPlayButton media={media} />
          </>
        )}
      </div>
    </div>
  );
}
