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

    // Helper: build a payload describing element geometry in iframe-document
    // coordinates (i.e. relative to the iframe viewport, NOT the page).
    const describe = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return {
        elementId: el.getAttribute("data-edit-id"),
        tag: el.tagName.toLowerCase(),
        text: el.innerText?.slice(0, 5000) ?? "",
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      };
    };

    // ---- Block dynamic actions, capture selection --------------------------
    const onClickCapture = (e: MouseEvent) => {
      const el = findEditable(e.target);
      // Always prevent default navigation/submit inside editor.
      e.preventDefault();
      e.stopPropagation();
      if (el) {
        window.parent?.postMessage({ __visualEditor: true, type: "select", ...describe(el) }, "*");
      } else {
        window.parent?.postMessage({ __visualEditor: true, type: "deselect" }, "*");
      }
    };

    // Re-broadcast geometry of the currently-selected element on scroll/resize
    // so the parent overlay can stay glued to it.
    const broadcastSelectedRect = () => {
      const sel = document.querySelector('[data-editor-selected="1"]') as HTMLElement | null;
      if (!sel) return;
      const rect = sel.getBoundingClientRect();
      window.parent?.postMessage(
        {
          __visualEditor: true,
          type: "rect",
          elementId: sel.getAttribute("data-edit-id"),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        },
        "*",
      );
    };
    const onScrollOrResize = () => broadcastSelectedRect();

    const onSubmitCapture = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("mouseleave", onLeave, true);
    document.addEventListener("click", onClickCapture, true);
    document.addEventListener("submit", onSubmitCapture, true);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    // Inject visual styles for hover/selected outlines.
    // The "selected" outline is intentionally subtle here because the parent
    // window draws a richer overlay (with resize handles) on top of the iframe.
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
        outline: 1px solid hsl(0 78% 55% / 0.55) !important;
        outline-offset: 1px !important;
      }
    `;
    document.head.appendChild(style);

    // Listen for selection acknowledgement from parent to mark the element.
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as {
        __visualEditor?: boolean;
        type?: string;
        elementId?: string;
      };
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
          // Send fresh geometry once scroll settles.
          window.setTimeout(broadcastSelectedRect, 350);
        }
      } else if (data.type === "requestRect") {
        broadcastSelectedRect();
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
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("message", onMessage);
      style.remove();
      document.documentElement.removeAttribute("data-editor-mode");
    };
  }, [enabled]);
};
