import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, RotateCcw, Save, Undo2, Redo2, Eye, X } from "lucide-react";
import type { Breakpoint } from "@/hooks/useVisualOverrides";

interface Props {
  breakpoint: Breakpoint;
  onBreakpointChange: (bp: Breakpoint) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDiscardAll: () => void;
  onPreview: () => void;
  saving: boolean;
  hasChanges: boolean;
}

const bpButtons: { id: Breakpoint; icon: typeof Monitor; label: string }[] = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

const EditorToolbar = ({
  breakpoint,
  onBreakpointChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDiscardAll,
  onPreview,
  saving,
  hasChanges,
}: Props) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/95 backdrop-blur">
      {/* Breakpoint switcher */}
      <div className="flex items-center gap-0.5 rounded-lg bg-secondary/60 p-0.5">
        {bpButtons.map((b) => {
          const Icon = b.icon;
          const active = breakpoint === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onBreakpointChange(b.id)}
              title={b.label}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{b.label}</span>
            </button>
          );
        })}
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button onClick={onZoomOut} title="Diminuir zoom" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ZoomOut size={14} />
        </button>
        <button onClick={onZoomReset} title="Resetar zoom" className="px-2 py-1 rounded-md hover:bg-secondary text-xs font-medium tabular-nums min-w-[3.25rem] text-center">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={onZoomIn} title="Aumentar zoom" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ZoomIn size={14} />
        </button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Undo / redo */}
      <button onClick={onUndo} disabled={!canUndo} title="Desfazer" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <Undo2 size={14} />
      </button>
      <button onClick={onRedo} disabled={!canRedo} title="Refazer" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <Redo2 size={14} />
      </button>

      <div className="flex-1" />

      {/* Preview opens the live site in a new tab */}
      <button onClick={onPreview} title="Abrir site real em nova aba" className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
        <Eye size={14} /> Visualizar site
      </button>

      <button
        onClick={onDiscardAll}
        disabled={!hasChanges || saving}
        title="Descartar alterações não salvas"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
      >
        <X size={14} /> Cancelar
      </button>

      <button
        onClick={onSave}
        disabled={!hasChanges || saving}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Save size={14} />
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
};

export default EditorToolbar;
