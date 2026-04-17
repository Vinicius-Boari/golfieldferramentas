import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MousePointer2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAdmin } from "@/hooks/useAdmin";
import {
  useVisualOverrides,
  useSaveVisualOverrides,
  type Breakpoint,
  type ElementStyles,
  type OverrideMap,
} from "@/hooks/useVisualOverrides";
import EditorToolbar from "@/components/admin/visual/EditorToolbar";
import PropertyPanel, { type SelectedElement } from "@/components/admin/visual/PropertyPanel";
import SelectionOverlay from "@/components/admin/visual/SelectionOverlay";

const BP_WIDTH: Record<Breakpoint, number> = {
  desktop: 1440,
  tablet: 900,
  mobile: 414,
};

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.5;

/** Deep-clone for reliable history snapshots. */
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const AdminVisual = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: savedOverrides } = useVisualOverrides();
  const saveMutation = useSaveVisualOverrides();

  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [zoom, setZoom] = useState(0.85);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  /** Live geometry of the selected element in iframe-document coords. */
  const [selectedRect, setSelectedRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  /** In-flight preview from drag/resize, NOT yet committed to history. */
  const [livePreview, setLivePreview] = useState<OverrideMap | null>(null);

  // Working copy + undo/redo history
  const [draft, setDraft] = useState<OverrideMap>({});
  const [history, setHistory] = useState<OverrideMap[]>([{}]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeReadyRef = useRef(false);

  /* ---------- Auth gate ---------- */
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Acesso negado.");
      navigate("/");
    }
  }, [adminLoading, isAdmin, navigate]);

  /* ---------- Hydrate from server once ---------- */
  useEffect(() => {
    if (savedOverrides && history.length === 1 && Object.keys(history[0]).length === 0) {
      const initial = clone(savedOverrides);
      setDraft(initial);
      setHistory([initial]);
      setHistoryIdx(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedOverrides]);

  /* ---------- Push CSS preview to iframe ---------- */
  const postPreview = (map: OverrideMap) => {
    iframeRef.current?.contentWindow?.postMessage(
      { __visualEditor: true, type: "preview", map },
      "*",
    );
  };

  /* ---------- Listen to iframe messages ---------- */
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as
        | {
            __visualEditor?: boolean;
            type?: string;
            elementId?: string;
            tag?: string;
            text?: string;
            rect?: { x: number; y: number; width: number; height: number };
          }
        | undefined;
      if (!data?.__visualEditor) return;
      if (data.type === "ready") {
        iframeReadyRef.current = true;
        postPreview(draft);
      } else if (data.type === "select" && data.elementId) {
        setSelected({
          elementId: data.elementId,
          tag: data.tag ?? "div",
          text: data.text ?? "",
        });
        if (data.rect) setSelectedRect(data.rect);
        // Echo back so the iframe marks the element as selected.
        iframeRef.current?.contentWindow?.postMessage(
          { __visualEditor: true, type: "highlight", elementId: data.elementId },
          "*",
        );
      } else if (data.type === "rect" && data.rect) {
        setSelectedRect(data.rect);
      } else if (data.type === "deselect") {
        setSelected(null);
        setSelectedRect(null);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  /* ---------- History helpers ---------- */
  const commit = (next: OverrideMap) => {
    const trimmed = history.slice(0, historyIdx + 1);
    trimmed.push(clone(next));
    setHistory(trimmed);
    setHistoryIdx(trimmed.length - 1);
    setDraft(next);
    setHasChanges(true);
    setLivePreview(null);
    postPreview(next);
    // Ask iframe for the up-to-date geometry now that styles changed.
    window.setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ __visualEditor: true, type: "requestRect" }, "*");
    }, 50);
  };

  /** Push a transient preview to the iframe without touching history. */
  const previewLive = (map: OverrideMap) => {
    setLivePreview(map);
    postPreview(map);
  };

  const undo = () => {
    if (historyIdx <= 0) return;
    const idx = historyIdx - 1;
    const snap = clone(history[idx]);
    setHistoryIdx(idx);
    setDraft(snap);
    setLivePreview(null);
    setHasChanges(JSON.stringify(snap) !== JSON.stringify(savedOverrides ?? {}));
    postPreview(snap);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const idx = historyIdx + 1;
    const snap = clone(history[idx]);
    setHistoryIdx(idx);
    setDraft(snap);
    setLivePreview(null);
    setHasChanges(JSON.stringify(snap) !== JSON.stringify(savedOverrides ?? {}));
    postPreview(snap);
  };

  /* ---------- Property edits ---------- */
  const styleForSelected: ElementStyles = useMemo(() => {
    if (!selected) return {};
    return draft[selected.elementId] ?? {};
  }, [selected, draft]);

  const handleStyleChange = (next: ElementStyles) => {
    if (!selected) return;
    const map = clone(draft);
    // Strip empty breakpoints to keep payload tidy.
    const cleaned: ElementStyles = {};
    (["desktop", "tablet", "mobile"] as Breakpoint[]).forEach((bp) => {
      if (next[bp] && Object.keys(next[bp]!).length > 0) cleaned[bp] = next[bp];
    });
    if (Object.keys(cleaned).length === 0) {
      delete map[selected.elementId];
    } else {
      map[selected.elementId] = cleaned;
    }
    commit(map);
  };

  const handleResetElement = () => {
    if (!selected) return;
    const map = clone(draft);
    const original = (savedOverrides ?? {})[selected.elementId];
    if (original) {
      map[selected.elementId] = clone(original);
    } else {
      delete map[selected.elementId];
    }
    commit(map);
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(draft);
      toast.success("Alterações visuais salvas!");
      setHasChanges(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error(msg);
    }
  };

  const handleDiscardAll = () => {
    if (!confirm("Descartar todas as alterações não salvas desta sessão?")) return;
    const baseline = clone(savedOverrides ?? {});
    setDraft(baseline);
    setHistory([baseline]);
    setHistoryIdx(0);
    setHasChanges(false);
    setLivePreview(null);
    postPreview(baseline);
    setSelected(null);
    setSelectedRect(null);
  };

  /* ---------- Drag/resize gesture wiring ----------
   * The overlay receives a full ElementStyles object (with the active
   * breakpoint already mutated). We translate that into a full OverrideMap
   * and push as either a transient preview or a committed history entry.
   */
  const buildMapFromStyles = (next: ElementStyles): OverrideMap | null => {
    if (!selected) return null;
    const map = clone(draft);
    const cleaned: ElementStyles = {};
    (["desktop", "tablet", "mobile"] as Breakpoint[]).forEach((bp) => {
      if (next[bp] && Object.keys(next[bp]!).length > 0) cleaned[bp] = next[bp];
    });
    if (Object.keys(cleaned).length === 0) {
      delete map[selected.elementId];
    } else {
      map[selected.elementId] = cleaned;
    }
    return map;
  };
  const handleOverlayPreview = (next: ElementStyles) => {
    const map = buildMapFromStyles(next);
    if (map) previewLive(map);
  };
  const handleOverlayCommit = (next: ElementStyles) => {
    const map = buildMapFromStyles(next);
    if (map) commit(map);
  };

  /* ---------- Loading state ---------- */
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }
  if (!isAdmin) return null;

  /* ---------- Layout ---------- */
  const frameWidth = BP_WIDTH[breakpoint];
  // Frame height fits the available canvas area; iframe scrolls internally.
  const frameHeight = 900;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
        <button
          onClick={() => navigate("/admin/home")}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Voltar"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="p-1.5 rounded-md bg-primary/10">
          <MousePointer2 size={14} className="text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">Editor Visual</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">Clique em qualquer elemento para editar</p>
        </div>
      </div>

      <EditorToolbar
        breakpoint={breakpoint}
        onBreakpointChange={setBreakpoint}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
        onZoomOut={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
        onZoomReset={() => setZoom(1)}
        onSave={handleSave}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIdx > 0}
        canRedo={historyIdx < history.length - 1}
        onDiscardAll={handleDiscardAll}
        onPreview={() => window.open("/", "_blank", "noopener,noreferrer")}
        saving={saveMutation.isPending}
        hasChanges={hasChanges}
      />

      {/* Main: canvas + side panel */}
      <div className="flex-1 flex min-h-0">
        {/* Canvas */}
        <div className="flex-1 relative overflow-auto bg-[hsl(0_0%_12%)]">
          <div
            className="mx-auto my-6 relative"
            style={{
              width: frameWidth * zoom,
              height: frameHeight * zoom,
            }}
          >
            <div
              style={{
                width: frameWidth,
                height: frameHeight,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
              className="rounded-xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-border bg-background"
            >
              <iframe
                ref={iframeRef}
                title="Pré-visualização do site"
                src="/?editor=1"
                style={{ width: frameWidth, height: frameHeight, border: 0, display: "block" }}
              />
            </div>
            {/* Drag/resize overlay — sits over the scaled iframe and uses
                iframe-document px * zoom for screen positioning. */}
            <SelectionOverlay
              rect={selected ? selectedRect : null}
              zoom={zoom}
              breakpoint={breakpoint}
              styles={styleForSelected}
              onChange={handleOverlayCommit}
              onPreview={handleOverlayPreview}
            />
          </div>
        </div>

        {/* Side panel */}
        <aside className="w-[340px] shrink-0 border-l border-border bg-card flex flex-col">
          <PropertyPanel
            selected={selected}
            styles={styleForSelected}
            breakpoint={breakpoint}
            onChange={handleStyleChange}
            onResetElement={handleResetElement}
          />
        </aside>
      </div>
    </div>
  );
};

export default AdminVisual;
