import { useEffect } from "react";
import { useHomeConfig, DEFAULT_BACKGROUND_COLOR } from "@/hooks/useHomeConfig";

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

const hexToHsl = (hex: string): string | null => {
  const m = HEX_REGEX.exec(hex);
  if (!m) return null;
  const num = parseInt(m[1], 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${h.toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%`;
};

/**
 * Applies the admin-configured global background color by overriding
 * the `--background` CSS token at the :root level. This keeps every
 * component that uses `bg-background` perfectly in sync.
 */
export const useApplyGlobalBackground = () => {
  const { data } = useHomeConfig();
  const hex = data?.appearance?.backgroundColor || DEFAULT_BACKGROUND_COLOR;

  useEffect(() => {
    const hsl = hexToHsl(hex);
    if (!hsl) return;
    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--background");
    root.style.setProperty("--background", hsl);
    return () => {
      if (previous) root.style.setProperty("--background", previous);
      else root.style.removeProperty("--background");
    };
  }, [hex]);
};
