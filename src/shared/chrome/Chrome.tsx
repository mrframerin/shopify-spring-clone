import { SharedTooltip } from "./SharedTooltip";
import { PageLoader } from "./PageLoader";
import { TopNavGradient } from "./TopNavGradient";
import { SignupModal } from "./SignupModal";
import { VideoModal } from "./VideoModal";
import { BackgroundContainer } from "./BackgroundContainer";
import { PillNav } from "./PillNav";

/**
 * The page chrome that surrounds the chapters: the shared tooltip, the loading
 * cover, the top-nav gradient, the signup + video modals, the background layer, and
 * the floating pill nav.
 */
export function Chrome() {
  return (
    <>
      <SharedTooltip />
      <PageLoader />
      <TopNavGradient />
      <SignupModal />
      <VideoModal />
      <BackgroundContainer />
      <PillNav />
    </>
  );
}
