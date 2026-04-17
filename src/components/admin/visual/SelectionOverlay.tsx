import { useEffect, useRef, useState } from "react";
import type { Breakpoint, ElementStyles, StyleBag } from "@/hooks/useVisualOverrides";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | "move";

interface Props {
  /** Rect of the selected element in iframe-document coords (unscaled). */
  rect: Rect | null;
  /** Current zoom factor of the canvas (e.g. 0.85). */
  zoom: number;
  /** Active breakpoint — edits go into this bucket. */
  breakpoint: Breakpoint;
  /** Current style map for the selected element. */
  styles: ElementStyles;
  /** Commit callback — fired once when a drag/resize gesture ends. */
  onChange: (next: ElementStyles) => void;
  /** Live preview callback fired during the gesture for instant feedback. */
  onPreview?: (next: ElementStyles) => void;
}

/* Helpers ---------------------------------------------------------------- */
const px = (n: number) => `${Math.round(n)}px`;
const num = (v: string | undefined, fallback: number): number => {
  if (!v) return fallback;
  const m = String(v).match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : fallback;
};

const HANDLE_CURSOR: Record<Handle, string> = {
  move: "move",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

/**
 * Visual overlay rendered in the parent (admin) on top of the iframe canvas.
 * Provides drag-to-move + 8-handle resize. Coordinates are computed in
 * iframe-document pixels and converted to/from screen pixels via `zoom`.
 *
 * Mutates ONLY the active breakpoint bag with `position/left/top/width/height`.
 */
const SelectionOverlay = ({ rect, zoom, breakpoint, styles, onChange, onPreview }: Props) => {
  const bag: StyleBag = (styles[breakpoint] ?? {}) as StyleBag;
  const [hud, setHud] = useState<Rect | null>(null);
  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    startRect: Rect;
    /** Style left/top at gesture start — used to keep saved coords stable. */
    baseLeft: number;
    baseTop: number;
  } | null>(null);

  // Reset HUD whenever a fresh selection comes in.
  useEffect(() => {
    setHud(null);
  }, [rect?.x, rect?.y, rect?.width, rect?.height]);

  if (!rect) return null;

  const scaledLeft = rect.x * zoom;
  const scaledTop = rect.y * zoom;
  const scaledW = rect.width * zoom;
  const scaledH = rect.height * zoom;

  const computeNext = (h: Handle, dx: number, dy: number, sr: Rect): Rect => {
    let { x, y, width, height } = sr;
    if (h === "move") {
      x += dx;
      y += dy;
      return { x, y, width, height };
    }
    if (h.includes("e")) width = Math.max(8, sr.width + dx);
    if (h.includes("w")) {
      width = Math.max(8, sr.width - dx);
      x = sr.x + (sr.width - width);
    }
    if (h.includes("s")) height = Math.max(8, sr.height + dy);
    if (h.includes("n")) {
      height = Math.max(8, sr.height - dy);
      y = sr.y + (sr.height - height);
    }
    return { x, y, width, height };
  };

  const begin = (handle: Handle) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const baseLeft = num(bag.left, rect.x);
    const baseTop = num(bag.top, rect.y);
    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: { ...rect },
      baseLeft,
      baseTop,
    };
    setHud({ ...rect });

    const buildBag = (next: Rect, sr: Rect): StyleBag => ({
      ...bag,
      position: bag.position || "absolute",
      left: px(baseLeft + (next.x - sr.x)),
      top: px(baseTop + (next.y - sr.y)),
      width: px(next.width),
      height: px(next.height),
    });

    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (ev.clientX - d.startX) / zoom;
      const dy = (ev.clientY - d.startY) / zoom;
      const next = computeNext(d.handle, dx, dy, d.startRect);
      setHud(next);
      onPreview?.({ ...styles, [breakpoint]: buildBag(next, d.startRect) });
    };

    const onUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      const dx = (ev.clientX - d.startX) / zoom;
      const dy = (ev.clientY - d.startY) / zoom;
      // Skip commit if the gesture was a no-op click.
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        setHud(null);
        return;
      }
      const next = computeNext(d.handle, dx, dy, d.startRect);
      onChange({ ...styles, [breakpoint]: buildBag(next, d.startRect) });
      setHud(null);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const display = hud ?? rect;

  const HandleDot = ({ code, left, top }: { code: Handle; left: number; top: number }) => (
    <div
      onMouseDown={begin(code)}
      className="absolute w-3 h-3 -ml-[6px] -mt-[6px] rounded-sm bg-background border-2 border-primary shadow-md pointer-events-auto"
      style={{ left, top, cursor: HANDLE_CURSOR[code] }}
    />
  );

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 50 }}>
      {/* Selection box — body is draggable */}
      <div
        onMouseDown={begin("move")}
        className="absolute border-2 border-primary/80 pointer-events-auto"
        style={{
          left: scaledLeft,
          top: scaledTop,
          width: scaledW,
          height: scaledH,
          cursor: HANDLE_CURSOR.move,
          boxShadow: "0 0 0 4px hsl(var(--primary) / 0.12)",
        }}
      >
        {/* Live HUD: X, Y · W × H (iframe-document px) */}
        <div className="absolute -top-7 left-0 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-mono shadow-md whitespace-nowrap">
          {Math.round(display.x)}, {Math.round(display.y)} · {Math.round(display.width)}×
          {Math.round(display.height)}
        </div>
      </div>

      {/* 8 resize handles */}
      <HandleDot code="nw" left={scaledLeft} top={scaledTop} />
      <HandleDot code="n" left={scaledLeft + scaledW / 2} top={scaledTop} />
      <HandleDot code="ne" left={scaledLeft + scaledW} top={scaledTop} />
      <HandleDot code="w" left={scaledLeft} top={scaledTop + scaledH / 2} />
      <HandleDot code="e" left={scaledLeft + scaledW} top={scaledTop + scaledH / 2} />
      <HandleDot code="sw" left={scaledLeft} top={scaledTop + scaledH} />
      <HandleDot code="s" left={scaledLeft + scaledW / 2} top={scaledTop + scaledH} />
      <HandleDot code="se" left={scaledLeft + scaledW} top={scaledTop + scaledH} />
    </div>
  );
};

export default SelectionOverlay;
