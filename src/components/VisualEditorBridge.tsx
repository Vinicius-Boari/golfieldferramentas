import { useEffect, useState } from "react";
import VisualOverridesStyle from "@/components/VisualOverridesStyle";
import { useEditorOverlay } from "@/hooks/useEditorMode";
import type { OverrideMap } from "@/hooks/useVisualOverrides";

/**
 * Mounted globally inside <App />. Two responsibilities:
 *   1) On the public site, render the persisted overrides so saved edits
 *      take effect everywhere automatically.
 *   2) Inside the editor iframe (?editor=1), enable the click-to-select
 *      overlay AND replace the persisted CSS with whatever the parent editor
 *      window sends via postMessage (live preview before save).
 */
const VisualEditorBridge = () => {
  // No-op outside editor mode; the hook self-gates on URL.
  useEditorOverlay();

  const isEditor = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("editor") === "1";

  const [previewMap, setPreviewMap] = useState<OverrideMap | undefined>(undefined);

  useEffect(() => {
    if (!isEditor) return;
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as { __visualEditor?: boolean; type?: string; map?: OverrideMap } | undefined;
      if (!data?.__visualEditor) return;
      if (data.type === "preview") {
        setPreviewMap(data.map ?? {});
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isEditor]);

  // Inside the editor: use the live preview map (overrides server state).
  // On the public site: pass undefined so the component falls back to the
  // persisted overrides loaded from Supabase.
  return <VisualOverridesStyle previewMap={isEditor ? previewMap ?? {} : undefined} />;
};

export default VisualEditorBridge;
