import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2, Loader2, Film, Volume2, VolumeX, Repeat, Eye, Palette, RotateCcw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { HeroVideoConfig } from "@/hooks/useHomeConfig";

const DEFAULT_OVERLAY_COLOR = "#000000";
const DEFAULT_OVERLAY_OPACITY = 0.55;
const DEFAULT_OVERLAY_ENABLED = true;
const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

const MAX_BYTES = 100 * 1024 * 1024;

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

interface Props {
  value: HeroVideoConfig;
  onChange: (next: HeroVideoConfig) => void;
}

const Toggle = ({ checked, onChange, label, icon: Icon, hint }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; icon: any; hint?: string;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-4 p-4 rounded-xl bg-secondary/40 border border-border/50 hover:border-primary/40 transition-colors text-left"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className={`p-2 rounded-lg ${checked ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground truncate">{hint}</p>}
      </div>
    </div>
    <div className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-input"}`}>
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 rounded-full bg-background shadow"
      />
    </div>
  </button>
);

const HeroVideoPanel = ({ value, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [meta, setMeta] = useState<{ name: string; size: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<HeroVideoConfig>) => onChange({ ...value, ...patch });

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) {
      toast.error("Formato inválido. Use .mp4 ou .webm");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`Arquivo muito grande (máx. 100MB). Atual: ${formatSize(file.size)}`);
      return;
    }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("hero-videos").upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("hero-videos").getPublicUrl(path);
      update({ url: data.publicUrl, enabled: true });
      setMeta({ name: file.name, size: file.size });
      toast.success("Vídeo enviado! Lembre-se de salvar.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar vídeo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remover o vídeo do hero? Esta ação só será aplicada após salvar.")) return;
    try {
      // Try to delete from storage if it's a hero-videos URL
      const match = value.url.match(/\/hero-videos\/(.+)$/);
      if (match) {
        await supabase.storage.from("hero-videos").remove([decodeURIComponent(match[1])]);
      }
    } catch {
      // ignore deletion errors
    }
    update({ url: "", enabled: false });
    setMeta(null);
    toast.success("Vídeo removido. Lembre-se de salvar.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Film size={18} className="text-primary" />
          Vídeo de Fundo do Hero
        </h2>
        <p className="text-sm text-muted-foreground">
          Faça upload de um vídeo .mp4 ou .webm (máx. 100MB) para usar como fundo animado da seção principal.
          <br />
          <span className="text-foreground font-medium">Tamanho recomendado: 1920×1080 px</span> (Full HD, proporção 16:9) para cobrir toda a tela do hero sem perda de qualidade. Para telas maiores (4K), use <span className="text-foreground font-medium">3840×2160 px</span>.
        </p>
      </div>

      {/* Upload */}
      <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Upload size={16} /></div>
          <div>
            <p className="text-sm font-semibold">{value.url ? "Substituir vídeo" : "Enviar vídeo"}</p>
            <p className="text-xs text-muted-foreground">Formatos aceitos: .mp4, .webm — até 100MB</p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          disabled={uploading}
          onChange={e => void handleUpload(e.target.files?.[0] ?? null)}
          className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground file:cursor-pointer"
        />
        {uploading && (
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin" /> Enviando vídeo...
          </div>
        )}
        {meta && !uploading && (
          <div className="mt-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{meta.name}</span> · {formatSize(meta.size)}
          </div>
        )}
      </div>

      {/* Preview */}
      {value.url && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Eye size={12} /> Pré-visualização
            </label>
            <button
              onClick={handleRemove}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={12} /> Remover vídeo
            </button>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-border bg-black aspect-video">
            <video
              key={value.url}
              src={value.url}
              autoPlay
              muted={value.muted}
              loop={value.loop}
              playsInline
              controls
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-background pointer-events-none"
              style={{ opacity: value.overlayOpacity }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground break-all">{value.url}</p>
        </div>
      )}

      {/* Toggles */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Toggle
          checked={value.enabled}
          onChange={v => update({ enabled: v })}
          label="Ativar vídeo de fundo"
          hint={value.enabled ? "Vídeo será exibido no hero" : "Vídeo desativado"}
          icon={Film}
        />
        <Toggle
          checked={value.loop}
          onChange={v => update({ loop: v })}
          label="Loop infinito"
          hint="Reinicia automaticamente"
          icon={Repeat}
        />
        <Toggle
          checked={value.muted}
          onChange={v => update({ muted: v })}
          label="Vídeo sem som (recomendado)"
          hint="Necessário para autoplay no navegador"
          icon={value.muted ? VolumeX : Volume2}
        />
      </div>

      {/* Overlay slider */}
      <div className="rounded-xl bg-secondary/40 border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">Opacidade do overlay escuro</label>
          <span className="text-xs font-mono text-primary">{Math.round(value.overlayOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={80}
          step={1}
          value={Math.round(value.overlayOpacity * 100)}
          onChange={e => update({ overlayOpacity: Number(e.target.value) / 100 })}
          className="w-full accent-primary"
        />
        <p className="text-[11px] text-muted-foreground mt-2">
          Aumente a opacidade para garantir leitura do texto sobre o vídeo (recomendado: 40%–65%).
        </p>
      </div>
    </div>
  );
};

export default HeroVideoPanel;
