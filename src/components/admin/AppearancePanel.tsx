import { useState, useEffect, useRef } from "react";
import { RotateCcw, Check, Copy, Palette } from "lucide-react";
import { toast } from "sonner";
import {
  type AppearanceConfig,
  DEFAULT_BACKGROUND_COLOR,
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
  // Expand 3-digit shorthand (#abc -> #aabbcc)
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

const AppearancePanel = ({ value, onChange }: Props) => {
  const current = value.backgroundColor || DEFAULT_BACKGROUND_COLOR;
  const [draft, setDraft] = useState<string>(current);
  const [error, setError] = useState<string>("");
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Keep draft in sync if parent value changes externally (e.g., reset).
  useEffect(() => {
    setDraft(current);
    setError("");
  }, [current]);

  const apply = (hex: string) => {
    onChange({ ...value, backgroundColor: hex });
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
    setDraft(current);
    setError("");
  };

  const handleReset = () => {
    setDraft(DEFAULT_BACKGROUND_COLOR);
    setError("");
    apply(DEFAULT_BACKGROUND_COLOR);
    toast.success("Cor padrão restaurada. Não esqueça de salvar.");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current);
      toast.success(`Copiado: ${current}`);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  // For the native color picker, value MUST be a valid #RRGGBB
  const pickerValue = HEX_REGEX.test(current) ? current : DEFAULT_BACKGROUND_COLOR;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Palette size={18} className="text-primary" />
          Aparência
        </h2>
        <p className="text-sm text-muted-foreground">
          Personalize a cor de fundo global do site. As alterações são aplicadas em tempo real e
          ficam permanentes após salvar.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-secondary/20 p-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-1">Cor de Fundo do Site</h3>
          <p className="text-xs text-muted-foreground">
            Escolha uma cor pelo seletor visual ou digite o código hexadecimal.
          </p>
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
            <div className="relative">
              <input
                ref={colorInputRef}
                type="color"
                value={pickerValue}
                onChange={(e) => handlePickerChange(e.target.value)}
                className="w-14 h-11 rounded-xl border border-border/60 bg-secondary/40 cursor-pointer p-1"
                aria-label="Seletor visual de cor"
              />
            </div>
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
                placeholder="#F5F5F5"
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
            {error && (
              <p className="mt-1.5 text-xs text-destructive">{error}</p>
            )}
            {!error && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Aceita formato <code className="font-mono">#RRGGBB</code> (ex: #F5F5F5).
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
            Restaurar cor padrão ({DEFAULT_BACKGROUND_COLOR})
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancelar edição
          </button>
          <p className="ml-auto text-[11px] text-muted-foreground">
            Use o botão <strong>Salvar</strong> no topo para tornar a alteração permanente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppearancePanel;
