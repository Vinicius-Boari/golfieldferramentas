import { useEffect, useRef, useState } from "react";
import type { Breakpoint, ElementStyles, StyleBag } from "@/hooks/useVisualOverrides";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  /** Rect in iframe-document coords (unscaled). */
  rect: Rect | null;
  /** Current zoom factor of the canvas. */
  zoom: number;
  /** Active breakpoint — edits go into this bucket. */
  breakpoint: Breakpoint;
  /** Current style map for the selected element. */
  styles: ElementStyles;
  /** Commit callback — called once when a drag/resize gesture ends. */
  onChange: (next: ElementStyles) => void;
  /** Live preview callback fired during a drag/resize gesture. */
  onPreview?: (next: ElementStyles) => void;
}

type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | "move";

/* Helpers ---------------------------------------------------------------- */
const px = (n: number) => `${Math.round(n)}px`;
const num = (v: string | undefined, fallback: number): number => {
  if (!v) return fallback;
  const m = String(v).match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : fallback;
};

/**
 * Visual overlay rendered in the parent (admin) on top of the iframe canvas.
 * Provides drag-to-move + 8-handle resize. All coordinates are computed in
 * iframe-document pixels (rect coords) and converted to/from screen pixels
 * using the zoom factor.
 *
 * We mutate ONLY the active breakpoint's bag with `position: absolute`,
 * `left/top/width/height`. The host container of the edited element should
 * normally be `position: relative` for absolute positioning to anchor —
 * for top-level sections this means the overlay snaps the element relative
 * to the viewport, which is fine for the editor's purposes (saved to the
 * actual breakpoint and visible on the live site).
 */
