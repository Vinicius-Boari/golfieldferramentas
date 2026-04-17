import { useState, useEffect, useRef } from "react";
import { RotateCcw, Check, Copy, Palette, ArrowDownUp } from "lucide-react";
import { toast } from "sonner";
import {
  type AppearanceConfig,
  type SectionTransitionConfig,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_HERO_BACKGROUND_COLOR,
  DEFAULT_HEADER_BACKGROUND_COLOR,
  DEFAULT_SECTION_TRANSITION,
} from "@/hooks/useHomeConfig";

interface Props {
  value: AppearanceConfig;
  onChange: (next: AppearanceConfig) => void;
}

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

const normalizeHex = (input: string): string | null => {
  let v = input.trim();
  if (!v) return null;
  if (!v.startsWith("#")) v = `#${v}`;
  const short = /^#([0-9A-Fa-f]{3})$/.exec(v);
  if (short) {
    v = `#${short[1]
      .split("")
      .map((c) => c + c)
      .join("")}`;
  }
  if (!HEX_REGEX.test(v)) return null;
  return v.toUpperCase();
};

interface ColorEditorProps {
  title: string;
  description: string;
  value: string;
  defaultValue: string;
  onApply: (hex: string) => void;
}

const ColorEditor = ({
  title,
  description,
  value,
  defaultValue,
  onApply,
}: ColorEditorProps) => {
  const current = value || defaultValue;
  const [draft, setDraft] = useState<string>(current);
  const [error, setError] = useState<string>("");
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Track the last externally-applied value so the "Cancel" button
  // can revert local edits without affecting other fields.
  const lastAppliedRef = useRef<string>(current);

  useEffect(() => {
    setDraft(current);
    setError("");
    lastAppliedRef.current = current;
  }, [current]);

  const apply = (hex: string) => {
    lastAppliedRef.current = hex;
    onApply(hex);
  };

  const handleHexChange = (raw: string) => {
    setDraft(raw);
    const normalized = normalizeHex(raw);
    if (normalized) {
      setError("");
      apply(normalized);
    } else {
      setError("Código HEX inválido. Use formato #RRGGBB.");
    }
  };

  const handlePickerChange = (hex: string) => {
    const upper = hex.toUpperCase();
    setDraft(upper);
    setError("");
    apply(upper);
  };

  const handleCancel = () => {
    setDraft(lastAppliedRef.current);
    setError("");
  };

  const handleReset = () => {
    setDraft(defaultValue);
    setError("");
    apply(defaultValue);
    toast.success(`Cor padrão restaurada (${defaultValue}).`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current);
      toast.success(`Copiado: ${current}`);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const pickerValue = HEX_REGEX.test(current) ? current : defaultValue;

  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/20 p-5 space-y-5">
      <div>
        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Live preview */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          className="relative w-full sm:w-40 h-28 rounded-xl border border-border/60 overflow-hidden shadow-inner transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{ backgroundColor: pickerValue }}
          aria-label="Abrir seletor de cor"
        >
          <span className="absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/40 text-white tracking-wider uppercase">
            Pré-visualização
          </span>
        </button>

        <div className="flex-1 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Cor atual
            </label>
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-lg border border-border/60 shrink-0"
                style={{ backgroundColor: pickerValue }}
              />
              <code className="flex-1 px-3 py-2 rounded-lg bg-background/60 border border-border/40 text-sm font-mono">
                {current}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                title="Copiar HEX"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Seletor visual
          </label>
          <input
            ref={colorInputRef}
            type="color"
            value={pickerValue}
            onChange={(e) => handlePickerChange(e.target.value)}
            className="w-14 h-11 rounded-xl border border-border/60 bg-secondary/40 cursor-pointer p-1"
            aria-label="Seletor visual de cor"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Código HEX
          </label>
          <div className="relative">
            <input
              type="text"
              value={draft}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder={defaultValue}
              spellCheck={false}
              autoComplete="off"
              maxLength={7}
              className={`w-full px-3 py-2.5 rounded-xl bg-background/60 border text-sm font-mono outline-none transition-colors ${
                error
                  ? "border-destructive/60 focus:border-destructive"
                  : "border-border/60 focus:border-primary/60"
              }`}
            />
            {!error && HEX_REGEX.test(draft) && (
              <Check
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
              />
            )}
          </div>
          {error ? (
            <p className="mt-1.5 text-xs text-destructive">{error}</p>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Aceita formato <code className="font-mono">#RRGGBB</code>.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCcw size={13} />
          Restaurar padrão ({defaultValue})
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          Cancelar edição
        </button>
      </div>
    </div>
  );
};

interface SectionTransitionEditorProps {
  value: SectionTransitionConfig;
  onChange: (next: SectionTransitionConfig) => void;
}

const SectionTransitionEditor = ({ value, onChange }: SectionTransitionEditorProps) => {
  const current = { ...DEFAULT_SECTION_TRANSITION, ...value };
  // local snapshot for "Cancelar" — restores last applied values
  const lastAppliedRef = useRef<SectionTransitionConfig>(current);

  useEffect(() => {
    lastAppliedRef.current = current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    current.enabled,
    current.fromColor,
    current.toColor,
    current.direction,
    current.height,
    current.intensity,
  ]);

  const apply = (patch: Partial<SectionTransitionConfig>) => {
    const next = { ...current, ...patch };
    lastAppliedRef.current = next;
    onChange(next);
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_SECTION_TRANSITION });
    toast.success("Degradê de transição restaurado para o padrão.");
  };

  const handleCancel = () => {
    onChange({ ...lastAppliedRef.current });
    toast.message("Edição cancelada.");
  };

  const HexInput = ({
    label,
    hex,
    onApplyHex,
  }: {
    label: string;
    hex: string;
    onApplyHex: (h: string) => void;
  }) => {
    const [draft, setDraft] = useState(hex);
    const [error, setError] = useState("");
    const colorRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setDraft(hex);
      setError("");
    }, [hex]);

    const handleHex = (raw: string) => {
      setDraft(raw);
      const n = normalizeHex(raw);
      if (n) {
        setError("");
        onApplyHex(n);
      } else {
        setError("HEX inválido (#RRGGBB).");
      }
    };

    const pickerValue = HEX_REGEX.test(hex) ? hex : "#000000";

    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground block">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => colorRef.current?.click()}
            className="w-11 h-11 rounded-xl border border-border/60 shrink-0 shadow-inner"
            style={{ backgroundColor: pickerValue }}
            aria-label={`Abrir seletor: ${label}`}
          />
          <input
            ref={colorRef}
            type="color"
            value={pickerValue}
            onChange={(e) => onApplyHex(e.target.value.toUpperCase())}
            className="sr-only"
            aria-hidden
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={draft}
              onChange={(e) => handleHex(e.target.value)}
              maxLength={7}
              spellCheck={false}
              autoComplete="off"
              className={`w-full px-3 py-2.5 rounded-xl bg-background/60 border text-sm font-mono outline-none transition-colors ${
                error ? "border-destructive/60" : "border-border/60 focus:border-primary/60"
              }`}
            />
            {!error && HEX_REGEX.test(draft) && (
              <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" />
            )}
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(hex);
                toast.success(`Copiado: ${hex}`);
              } catch {
                toast.error("Não foi possível copiar");
              }
            }}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title="Copiar HEX"
          >
            <Copy size={14} />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  };

  const previewGradient = `linear-gradient(${
    current.direction === "inverted" ? "to top" : "to bottom"
  }, ${current.fromColor} 0%, ${current.toColor} 100%)`;

  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/20 p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
            <ArrowDownUp size={14} className="text-primary" />
            Degradê de Transição entre Seções
          </h3>
          <p className="text-xs text-muted-foreground">
            Controla o degradê suave entre o Hero e a próxima seção (cor inicial, cor final,
            direção e intensidade). Não interfere no conteúdo do Hero.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer shrink-0">
          <span className="text-muted-foreground">Ativo</span>
          <input
            type="checkbox"
            checked={current.enabled}
            onChange={(e) => apply({ enabled: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
        </label>
      </div>

      {/* Live preview */}
      <div
        className="w-full h-24 rounded-xl border border-border/60 overflow-hidden"
        style={{
          backgroundImage: previewGradient,
          opacity: current.enabled ? current.intensity : 0.25,
        }}
        aria-label="Pré-visualização do degradê"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <HexInput
          label="Cor inicial (topo)"
          hex={current.fromColor}
          onApplyHex={(h) => apply({ fromColor: h })}
        />
        <HexInput
          label="Cor final (base)"
          hex={current.toColor}
          onApplyHex={(h) => apply({ toColor: h })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Direção
          </label>
          <div className="flex items-center gap-1 rounded-xl bg-background/60 border border-border/60 p-1">
            <button
              type="button"
              onClick={() => apply({ direction: "vertical" })}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                current.direction === "vertical"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Vertical (topo → base)
            </button>
            <button
              type="button"
              onClick={() => apply({ direction: "inverted" })}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                current.direction === "inverted"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Invertido (base → topo)
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Altura do degradê: <span className="font-mono">{current.height}px</span>
          </label>
          <input
            type="range"
            min={16}
            max={320}
            step={4}
            value={current.height}
            onChange={(e) => apply({ height: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Intensidade / Suavidade:{" "}
          <span className="font-mono">{Math.round(current.intensity * 100)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(current.intensity * 100)}
          onChange={(e) => apply({ intensity: Number(e.target.value) / 100 })}
          className="w-full accent-primary"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCcw size={13} />
          Restaurar padrão
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          Cancelar edição
        </button>
      </div>
    </div>
  );
};

const AppearancePanel = ({ value, onChange }: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Palette size={18} className="text-primary" />
          Aparência
        </h2>
        <p className="text-sm text-muted-foreground">
          Personalize as cores principais do site. As alterações são aplicadas em tempo real e
          ficam permanentes após clicar em <strong>Salvar</strong> no topo da página.
        </p>
      </div>

      <ColorEditor
        title="Cor de Fundo do Site"
        description="Aplica a cor como fundo global do site (token --background)."
        value={value.backgroundColor}
        defaultValue={DEFAULT_BACKGROUND_COLOR}
        onApply={(hex) => onChange({ ...value, backgroundColor: hex })}
      />

      <ColorEditor
        title="Cor de Fundo do Hero"
        description="Aplica somente na primeira seção (Hero / Banner Principal)."
        value={value.heroBackgroundColor}
        defaultValue={DEFAULT_HERO_BACKGROUND_COLOR}
        onApply={(hex) => onChange({ ...value, heroBackgroundColor: hex })}
      />

      <ColorEditor
        title="Cor do Header (motion.header)"
        description="Aplica somente no cabeçalho fixo do topo."
        value={value.headerBackgroundColor}
        defaultValue={DEFAULT_HEADER_BACKGROUND_COLOR}
        onApply={(hex) => onChange({ ...value, headerBackgroundColor: hex })}
      />

      <SectionTransitionEditor
        value={value.sectionTransition ?? DEFAULT_SECTION_TRANSITION}
        onChange={(st) => onChange({ ...value, sectionTransition: st })}
      />
    </div>
  );
};

export default AppearancePanel;
