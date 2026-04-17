import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, RotateCcw, X, Monitor, Tablet, Smartphone,
  MousePointer2, Eye, EyeOff, LogOut, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { CartProvider } from "@/context/CartContext";
import { toast } from "sonner";
import {
  useVisualOverrides, buildOverridesCss,
  type VisualStyles, type VisualOverride,
} from "@/hooks/useVisualOverrides";
import Index from "@/pages/Index";

/**
 * /admin/visual — Visual sandbox.
 * Renders the public site inline inside a scaled stage. Lets the admin
 * click any element marked with [data-visual-id] to adjust its scale,
 * width, height, position, padding and margin. Changes are kept local
 * (sandbox) until the admin presses Save, which persists them to the
 * `visual_overrides` table and applies them to every visitor.
 */

type Device = "desktop" | "tablet" | "mobile";
const deviceWidths: Record<Device, number> = {
  desktop: 1440,
  tablet: 820,
  mobile: 390,
};

const emptyStyles: VisualStyles = {};

const friendlyName = (id: string): string => {
  const map: Record<string, string> = {
    "hero-section": "Seção Hero (banner principal)",
    "hero-logo": "Logo do Hero",
    "hero-title": "Título do Hero",
    "products-section": "Seção de Produtos",
    "cta-section": "Seção CTA (Pronto para comprar)",
    "cta-mascot-girl": "Mascote menina (CTA)",
    "cta-mascot-boy": "Mascote menino (CTA)",
    "about-section": "Seção Sobre",
  };
  return map[id] ?? id;
};