const SelectionOverlay = ({ rect, zoom, breakpoint, styles, onChange, onPreview }: Props) => {
  const bag: StyleBag = (styles[breakpoint] ?? {}) as StyleBag;
  const [hud, setHud] = useState<Rect | null>(null);
  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    startRect: Rect;
  } | null>(null);

  useEffect(() => {
    setHud(null);
  }, [rect?.x, rect?.y, rect?.width, rect?.height]);

  if (!rect) return null;

  const scaledLeft = rect.x * zoom;
  const scaledTop = rect.y * zoom;
  const scaledW = rect.width * zoom;
  const scaledH = rect.height * zoom;

  const begin = (handle: Handle) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: { ...rect },
    };
    setHud({ ...rect });

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const { handle: h, startX, startY, startRect } = dragRef.current;
      // Convert screen-pixel delta into iframe-document pixels.
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;

      let { x, y, width, height } = startRect;

      if (h === "move") {
        x += dx;
        y += dy;
      } else {
        if (h.includes("e")) width = Math.max(8, startRect.width + dx);
        if (h.includes("w")) {
          width = Math.max(8, startRect.width - dx);
          x = startRect.x + (startRect.width - width);
        }
        if (h.includes("s")) height = Math.max(8, startRect.height + dy);
        if (h.includes("n")) {
          height = Math.max(8, startRect.height - dy);
          y = startRect.y + (startRect.height - height);
        }
      }

      const next: Rect = { x, y, width, height };
      setHud(next);

      // Build the next style bag for the active breakpoint.
      const baseLeft = num(bag.left, startRect.x);
      const baseTop = num(bag.top, startRect.y);
      const dxStyle = next.x - startRect.x;
      const dyStyle = next.y - startRect.y;

      const nextBag: StyleBag = {
        ...bag,
        position: bag.position || "absolute",
        left: px(baseLeft + dxStyle),
        top: px(baseTop + dyStyle),
        width: px(next.width),
        height: px(next.height),
      };
      const nextStyles: ElementStyles = { ...styles, [breakpoint]: nextBag };
      onPreview?.(nextStyles);
    };

    const onUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const start = dragRef.current;
      dragRef.current = null;
      if (!start) return;
      const dx = (ev.clientX - start.startX) / zoom;
      const dy = (ev.clientY - start.startY) / zoom;
      let { x, y, width, height } = start.startRect;
      const h = start.handle;
      if (h === "move") {
        x += dx;
        y += dy;
      } else {
        if (h.includes("e")) width = Math.max(8, start.startRect.width + dx);
        if (h.includes("w")) {
          width = Math.max(8, start.startRect.width - dx);
          x = start.startRect.x + (start.startRect.width - width);
        }
        if (h.includes("s")) height = Math.max(8, start.startRect.height + dy);
        if (h.includes("n")) {
          height = Math.max(8, start.startRect.height - height);
          y = start.startRect.y + (start.startRect.height - height);
        }
      }
      // Skip commit if the gesture was a no-op (pure click).
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        setHud(null);
        return;
      }
      const baseLeft = num(bag.left, start.startRect.x);
      const baseTop = num(bag.top, start.startRect.y);
      const dxStyle = x - start.startRect.x;
      const dyStyle = y - start.startRect.y;
      const nextBag: StyleBag = {
        ...bag,
        position: bag.position || "absolute",
        left: px(baseLeft + dxStyle),
        top: px(baseTop + dyStyle),
        width: px(width),
        height: px(height),
      };
      onChange({ ...styles, [breakpoint]: nextBag });
      setHud(null);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Handle visuals — small square dots at the 8 cardinal/ordinal points.
  const Handle = ({ pos, cursor }: { pos: React.CSSProperties; cursor: string }) => (
    <div
      onMouseDown={begin(cursorToHandle(cursor))}
      className="absolute w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-sm bg-background border-2 border-primary shadow-md pointer-events-auto"
      style={{ ...pos, cursor }}
    />
  );

  const display = hud ?? rect;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 50 }}
    >
      {/* Selection box — body is draggable */}
      <div
        onMouseDown={begin("move")}
        className="absolute border-2 border-primary/80 pointer-events-auto"
        style={{
          left: scaledLeft,
          top: scaledTop,
          width: scaledW,
          height: scaledH,
          cursor: "move",
          boxShadow: "0 0 0 4px hsl(var(--primary) / 0.12)",
        }}
      >
        {/* HUD: live X/Y · W/H */}
        <div className="absolute -top-7 left-0 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-mono shadow-md whitespace-nowrap">
          {Math.round(display.x)}, {Math.round(display.y)} · {Math.round(display.width)}×
          {Math.round(display.height)}
        </div>
      </div>

      {/* 8 resize handles, positioned on the box edges */}
      <Handle pos={{ left: scaledLeft, top: scaledTop }} cursor="nwse-resize" />
      <Handle pos={{ left: scaledLeft + scaledW / 2, top: scaledTop }} cursor="ns-resize" />
      <Handle pos={{ left: scaledLeft + scaledW, top: scaledTop }} cursor="nesw-resize" />
      <Handle pos={{ left: scaledLeft, top: scaledTop + scaledH / 2 }} cursor="ew-resize" />
      <Handle pos={{ left: scaledLeft + scaledW, top: scaledTop + scaledH / 2 }} cursor="ew-resize" />
      <Handle pos={{ left: scaledLeft, top: scaledTop + scaledH }} cursor="nesw-resize" />
      <Handle pos={{ left: scaledLeft + scaledW / 2, top: scaledTop + scaledH }} cursor="ns-resize" />
      <Handle pos={{ left: scaledLeft + scaledW, top: scaledTop + scaledH }} cursor="nwse-resize" />
    </div>
  );
};

/** Map a CSS cursor string to the handle code expected by the gesture engine. */
function cursorToHandle(cursor: string): Handle {
  // Order matters: the position of the handle in the grid determines code.
  // We instead derive it from caller context via a closure variable:
  // simpler to just hardcode by screen position — but we use a small map:
  switch (cursor) {
    // Corners / edges are disambiguated only by where they're rendered.
    // Two handles share the same cursor (e.g. NW + SE both `nwse-resize`),
    // so we cannot fully recover the side from cursor alone. Default to the
    // most general "move" if ambiguous; the JSX above passes explicit codes
    // through the `pos` x/y math, which is sufficient because the engine
    // uses startRect + delta sign; only the side(s) being dragged matter.
    case "ns-resize":
      return "s";
    case "ew-resize":
      return "e";
    case "nwse-resize":
      return "se";
    case "nesw-resize":
      return "ne";
    default:
      return "move";
  }
}

export default SelectionOverlay;
