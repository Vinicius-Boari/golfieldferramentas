import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown, Settings, Image as ImageIcon, Type, MousePointer2,
  Volume2, Clock, Palette, Eye, Save, RotateCcw, Loader2, Upload, Link2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  defaultSplashConfig,
  useSaveSplashConfig,
  type SplashConfig,
} from "@/hooks/useSplashConfig";
import SplashPage from "@/components/SplashPage";

interface Props {
  value: SplashConfig;
  onChange: (next: SplashConfig) => void;
  userId?: string;
}

/** ─── Tiny inline UI primitives (kept local to avoid coupling) ───────────── */

const Toggle = ({ value, onChange, label, hint }: {
  value: boolean; onChange: (v: boolean) => void; label: string; hint?: string;
}) => (
  <label className="flex items-start justify-between gap-3 py-2 cursor-pointer">
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium">{label}</div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-primary" : "bg-secondary border border-border"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  </label>
);

const TextInput = ({ label, value, onChange, type = "text", placeholder = "", rows }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; rows?: number;
}) => (
  <div>
    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
    {rows ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 resize-none transition-colors" />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors" />
    )}
  </div>
);

const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void; }) => (
  <div>
    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
    <div className="flex gap-2 items-center">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 rounded-lg border border-border/50 bg-transparent cursor-pointer" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm font-mono outline-none focus:border-primary/50" />
    </div>
  </div>
);

const Slider = ({ label, value, min, max, step, onChange, suffix = "" }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix?: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <span className="text-xs font-mono text-foreground">{value}{suffix}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-primary" />
  </div>
);

