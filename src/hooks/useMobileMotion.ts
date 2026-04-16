import { useEffect } from "react";
import { useHomeConfig } from "@/hooks/useHomeConfig";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Returns whether decorative motion (animations + videos) should render on the
 * current device. Always `true` on desktop. On mobile/tablet (<768px) it
 * follows the admin setting `systemSettings.mobileExperience.enableAnimationsAndVideos`.
 */
export const useMobileMotionEnabled = (): boolean => {
  const isMobile = useIsMobile();
  const { data: config } = useHomeConfig();
  const enabledOnMobile =
    config?.systemSettings?.mobileExperience?.enableAnimationsAndVideos ?? true;
  if (!isMobile) return true;
  return enabledOnMobile;
};

/**
 * Side-effect hook: toggles a global `no-mobile-motion` class on <html> based
 * on the admin config. The class is read by index.css to neutralize CSS
 * animations/transitions on mobile only.
 *
 * Mount once at the app root.
 */
export const useApplyMobileMotionClass = () => {
  const { data: config } = useHomeConfig();
  const enabledOnMobile =
    config?.systemSettings?.mobileExperience?.enableAnimationsAndVideos ?? true;

  useEffect(() => {
    const root = document.documentElement;
    if (enabledOnMobile) {
      root.classList.remove("no-mobile-motion");
    } else {
      root.classList.add("no-mobile-motion");
    }
    return () => {
      // Don't strip on unmount — App is the single owner.
    };
  }, [enabledOnMobile]);
};