/* -------------------------- Number / Slider field -------------------------- */
const NumberField = ({
  label, value, onChange, min, max, step = 1, suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number; max: number; step?: number; suffix?: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <span className="text-xs font-mono text-foreground">{value.toFixed(step < 1 ? 2 : 0)}{suffix}</span>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 rounded-full bg-secondary accent-primary"
      />
      <input
        type="number"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-20 px-2 py-1 rounded-lg bg-secondary/50 border border-border/50 text-xs text-right outline-none focus:border-primary/50"
      />
    </div>
  </div>
);

const TextField = ({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground block">{label}</label>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-xs outline-none focus:border-primary/50"
    />
  </div>
);

/* --------------------------------- Page --------------------------------- */
const AdminVisual = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: savedOverrides = [] } = useVisualOverrides();

  // Local sandbox map: element_id -> styles. Starts from saved DB values.
  const [drafts, setDrafts] = useState<Record<string, VisualStyles>>({});
  // Element ids that the admin explicitly disabled in this session.
  const [disabled, setDisabled] = useState<Record<string, boolean>>({});

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [pickMode, setPickMode] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const sandboxRootRef = useRef<HTMLDivElement>(null);
  const sandboxStyleRef = useRef<HTMLStyleElement | null>(null);

  // Auth gate
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Acesso negado.");
      navigate("/admin/login");
    }
  }, [adminLoading, isAdmin, navigate]);

  // Hydrate drafts from DB on first load
  useEffect(() => {
    if (savedOverrides.length === 0) return;
    setDrafts((prev) => {
      // Only seed once — don't overwrite local edits
      if (Object.keys(prev).length > 0) return prev;
      const seed: Record<string, VisualStyles> = {};
      const dis: Record<string, boolean> = {};
      for (const o of savedOverrides) {
        seed[o.element_id] = o.styles ?? {};
        dis[o.element_id] = !o.enabled;
      }
      setDisabled(dis);
      return seed;
    });
  }, [savedOverrides]);

  // Build sandbox-only CSS and inject inside the sandbox root so it doesn't
  // leak to the rest of the admin chrome.
  const sandboxCss = useMemo(() => {
    const overrides: VisualOverride[] = Object.entries(drafts).map(([id, styles]) => ({
      id, element_id: id, styles, enabled: !disabled[id],
    }));
    // Scope rules to the sandbox container so they only affect the preview.
    const raw = buildOverridesCss(overrides);
    return raw
      .split("\n")
      .map((line) => (line ? `#visual-sandbox-root ${line}` : ""))
      .join("\n");
  }, [drafts, disabled]);

  useEffect(() => {
    if (!sandboxStyleRef.current) {
      const tag = document.createElement("style");
      tag.id = "visual-sandbox-style";
      document.head.appendChild(tag);
      sandboxStyleRef.current = tag;
    }
    sandboxStyleRef.current.textContent = sandboxCss;
    return () => {
      // Keep the tag mounted while the page lives — clean up on full unmount.
    };
  }, [sandboxCss]);

  useEffect(() => {
    return () => {
      sandboxStyleRef.current?.remove();
      sandboxStyleRef.current = null;
    };
  }, []);

  // Click handler: when picking, intercept any click on a [data-visual-id] node.
  useEffect(() => {
    if (!sandboxRootRef.current) return;
    const root = sandboxRootRef.current;

    const handler = (e: MouseEvent) => {
      if (!pickMode) return;
      const target = (e.target as HTMLElement | null)?.closest?.("[data-visual-id]") as HTMLElement | null;
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      const id = target.getAttribute("data-visual-id");
      if (id) setSelectedId(id);
    };

    root.addEventListener("click", handler, true);
    return () => root.removeEventListener("click", handler, true);
  }, [pickMode]);

  // Highlight the currently-selected element with an outline.
  useEffect(() => {
    const root = sandboxRootRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-visual-id]").forEach((el) => {
      el.style.outline = "";
      el.style.outlineOffset = "";
    });
    if (selectedId) {
      const el = root.querySelector<HTMLElement>(`[data-visual-id="${selectedId}"]`);
      if (el) {
        el.style.outline = "2px solid hsl(var(--primary))";
        el.style.outlineOffset = "4px";
      }
    }
  }, [selectedId, sandboxCss]);

  // Discover all available element ids in the sandbox for the left list.
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  useEffect(() => {
    const root = sandboxRootRef.current;
    if (!root) return;
    const update = () => {
      const ids = new Set<string>();
      root.querySelectorAll("[data-visual-id]").forEach((el) => {
        const id = (el as HTMLElement).getAttribute("data-visual-id");
        if (id) ids.add(id);
      });
      setDiscoveredIds(Array.from(ids));
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  /* --------------------------- Mutations --------------------------- */
  const updateSelectedStyles = (patch: Partial<VisualStyles>) => {
    if (!selectedId) return;
    setDrafts((prev) => ({
      ...prev,
      [selectedId]: { ...(prev[selectedId] ?? {}), ...patch },
    }));
    setHasChanges(true);
  };

  const resetSelected = () => {
    if (!selectedId) return;
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[selectedId];
      return next;
    });
    setDisabled((prev) => {
      const next = { ...prev };
      delete next[selectedId];
      return next;
    });
    setHasChanges(true);
  };

  const cancelChanges = () => {
    if (!hasChanges) return;
    if (!confirm("Descartar todas as alterações não salvas?")) return;
    const seed: Record<string, VisualStyles> = {};
    const dis: Record<string, boolean> = {};
    for (const o of savedOverrides) {
      seed[o.element_id] = o.styles ?? {};
      dis[o.element_id] = !o.enabled;
    }
    setDrafts(seed);
    setDisabled(dis);
    setHasChanges(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // For each draft element, upsert a row. Empty styles + no override row -> delete.
      const rows = Object.entries(drafts).map(([element_id, styles]) => ({
        element_id,
        styles: styles as any,
        enabled: !disabled[element_id],
      }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("visual_overrides")
          .upsert(rows, { onConflict: "element_id" });
        if (error) throw error;
      }

      // Delete any saved overrides that are no longer present in drafts
      const draftIds = new Set(Object.keys(drafts));
      const stale = savedOverrides.filter((o) => !draftIds.has(o.element_id));
      if (stale.length > 0) {
        const { error } = await supabase
          .from("visual_overrides")
          .delete()
          .in("element_id", stale.map((o) => o.element_id));
        if (error) throw error;
      }

      toast.success("Alterações visuais publicadas no site!");
      setHasChanges(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------- Derived --------------------------- */
  const stageWidth = deviceWidths[device];
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState(1); // user-controlled multiplier
  const [sandboxHeight, setSandboxHeight] = useState(0);
  const stageScale = fitScale * zoom;

  useEffect(() => {
    const compute = () => {
      const wrap = stageRef.current;
      if (!wrap) return;
      const available = wrap.clientWidth - 32;
      setFitScale(Math.min(1, available / stageWidth));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [stageWidth]);

  // Track real sandbox height so we can reserve the correct (scaled) space
  // in the layout — otherwise the scaled-down site leaves a huge empty gap.
  useEffect(() => {
    const root = sandboxRootRef.current;
    if (!root) return;
    const update = () => setSandboxHeight(root.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  const currentStyles = (selectedId && drafts[selectedId]) || emptyStyles;

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate("/admin/produtos")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10"><Sparkles size={18} className="text-primary" /></div>
              <div className="min-w-0">
                <h1 className="text-base font-bold truncate">Editor Visual</h1>
                <p className="text-xs text-muted-foreground truncate">
                  Ajuste tamanho e posição dos elementos do site
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device switch */}
            <div className="hidden sm:flex items-center gap-1 rounded-xl bg-secondary/60 p-1">
              {(["desktop", "tablet", "mobile"] as Device[]).map((d) => {
                const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
                return (
                  <button key={d} onClick={() => setDevice(d)}
                    className={`p-1.5 rounded-lg transition-colors ${device === d ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>

            {/* Zoom slider */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Zoom</span>
              <input
                type="range"
                min={0.3} max={2} step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24 h-1 accent-primary"
              />
              <span className="text-xs font-mono text-foreground w-10 text-right">{Math.round(stageScale * 100)}%</span>
              <button
                onClick={() => setZoom(1)}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground p-1"
                title="Resetar zoom"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            <button onClick={() => setPickMode((p) => !p)}
              title={pickMode ? "Desativar seleção" : "Ativar seleção"}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${pickMode ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
              <MousePointer2 size={14} />
              <span className="hidden sm:inline">Selecionar</span>
            </button>

            <button onClick={cancelChanges} disabled={!hasChanges}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold disabled:opacity-40 transition-colors">
              <X size={14} /> <span className="hidden sm:inline">Cancelar</span>
            </button>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave} disabled={!hasChanges || saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 transition-colors">
              <Save size={14} /> {saving ? "Salvando..." : "Salvar e publicar"}
            </motion.button>

            <button onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Body: 3-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left list — elements */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card/40">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Elementos</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {discoveredIds.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-4">Nenhum elemento detectado ainda.</p>
            )}
            {discoveredIds.map((id) => {
              const isSelected = id === selectedId;
              const hasDraft = !!drafts[id];
              const isDisabled = !!disabled[id];
              return (
                <button key={id} onClick={() => setSelectedId(id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 ${isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}>
                  <span className="truncate">{friendlyName(id)}</span>
                  {hasDraft && !isDisabled && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  {isDisabled && <EyeOff size={12} className="text-muted-foreground shrink-0" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center stage — sandbox */}
        <main ref={stageRef} className="flex-1 min-w-0 overflow-auto bg-muted/30 p-4">
          <div
            className="mx-auto"
            style={{
              width: `${stageWidth * stageScale}px`,
              height: sandboxHeight ? `${sandboxHeight * stageScale}px` : undefined,
            }}
          >
            <div
              className="bg-background shadow-2xl rounded-xl overflow-hidden border border-border"
              style={{
                width: `${stageWidth}px`,
                transform: `scale(${stageScale})`,
                transformOrigin: "top left",
              }}
            >
              <div
                id="visual-sandbox-root"
                ref={sandboxRootRef}
                className="relative"
                style={{ width: `${stageWidth}px` }}
              >
                <div style={{ pointerEvents: pickMode ? "none" : "auto" }}>
                  <CartProvider>
                    <Index />
                  </CartProvider>
                </div>
                {pickMode && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 cursor-crosshair"
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right panel — controls for selected element. Collapses when nothing is selected to give the stage more room. */}
        <aside className={`shrink-0 border-l border-border bg-card/40 overflow-y-auto transition-[width] ${selectedId ? "w-full max-w-sm" : "w-12"}`}>
          {!selectedId ? (
            <div className="p-3 flex flex-col items-center text-center text-muted-foreground">
              <Sparkles size={18} className="text-muted-foreground/40" />
            </div>
          ) : (
            <div className="p-4 space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Editando</p>
                  <p className="text-sm font-bold truncate">{friendlyName(selectedId)}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{selectedId}</p>
                </div>
                <button onClick={() => setSelectedId(null)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                  <X size={14} />
                </button>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-2">
                  {disabled[selectedId] ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-primary" />}
                  <span className="text-xs font-medium">Override ativo</span>
                </div>
                <button
                  onClick={() => {
                    setDisabled((p) => ({ ...p, [selectedId]: !p[selectedId] }));
                    setHasChanges(true);
                  }}
                  className={`relative w-9 h-5 rounded-full transition-colors ${!disabled[selectedId] ? "bg-primary" : "bg-secondary"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${!disabled[selectedId] ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Transformação</p>
                <NumberField label="Escala" min={0.1} max={3} step={0.05}
                  value={currentStyles.scale ?? 1}
                  onChange={(n) => updateSelectedStyles({ scale: n })} />
                <NumberField label="Rotação" suffix="°" min={-180} max={180} step={1}
                  value={currentStyles.rotate ?? 0}
                  onChange={(n) => updateSelectedStyles({ rotate: n })} />
                <NumberField label="Opacidade" min={0} max={1} step={0.05}
                  value={currentStyles.opacity ?? 1}
                  onChange={(n) => updateSelectedStyles({ opacity: n })} />
              </div>

              <div className="space-y-3 pt-2 border-t border-border/50">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Tamanho</p>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Largura" placeholder="auto"
                    value={currentStyles.width ?? ""}
                    onChange={(v) => updateSelectedStyles({ width: v })} />
                  <TextField label="Altura" placeholder="auto"
                    value={currentStyles.height ?? ""}
                    onChange={(v) => updateSelectedStyles({ height: v })} />
                </div>
                <p className="text-[10px] text-muted-foreground">Aceita px, %, rem, em (ex: 320px, 100%, 20rem).</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-border/50">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Posição</p>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Mover X" placeholder="0"
                    value={currentStyles.translateX ?? ""}
                    onChange={(v) => updateSelectedStyles({ translateX: v })} />
                  <TextField label="Mover Y" placeholder="0"
                    value={currentStyles.translateY ?? ""}
                    onChange={(v) => updateSelectedStyles({ translateY: v })} />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border/50">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Espaçamento interno (padding)</p>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Topo" value={currentStyles.paddingTop ?? ""} onChange={(v) => updateSelectedStyles({ paddingTop: v })} />
                  <TextField label="Direita" value={currentStyles.paddingRight ?? ""} onChange={(v) => updateSelectedStyles({ paddingRight: v })} />
                  <TextField label="Base" value={currentStyles.paddingBottom ?? ""} onChange={(v) => updateSelectedStyles({ paddingBottom: v })} />
                  <TextField label="Esquerda" value={currentStyles.paddingLeft ?? ""} onChange={(v) => updateSelectedStyles({ paddingLeft: v })} />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border/50">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Espaçamento externo (margin)</p>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Topo" value={currentStyles.marginTop ?? ""} onChange={(v) => updateSelectedStyles({ marginTop: v })} />
                  <TextField label="Direita" value={currentStyles.marginRight ?? ""} onChange={(v) => updateSelectedStyles({ marginRight: v })} />
                  <TextField label="Base" value={currentStyles.marginBottom ?? ""} onChange={(v) => updateSelectedStyles({ marginBottom: v })} />
                  <TextField label="Esquerda" value={currentStyles.marginLeft ?? ""} onChange={(v) => updateSelectedStyles({ marginLeft: v })} />
                </div>
              </div>

              <button onClick={resetSelected}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10 transition-colors">
                <RotateCcw size={14} /> Restaurar valor original deste elemento
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdminVisual;
