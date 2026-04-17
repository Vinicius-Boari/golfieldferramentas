import { useEffect, useState } from "react";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import type { Breakpoint, ElementStyles, StyleBag } from "@/hooks/useVisualOverrides";

export interface SelectedElement {
  elementId: string;
  tag: string;
  text: string;
}

interface Props {
  selected: SelectedElement | null;
  styles: ElementStyles;
  breakpoint: Breakpoint;
  onChange: (next: ElementStyles) => void;
  onResetElement: () => void;
  /** Save text content (separate channel — goes to home_config in v2). */
  onTextChange?: (text: string) => void;
}

/* -------------------------------------------------------------------- */
/* Small input building blocks                                          */
/* -------------------------------------------------------------------- */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2.5">
    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
    <div className="space-y-2.5">{children}</div>
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[5.25rem_1fr] items-center gap-2">
    <label className="text-[11px] text-muted-foreground">{label}</label>
    <div className="min-w-0">{children}</div>
  </div>
);

const TextIn = (props: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input
    value={props.value}
    onChange={(e) => props.onChange(e.target.value)}
    placeholder={props.placeholder}
    className="w-full px-2 py-1.5 rounded-md bg-secondary/60 border border-border/50 text-xs outline-none focus:border-primary/50 transition-colors"
  />
);