const SegButton = <T extends string>({ value, options, onChange }: {
  value: T; options: { id: T; label: string; hint?: string }[]; onChange: (v: T) => void;
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {options.map((opt) => {
      const active = opt.id === value;
      return (
        <button key={opt.id} type="button" onClick={() => onChange(opt.id)}
          className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${active
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-secondary/50 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground"}`}>
          <div>{opt.label}</div>
          {opt.hint && <div className={`text-[10px] mt-0.5 font-normal ${active ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>{opt.hint}</div>}
        </button>
      );
    })}
  </div>
);

/** Collapsible section card. */
const Section = ({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: typeof Settings; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-secondary/20 overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10"><Icon size={16} className="text-primary" /></div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="p-4 pt-0 space-y-4">{children}</div>}
    </div>
  );
};

/** Image / video upload field with URL fallback. Stored in `hero-videos` bucket
 * (already public) since we don't want to create yet another bucket. */
const MediaUploadField = ({ label, value, onChange, accept, kind, userId }: {
  label: string; value: string; onChange: (v: string) => void; accept: string; kind: "image" | "video" | "audio"; userId?: string;
}) => {
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File | null) => {
    if (!file || !userId) return;
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "bin").toLowerCase();
      const safeName = file.name
        .replace(/\.[^.]+$/, "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
      const path = `splash/${kind}/${Date.now()}-${safeName}.${ext}`;
      // Reuse the public hero-videos bucket so we don't depend on a new one.
      const { error } = await supabase.storage.from("hero-videos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("hero-videos").getPublicUrl(path);
      onChange(publicUrl);
      setMode("url");
      toast.success("Arquivo enviado com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => setMode("upload")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${mode === "upload" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
          <Upload size={12} /> Upload
        </button>
        <button type="button" onClick={() => setMode("url")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${mode === "url" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
          <Link2 size={12} /> URL
        </button>
      </div>
      {mode === "upload" ? (
        <label className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-secondary/50 border border-dashed border-border text-sm text-muted-foreground cursor-pointer hover:bg-secondary/70 transition-colors">
          {uploading ? <><Loader2 size={14} className="animate-spin" /> Enviando…</>
            : <><Upload size={14} /> Selecionar arquivo</>}
          <input type="file" accept={accept} className="hidden" disabled={uploading}
            onChange={(e) => handleUpload(e.target.files?.[0] || null)} />
        </label>
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…"
          className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
      )}
      {value && (
        <div className="mt-2 text-[11px] text-muted-foreground truncate">{value}</div>
      )}
    </div>
  );
};

/** ─── Main panel ─────────────────────────────────────────────────────────── */

const SplashPagePanel = ({ value, onChange, userId }: Props) => {
  const [previewing, setPreviewing] = useState<SplashConfig | null>(null);
  const saveMutation = useSaveSplashConfig();

  const update = (updater: (prev: SplashConfig) => SplashConfig) => onChange(updater(value));

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(value);
      toast.success("Splash Page atualizada com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    }
  };

  const handleReset = () => {
    if (!confirm("Restaurar todas as configurações da Splash Page para o padrão?")) return;
    onChange(defaultSplashConfig);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold mb-1">Splash Page</h2>
          <p className="text-xs text-muted-foreground">Pop-up de boas-vindas exibido aos visitantes.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPreviewing(value)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
            <Eye size={14} /> Visualizar
          </button>
          <button type="button" onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <RotateCcw size={14} /> Padrão
          </button>
          <button type="button" onClick={handleSave} disabled={saveMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-50">
            {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar
          </button>
        </div>
      </div>

      {/* GERAL */}
      <Section title="Geral" icon={Settings} defaultOpen>
        <Toggle label="Ativar Splash Page" hint="Quando desligado, o pop-up não aparece para nenhum visitante."
          value={value.enabled} onChange={(v) => update((c) => ({ ...c, enabled: v }))} />
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Frequência de exibição</label>
          <SegButton<SplashConfig["frequency"]>
            value={value.frequency}
            onChange={(v) => update((c) => ({ ...c, frequency: v }))}
            options={[
              { id: "always", label: "Sempre", hint: "Toda visita" },
              { id: "session", label: "Sessão", hint: "1x por aba" },
              { id: "daily", label: "Diária", hint: "1x por dia" },
              { id: "weekly", label: "Semanal", hint: "1x por semana" },
            ]}
          />
          <div className="mt-3">
            <SegButton<SplashConfig["frequency"]>
              value={value.frequency}
              onChange={(v) => update((c) => ({ ...c, frequency: v }))}
              options={[{ id: "custom", label: "Personalizado", hint: "Em horas →" }]}
            />
          </div>
          {value.frequency === "custom" && (
            <div className="mt-3">
              <Slider label="Repetir a cada" value={value.customHours}
                min={1} max={720} step={1} suffix=" h"
                onChange={(v) => update((c) => ({ ...c, customHours: v }))} />
            </div>
          )}
        </div>
      </Section>

      {/* MÍDIA */}
      <Section title="Mídia Principal" icon={ImageIcon}>
        <SegButton<SplashConfig["media"]["kind"]>
          value={value.media.kind}
          onChange={(v) => update((c) => ({ ...c, media: { ...c.media, kind: v } }))}
          options={[
            { id: "none", label: "Sem mídia" },
            { id: "image", label: "Imagem" },
            { id: "video", label: "Vídeo" },
          ]}
        />
        {value.media.kind !== "none" && (
          <>
            <MediaUploadField
              label={value.media.kind === "image" ? "Imagem" : "Vídeo (MP4, YouTube ou Vimeo)"}
              value={value.media.url}
              onChange={(v) => update((c) => ({ ...c, media: { ...c.media, url: v } }))}
              accept={value.media.kind === "image" ? "image/*" : "video/*"}
              kind={value.media.kind}
              userId={userId}
            />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Posição</label>
              <SegButton<SplashConfig["media"]["position"]>
                value={value.media.position}
                onChange={(v) => update((c) => ({ ...c, media: { ...c.media, position: v } }))}
                options={[
                  { id: "background", label: "Fundo" },
                  { id: "top", label: "Topo" },
                  { id: "left", label: "Esquerda" },
                  { id: "right", label: "Direita" },
                ]}
              />
            </div>
            {value.media.kind === "video" && (
              <div className="space-y-1">
                <Toggle label="Autoplay" value={value.media.autoplay}
                  onChange={(v) => update((c) => ({ ...c, media: { ...c.media, autoplay: v } }))} />
                <Toggle label="Loop" value={value.media.loop}
                  onChange={(v) => update((c) => ({ ...c, media: { ...c.media, loop: v } }))} />
                <Toggle label="Mudo por padrão" value={value.media.muted}
                  onChange={(v) => update((c) => ({ ...c, media: { ...c.media, muted: v } }))} />
              </div>
            )}
          </>
        )}
      </Section>

      {/* TEXTOS */}
      <Section title="Textos" icon={Type}>
        <Toggle label="Exibir título" value={value.texts.titleEnabled}
          onChange={(v) => update((c) => ({ ...c, texts: { ...c.texts, titleEnabled: v } }))} />
        {value.texts.titleEnabled && (
          <>
            <TextInput label="Título" value={value.texts.title}
              onChange={(v) => update((c) => ({ ...c, texts: { ...c.texts, title: v } }))} />
            <ColorInput label="Cor do título" value={value.texts.titleColor}
              onChange={(v) => update((c) => ({ ...c, texts: { ...c.texts, titleColor: v } }))} />
          </>
        )}
        <Toggle label="Exibir subtítulo" value={value.texts.subtitleEnabled}
          onChange={(v) => update((c) => ({ ...c, texts: { ...c.texts, subtitleEnabled: v } }))} />
        {value.texts.subtitleEnabled && (
          <>
            <TextInput label="Subtítulo / Descrição" value={value.texts.subtitle}
              onChange={(v) => update((c) => ({ ...c, texts: { ...c.texts, subtitle: v } }))} rows={3} />
            <ColorInput label="Cor do subtítulo" value={value.texts.subtitleColor}
              onChange={(v) => update((c) => ({ ...c, texts: { ...c.texts, subtitleColor: v } }))} />
          </>
        )}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Alinhamento</label>
          <SegButton<SplashConfig["texts"]["align"]>
            value={value.texts.align}
            onChange={(v) => update((c) => ({ ...c, texts: { ...c.texts, align: v } }))}
            options={[
              { id: "left", label: "Esquerda" },
              { id: "center", label: "Centro" },
              { id: "right", label: "Direita" },
            ]}
          />
        </div>
      </Section>

      {/* BOTÕES */}
      <Section title="Botões" icon={MousePointer2}>
        <Toggle label="Botão principal (CTA)" value={value.primaryButton.enabled}
          onChange={(v) => update((c) => ({ ...c, primaryButton: { ...c.primaryButton, enabled: v } }))} />
        {value.primaryButton.enabled && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput label="Texto do botão" value={value.primaryButton.text}
                onChange={(v) => update((c) => ({ ...c, primaryButton: { ...c.primaryButton, text: v } }))} />
              <TextInput label="URL de destino" value={value.primaryButton.url}
                onChange={(v) => update((c) => ({ ...c, primaryButton: { ...c.primaryButton, url: v } }))}
                placeholder="https://… ou #produtos" />
            </div>
            <Toggle label="Abrir em nova aba" value={value.primaryButton.newTab}
              onChange={(v) => update((c) => ({ ...c, primaryButton: { ...c.primaryButton, newTab: v } }))} />
          </>
        )}

        <div className="border-t border-border/50 my-2" />

        <Toggle label="Botão secundário" value={value.secondaryButton.enabled}
          onChange={(v) => update((c) => ({ ...c, secondaryButton: { ...c.secondaryButton, enabled: v } }))} />
        {value.secondaryButton.enabled && (
          <>
            <TextInput label="Texto do botão" value={value.secondaryButton.text}
              onChange={(v) => update((c) => ({ ...c, secondaryButton: { ...c.secondaryButton, text: v } }))} />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Ação</label>
              <SegButton<SplashConfig["secondaryButton"]["action"]>
                value={value.secondaryButton.action}
                onChange={(v) => update((c) => ({ ...c, secondaryButton: { ...c.secondaryButton, action: v } }))}
                options={[
                  { id: "close", label: "Fechar splash" },
                  { id: "redirect", label: "Redirecionar" },
                ]}
              />
            </div>
            {value.secondaryButton.action === "redirect" && (
              <TextInput label="URL de redirecionamento" value={value.secondaryButton.url}
                onChange={(v) => update((c) => ({ ...c, secondaryButton: { ...c.secondaryButton, url: v } }))} />
            )}
          </>
        )}
      </Section>

      {/* ÁUDIO */}
      <Section title="Áudio" icon={Volume2}>
        <Toggle label="Áudio ativado" value={value.audio.enabled}
          onChange={(v) => update((c) => ({ ...c, audio: { ...c.audio, enabled: v } }))} />
        {value.audio.enabled && (
          <>
            <MediaUploadField
              label="Arquivo de áudio (MP3 / OGG)"
              value={value.audio.url}
              onChange={(v) => update((c) => ({ ...c, audio: { ...c.audio, url: v } }))}
              accept="audio/*"
              kind="audio"
              userId={userId}
            />
            <Slider label="Volume" value={Math.round(value.audio.volume * 100)}
              min={0} max={100} step={1} suffix="%"
              onChange={(v) => update((c) => ({ ...c, audio: { ...c.audio, volume: v / 100 } }))} />
            <Toggle label="Loop do áudio" value={value.audio.loop}
              onChange={(v) => update((c) => ({ ...c, audio: { ...c.audio, loop: v } }))} />
            <Toggle label="Exibir controle de áudio na splash" value={value.audio.showControls}
              onChange={(v) => update((c) => ({ ...c, audio: { ...c.audio, showControls: v } }))} />
            <p className="text-[11px] text-muted-foreground">
              ⚠️ Navegadores podem bloquear o autoplay com som — o controle visível
              permite que o visitante ative o áudio com um clique.
            </p>
          </>
        )}
      </Section>

      {/* CONTADOR */}
      <Section title="Contador Regressivo" icon={Clock}>
        <Toggle label="Exibir contador" value={value.countdown.enabled}
          onChange={(v) => update((c) => ({ ...c, countdown: { ...c.countdown, enabled: v } }))} />
        {value.countdown.enabled && (
          <>
            <TextInput label="Texto acima do contador" value={value.countdown.label}
              onChange={(v) => update((c) => ({ ...c, countdown: { ...c.countdown, label: v } }))}
              placeholder="Oferta termina em:" />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Data e hora final</label>
              <input type="datetime-local"
                value={isoToLocal(value.countdown.endsAt)}
                onChange={(e) => update((c) => ({ ...c, countdown: { ...c.countdown, endsAt: localToIso(e.target.value) } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Ao chegar a zero</label>
              <SegButton<SplashConfig["countdown"]["onEnd"]>
                value={value.countdown.onEnd}
                onChange={(v) => update((c) => ({ ...c, countdown: { ...c.countdown, onEnd: v } }))}
                options={[
                  { id: "hide", label: "Ocultar" },
                  { id: "close", label: "Fechar splash" },
                  { id: "message", label: "Mensagem" },
                ]}
              />
            </div>
            {value.countdown.onEnd === "message" && (
              <TextInput label="Mensagem ao expirar" value={value.countdown.endMessage}
                onChange={(v) => update((c) => ({ ...c, countdown: { ...c.countdown, endMessage: v } }))} />
            )}
          </>
        )}
      </Section>

      {/* APARÊNCIA */}
      <Section title="Aparência" icon={Palette}>
        <ColorInput label="Cor de fundo do card" value={value.appearance.cardBackground}
          onChange={(v) => update((c) => ({ ...c, appearance: { ...c.appearance, cardBackground: v } }))} />
        <ColorInput label="Cor do overlay" value={value.appearance.overlayColor}
          onChange={(v) => update((c) => ({ ...c, appearance: { ...c.appearance, overlayColor: v } }))} />
        <Slider label="Opacidade do overlay" value={Math.round(value.appearance.overlayOpacity * 100)}
          min={0} max={100} step={5} suffix="%"
          onChange={(v) => update((c) => ({ ...c, appearance: { ...c.appearance, overlayOpacity: v / 100 } }))} />
        <Slider label="Border-radius do card" value={value.appearance.borderRadius}
          min={0} max={48} step={1} suffix="px"
          onChange={(v) => update((c) => ({ ...c, appearance: { ...c.appearance, borderRadius: v } }))} />
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Largura máxima</label>
          <SegButton<SplashConfig["appearance"]["width"]>
            value={value.appearance.width}
            onChange={(v) => update((c) => ({ ...c, appearance: { ...c.appearance, width: v } }))}
            options={[
              { id: "small", label: "Pequeno", hint: "400px" },
              { id: "medium", label: "Médio", hint: "600px" },
              { id: "large", label: "Grande", hint: "800px" },
              { id: "full", label: "Tela cheia" },
            ]}
          />
        </div>
        <Toggle label="Fechar ao clicar fora do card" value={value.appearance.closeOnBackdrop}
          onChange={(v) => update((c) => ({ ...c, appearance: { ...c.appearance, closeOnBackdrop: v } }))} />
        <Toggle label="Fechar com tecla ESC" value={value.appearance.closeOnEsc}
          onChange={(v) => update((c) => ({ ...c, appearance: { ...c.appearance, closeOnEsc: v } }))} />
      </Section>

      {/* PREVIEW */}
      {previewing && (
        <SplashPage previewConfig={previewing} onPreviewClose={() => setPreviewing(null)} />
      )}
    </div>
  );
};

/** Convert ISO string → "YYYY-MM-DDTHH:mm" for <input type="datetime-local">. */
const isoToLocal = (iso: string): string => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ""; }
};

const localToIso = (local: string): string => {
  if (!local) return "";
  const d = new Date(local);
  return isNaN(d.getTime()) ? "" : d.toISOString();
};

export default SplashPagePanel;
