import { SharedTooltip } from "./SharedTooltip";
import { PageLoader } from "./PageLoader";
import { TopNavGradient } from "./TopNavGradient";
import { SignupModal } from "./SignupModal";
import { VideoModal } from "./VideoModal";
import { EngineBackground } from "../webgl/EngineBackground";
import { HeroBackground } from "../webgl/HeroBackground";
import { PillNav } from "./PillNav";
import { useEmbeddedEngine } from "../embeddedEngine";

// When the vendored engine is being served (import.meta.env.VITE_ENGINE_URL is set),
// embed it for a pixel-exact 1:1 background. Otherwise fall back to the in-repo WebGL
// reimplementation (HeroBackground).

/**
 * The page chrome that surrounds the chapters: the shared tooltip, the loading
 * cover, the top-nav gradient, the signup + video modals, the animated WebGL
 * background, and the floating pill nav.
 */
export function Chrome() {
  return (
    <>
      <SharedTooltip />
      <PageLoader />
      <TopNavGradient />
      <SignupModal />
      <VideoModal />
      {useEmbeddedEngine ? <EngineBackground /> : <HeroBackground />}
      <PillNav />
    </>
  );
}