const ColorIn = (props: { value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-1.5">
    <input
      type="color"
      value={(props.value || "#000000").startsWith("#") ? props.value : "#000000"}
      onChange={(e) => props.onChange(e.target.value)}
      className="w-7 h-7 rounded border border-border/50 bg-transparent cursor-pointer"
    />
    <input
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder="#000000 ou hsl(...)"
      className="flex-1 min-w-0 px-2 py-1.5 rounded-md bg-secondary/60 border border-border/50 text-xs outline-none focus:border-primary/50 transition-colors"
    />
  </div>
);

const Select = (props: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <select
    value={props.value}
    onChange={(e) => props.onChange(e.target.value)}
    className="w-full px-2 py-1.5 rounded-md bg-secondary/60 border border-border/50 text-xs outline-none focus:border-primary/50 transition-colors"
  >
    {props.options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

/* -------------------------------------------------------------------- */
/* Property panel                                                       */
/* -------------------------------------------------------------------- */

const PropertyPanel = ({ selected, styles, breakpoint, onChange, onResetElement, onTextChange }: Props) => {
  const bag: StyleBag = (styles[breakpoint] ?? {}) as StyleBag;
  const [textDraft, setTextDraft] = useState(selected?.text ?? "");

  useEffect(() => {
    setTextDraft(selected?.text ?? "");
  }, [selected?.elementId, selected?.text]);

  const setProp = (key: string, value: string) => {
    const nextBag: StyleBag = { ...bag };
    if (value === "" || value === undefined) {
      delete nextBag[key];
    } else {
      nextBag[key] = value;
    }
    onChange({ ...styles, [breakpoint]: nextBag });
  };

  const get = (k: string) => bag[k] ?? "";

  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
        <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center mb-3">
          <Eye size={20} />
        </div>
        <p className="text-sm font-medium text-foreground">Nenhum elemento selecionado</p>
        <p className="text-xs mt-1 max-w-xs">Clique em qualquer elemento marcado do site para começar a editar suas propriedades.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Editando</p>
            <p className="text-sm font-semibold truncate">{selected.elementId}</p>
          </div>
          <button
            onClick={onResetElement}
            title="Restaurar este elemento ao estado original (apenas o que ainda não foi salvo)"
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <RotateCcw size={14} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Tag <code className="bg-secondary/60 px-1 py-0.5 rounded">{selected.tag}</code> · breakpoint{" "}
          <span className="text-foreground font-medium">{breakpoint}</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Conteúdo */}
        {onTextChange && (
          <Section title="Conteúdo">
            <Row label="Texto">
              <textarea
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                onBlur={() => onTextChange(textDraft)}
                rows={3}
                className="w-full px-2 py-1.5 rounded-md bg-secondary/60 border border-border/50 text-xs outline-none focus:border-primary/50 transition-colors resize-y"
              />
            </Row>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Edição de texto é experimental — alguns elementos derivados do conteúdo do painel "Editor da Home" podem
              precisar ser editados por lá.
            </p>
          </Section>
        )}

        {/* Tipografia */}
        <Section title="Tipografia">
          <Row label="Cor"><ColorIn value={get("color")} onChange={(v) => setProp("color", v)} /></Row>
          <Row label="Tamanho"><TextIn value={get("font-size")} onChange={(v) => setProp("font-size", v)} placeholder="ex: 18px" /></Row>
          <Row label="Peso">
            <Select
              value={get("font-weight")}
              onChange={(v) => setProp("font-weight", v)}
              options={[
                { value: "", label: "Padrão" },
                { value: "300", label: "300 — Light" },
                { value: "400", label: "400 — Regular" },
                { value: "500", label: "500 — Medium" },
                { value: "600", label: "600 — Semibold" },
                { value: "700", label: "700 — Bold" },
                { value: "800", label: "800 — Extra Bold" },
                { value: "900", label: "900 — Black" },
              ]}
            />
          </Row>
          <Row label="Família"><TextIn value={get("font-family")} onChange={(v) => setProp("font-family", v)} placeholder="ex: Outfit, sans-serif" /></Row>
          <Row label="Alinhamento">
            <Select
              value={get("text-align")}
              onChange={(v) => setProp("text-align", v)}
              options={[
                { value: "", label: "Padrão" },
                { value: "left", label: "Esquerda" },
                { value: "center", label: "Centro" },
                { value: "right", label: "Direita" },
                { value: "justify", label: "Justificado" },
              ]}
            />
          </Row>
          <Row label="Altura linha"><TextIn value={get("line-height")} onChange={(v) => setProp("line-height", v)} placeholder="ex: 1.4" /></Row>
          <Row label="Letras"><TextIn value={get("letter-spacing")} onChange={(v) => setProp("letter-spacing", v)} placeholder="ex: 0.02em" /></Row>
        </Section>

        {/* Dimensões */}
        <Section title="Dimensões">
          <Row label="Largura"><TextIn value={get("width")} onChange={(v) => setProp("width", v)} placeholder="ex: 100% / 320px" /></Row>
          <Row label="Altura"><TextIn value={get("height")} onChange={(v) => setProp("height", v)} placeholder="ex: auto / 240px" /></Row>
          <Row label="Min largura"><TextIn value={get("min-width")} onChange={(v) => setProp("min-width", v)} placeholder="" /></Row>
          <Row label="Max largura"><TextIn value={get("max-width")} onChange={(v) => setProp("max-width", v)} placeholder="" /></Row>
          <Row label="Min altura"><TextIn value={get("min-height")} onChange={(v) => setProp("min-height", v)} placeholder="" /></Row>
          <Row label="Max altura"><TextIn value={get("max-height")} onChange={(v) => setProp("max-height", v)} placeholder="" /></Row>
        </Section>

        {/* Espaçamento */}
        <Section title="Espaçamento">
          <Row label="Padding"><TextIn value={get("padding")} onChange={(v) => setProp("padding", v)} placeholder="ex: 12px 16px" /></Row>
          <Row label="Margin"><TextIn value={get("margin")} onChange={(v) => setProp("margin", v)} placeholder="ex: 0 0 24px 0" /></Row>
        </Section>

        {/* Plano de fundo */}
        <Section title="Plano de fundo">
          <Row label="Cor"><ColorIn value={get("background-color")} onChange={(v) => setProp("background-color", v)} /></Row>
          <Row label="Imagem"><TextIn value={get("background-image")} onChange={(v) => setProp("background-image", v)} placeholder="ex: url('https://...')" /></Row>
          <Row label="Tamanho">
            <Select
              value={get("background-size")}
              onChange={(v) => setProp("background-size", v)}
              options={[
                { value: "", label: "Padrão" },
                { value: "cover", label: "Cover" },
                { value: "contain", label: "Contain" },
                { value: "auto", label: "Auto" },
              ]}
            />
          </Row>
          <Row label="Posição"><TextIn value={get("background-position")} onChange={(v) => setProp("background-position", v)} placeholder="ex: center center" /></Row>
        </Section>

        {/* Borda */}
        <Section title="Borda">
          <Row label="Espessura"><TextIn value={get("border-width")} onChange={(v) => setProp("border-width", v)} placeholder="ex: 1px" /></Row>
          <Row label="Estilo">
            <Select
              value={get("border-style")}
              onChange={(v) => setProp("border-style", v)}
              options={[
                { value: "", label: "Padrão" },
                { value: "solid", label: "Sólida" },
                { value: "dashed", label: "Tracejada" },
                { value: "dotted", label: "Pontilhada" },
                { value: "none", label: "Nenhuma" },
              ]}
            />
          </Row>
          <Row label="Cor"><ColorIn value={get("border-color")} onChange={(v) => setProp("border-color", v)} /></Row>
          <Row label="Raio"><TextIn value={get("border-radius")} onChange={(v) => setProp("border-radius", v)} placeholder="ex: 16px ou 9999px" /></Row>
        </Section>

        {/* Efeitos */}
        <Section title="Efeitos">
          <Row label="Opacidade"><TextIn value={get("opacity")} onChange={(v) => setProp("opacity", v)} placeholder="0 a 1" /></Row>
          <Row label="Sombra"><TextIn value={get("box-shadow")} onChange={(v) => setProp("box-shadow", v)} placeholder="ex: 0 10px 30px rgba(0,0,0,.4)" /></Row>
          <Row label="Filter"><TextIn value={get("filter")} onChange={(v) => setProp("filter", v)} placeholder="ex: blur(4px) brightness(0.9)" /></Row>
          <Row label="Transform"><TextIn value={get("transform")} onChange={(v) => setProp("transform", v)} placeholder="ex: rotate(-3deg) scale(1.05)" /></Row>
          <Row label="Z-index"><TextIn value={get("z-index")} onChange={(v) => setProp("z-index", v)} placeholder="ex: 10" /></Row>
        </Section>

        {/* Visibilidade */}
        <Section title="Visibilidade">
          <Row label="Display">
            <Select
              value={get("display")}
              onChange={(v) => setProp("display", v)}
              options={[
                { value: "", label: "Padrão" },
                { value: "block", label: "block" },
                { value: "inline-block", label: "inline-block" },
                { value: "flex", label: "flex" },
                { value: "inline-flex", label: "inline-flex" },
                { value: "grid", label: "grid" },
                { value: "none", label: "Ocultar (none)" },
              ]}
            />
          </Row>
          <Row label="Visibility">
            <Select
              value={get("visibility")}
              onChange={(v) => setProp("visibility", v)}
              options={[
                { value: "", label: "Padrão" },
                { value: "visible", label: "Visível" },
                { value: "hidden", label: "Invisível" },
              ]}
            />
          </Row>
        </Section>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2.5 border-t border-border flex items-center gap-2 text-[10px] text-muted-foreground">
        <EyeOff size={11} />
        <span>Ações como navegação e WhatsApp ficam desativadas dentro do editor.</span>
      </div>
    </div>
  );
};

export default PropertyPanel;
