import { useEffect, useState } from "react";

/**
 * Returns true when the current page is being rendered inside the visual
 * editor iframe (URL contains `?editor=1`). Cheap, runs once.
 */
export const useIsEditorMode = (): boolean => {
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("editor") === "1";
  });
  return enabled;
};

/**
 * Active inside the editor iframe. Adds a thin overlay highlight over the
 * element under the cursor that has a `data-edit-id`, blocks default
 * actions of links/buttons, and posts the selected id to the parent window.
 */
export const useEditorOverlay = () => {
  const enabled = useIsEditorMode();

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.setAttribute("data-editor-mode", "1");

    // ---- Highlight element under the cursor --------------------------------
    let lastEl: HTMLElement | null = null;
    const setHighlight = (el: HTMLElement | null) => {
      if (lastEl && lastEl !== el) lastEl.removeAttribute("data-editor-hover");
      if (el) el.setAttribute("data-editor-hover", "1");
      lastEl = el;
    };

    const findEditable = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      return (target.closest("[data-edit-id]") as HTMLElement) || null;
    };

    const onMove = (e: MouseEvent) => {
      const el = findEditable(e.target);
      setHighlight(el);
    };
    const onLeave = () => setHighlight(null);

    // ---- Block dynamic actions, capture selection --------------------------
    const onClickCapture = (e: MouseEvent) => {
      const el = findEditable(e.target);
      // Always prevent default navigation/submit inside editor.
      e.preventDefault();
      e.stopPropagation();
      if (el) {
        const id = el.getAttribute("data-edit-id")!;
        const rect = el.getBoundingClientRect();
        const tag = el.tagName.toLowerCase();
        window.parent?.postMessage(
          {
            __visualEditor: true,
            type: "select",
            elementId: id,
            tag,
            text: el.innerText?.slice(0, 5000) ?? "",
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          },
          "*",
        );
      } else {
        window.parent?.postMessage({ __visualEditor: true, type: "deselect" }, "*");
      }
    };

    const onSubmitCapture = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("mouseleave", onLeave, true);
    document.addEventListener("click", onClickCapture, true);
    document.addEventListener("submit", onSubmitCapture, true);

    // Inject visual styles for hover/selected outlines.
    const style = document.createElement("style");
    style.setAttribute("data-editor-style", "1");
    style.textContent = `
      [data-editor-mode="1"] * { cursor: crosshair !important; }
      [data-editor-hover="1"] {
        outline: 1.5px dashed hsl(0 78% 60% / 0.85) !important;
        outline-offset: 2px !important;
        transition: outline-color 0.12s ease;
      }
      [data-editor-selected="1"] {
        outline: 2px solid hsl(0 78% 55%) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px hsl(0 78% 52% / 0.18) !important;
      }
    `;
    document.head.appendChild(style);

    // Listen for selection acknowledgement from parent to mark the element.
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as { __visualEditor?: boolean; type?: string; elementId?: string };
      if (!data?.__visualEditor) return;
      if (data.type === "highlight") {
        document
          .querySelectorAll('[data-editor-selected="1"]')
          .forEach((n) => n.removeAttribute("data-editor-selected"));
        if (data.elementId) {
          const target = document.querySelector(
            `[data-edit-id="${CSS.escape(data.elementId)}"]`,
          ) as HTMLElement | null;
          target?.setAttribute("data-editor-selected", "1");
          target?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };
    window.addEventListener("message", onMessage);

    // Notify parent we're ready (so parent can request initial sync).
    window.parent?.postMessage({ __visualEditor: true, type: "ready" }, "*");

    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("mouseleave", onLeave, true);
      document.removeEventListener("click", onClickCapture, true);
      document.removeEventListener("submit", onSubmitCapture, true);
      window.removeEventListener("message", onMessage);
      style.remove();
      document.documentElement.removeAttribute("data-editor-mode");
    };
  }, [enabled]);
};
