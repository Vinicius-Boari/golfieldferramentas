import { useMemo } from "react";
import { useVisualOverrides, styleBagToCss, type OverrideMap } from "@/hooks/useVisualOverrides";

/**
 * Injects a global <style> tag that applies saved per-element CSS overrides
 * to any element in the page that has a matching `data-edit-id` attribute.
 *
 * Mounted globally on the public site so saved edits show up everywhere,
 * and also passed (as a `previewMap`) by the visual editor to render
 * unsaved-but-pending changes.
 */
const buildCss = (map: OverrideMap): string => {
  const desktop: string[] = [];
  const tablet: string[] = [];
  const mobile: string[] = [];

  for (const [elementId, styles] of Object.entries(map)) {
    const sel = `[data-edit-id="${CSS.escape(elementId)}"]`;
    const d = styleBagToCss(styles.desktop);
    const t = styleBagToCss(styles.tablet);
    const m = styleBagToCss(styles.mobile);
    if (d) desktop.push(`${sel} { ${d} }`);
    if (t) tablet.push(`${sel} { ${t} }`);
    if (m) mobile.push(`${sel} { ${m} }`);
  }

  return [
    desktop.join("\n"),
    tablet.length ? `@media (max-width: 1023px) and (min-width: 768px) {\n${tablet.join("\n")}\n}` : "",
    mobile.length ? `@media (max-width: 767px) {\n${mobile.join("\n")}\n}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

interface Props {
  /** When provided, used INSTEAD of the persisted overrides — for live preview in the editor. */
  previewMap?: OverrideMap;
}

const VisualOverridesStyle = ({ previewMap }: Props) => {
  const { data } = useVisualOverrides();
  const map = previewMap ?? data ?? {};
  const css = useMemo(() => buildCss(map), [map]);
  if (!css) return null;
  return <style data-visual-overrides="true">{css}</style>;
};

export default VisualOverridesStyle;
