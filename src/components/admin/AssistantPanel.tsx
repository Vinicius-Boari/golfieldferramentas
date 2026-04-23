import { useMemo, useState } from "react";
import {
  Bot, Upload, Link2, Loader2, Trash2, Clock, MessageCircle,
  Power, Sparkles, Type, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  defaultAssistantConfig,
  type AssistantConfig,
  type AssistantSpeed,
  type AssistantTone,
} from "@/hooks/useAssistantConfig";
import { toast } from "sonner";

const DAYS = [
  { id: 0, label: "Dom" },
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" },
];

const SPEED_OPTIONS: { id: AssistantSpeed; label: string; hint: string }[] = [
  { id: "slow", label: "Lenta", hint: "Pausas maiores entre digitação" },
  { id: "normal", label: "Normal", hint: "Ritmo natural humano" },
  { id: "fast", label: "Rápida", hint: "Respostas mais ágeis" },
];

const TONE_OPTIONS: { id: AssistantTone; label: string; hint: string }[] = [
  { id: "informal", label: "Informal", hint: "Tipo WhatsApp, descontraído" },
  { id: "semi-formal", label: "Semi-formal", hint: "Cordial, mas profissional" },
];

const Section = ({
  title, icon: Icon, children, hint,
}: {
  title: string; icon: any; children: React.ReactNode; hint?: string;
}) => (
  <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 sm:p-5 space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
    <div className="space-y-3 pl-0 sm:pl-9">{children}</div>
  </div>
);

const Toggle = ({ label, value, onChange, hint }: {
  label: string; value: boolean; onChange: (v: boolean) => void; hint?: string;
}) => (
  <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-background border border-border/40">
    <div className="min-w-0">
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${value ? "bg-primary" : "bg-secondary"}`}
      aria-pressed={value}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform ${value ? "translate-x-5" : ""}`} />
    </button>
  </div>
);

const Field = ({ label, value, onChange, placeholder = "", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) => (
  <div>
    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
    {rows ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-sm outline-none focus:border-primary/50 resize-none transition-colors"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
      />
    )}
  </div>
);

const AvatarField = ({ value, onChange, userId }: {
  value: string; onChange: (v: string) => void; userId?: string;
}) => {
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File | null) => {
    if (!file || !userId) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const safe = file.name
        .replace(/\.[^.]+$/, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "-")
        .toLowerCase();
      const filePath = `${userId}/assistant-${Date.now()}-${safe}.${ext.toLowerCase()}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      onChange(data.publicUrl);
      toast.success("Avatar enviado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Avatar do atendente</label>
        <div className="flex items-center gap-1 rounded-lg bg-background p-0.5 border border-border/40">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              mode === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Upload size={10} /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              mode === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Link2 size={10} /> URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div className="rounded-xl border border-dashed border-border bg-background p-3">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => void handleUpload(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
          />
          {uploading && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" /> Enviando...
            </div>
          )}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
        />
      )}

      {value && (
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden border border-border">
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1"
          >
            <Trash2 size={12} /> Remover
          </button>
        </div>
      )}
    </div>
  );
};

interface AssistantPanelProps {
  value: AssistantConfig;
  onChange: (next: AssistantConfig) => void;
  userId?: string;
}

const AssistantPanel = ({ value, onChange, userId }: AssistantPanelProps) => {
  // normalize so legacy DB rows never crash the UI
  const cfg = useMemo<AssistantConfig>(
    () => ({
      ...defaultAssistantConfig,
      ...value,
      schedule: { ...defaultAssistantConfig.schedule, ...(value?.schedule ?? {}) },
    }),
    [value]
  );

  const update = (updater: (prev: AssistantConfig) => AssistantConfig) => {
    onChange(updater(cfg));
  };

  const toggleDay = (day: number) => {
    update((prev) => {
      const has = prev.schedule.days.includes(day);
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          days: has
            ? prev.schedule.days.filter((d) => d !== day)
            : [...prev.schedule.days, day].sort((a, b) => a - b),
        },
      };
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Assistente Virtual</h2>
        <p className="text-sm text-muted-foreground">
          Configure como o assistente conversa com seus visitantes — para ele parecer 100% humano.
        </p>
      </div>

      {/* On/Off principal */}
      <Section title="Ativação" icon={Power} hint="Ligue ou desligue o chat no site inteiro.">
        <Toggle
          label="Ativar chat no site"
          hint="Quando desligado, o botão flutuante do chat não aparece."
          value={cfg.enabled}
          onChange={(v) => update((p) => ({ ...p, enabled: v }))}
        />
      </Section>

      {/* Identidade */}
      <Section title="Identidade do atendente" icon={Bot} hint="Quem o visitante vê do outro lado da conversa.">
        <Field
          label="Nome do atendente"
          value={cfg.attendantName}
          onChange={(v) => update((p) => ({ ...p, attendantName: v }))}
          placeholder="Ex: Ana, Carlos, Júlia..."
        />
        <Field
          label="Empresa / rótulo abaixo do nome"
          value={cfg.companyLabel}
          onChange={(v) => update((p) => ({ ...p, companyLabel: v }))}
          placeholder="Ex: GolField"
        />
        <AvatarField
          value={cfg.avatarUrl}
          onChange={(v) => update((p) => ({ ...p, avatarUrl: v }))}
          userId={userId}
        />
      </Section>

      {/* Mensagens */}
      <Section title="Mensagens" icon={MessageCircle} hint="O texto inicial e o texto fora do horário.">
        <Field
          label="Mensagem de boas-vindas"
          value={cfg.welcomeMessage}
          onChange={(v) => update((p) => ({ ...p, welcomeMessage: v }))}
          placeholder="oi! tudo bem? em que posso te ajudar?"
          rows={3}
        />
        <p className="text-[11px] text-muted-foreground -mt-2">
          Use uma linha em branco para quebrar a saudação em duas mensagens — fica mais natural.
        </p>
        <Field
          label="Mensagem fora do horário"
          value={cfg.awayMessage}
          onChange={(v) => update((p) => ({ ...p, awayMessage: v }))}
          rows={3}
        />
      </Section>

      {/* Horário */}
      <Section title="Horário de atendimento" icon={Clock} hint="Define quando o status fica 🟢 Online.">
        <Toggle
          label="Respeitar horário de atendimento"
          hint="Se desligado, o atendente fica online 24/7."
          value={cfg.schedule.enabled}
          onChange={(v) =>
            update((p) => ({ ...p, schedule: { ...p.schedule, enabled: v } }))
          }
        />

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1.5">
            <Calendar size={12} /> Dias da semana
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d) => {
              const active = cfg.schedule.days.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDay(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground border border-border/40 hover:border-primary/40"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Início</label>
            <input
              type="time"
              value={`${String(cfg.schedule.startHour).padStart(2, "0")}:${String(cfg.schedule.startMinute).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                update((p) => ({
                  ...p,
                  schedule: { ...p.schedule, startHour: h || 0, startMinute: m || 0 },
                }));
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fim</label>
            <input
              type="time"
              value={`${String(cfg.schedule.endHour).padStart(2, "0")}:${String(cfg.schedule.endMinute).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                update((p) => ({
                  ...p,
                  schedule: { ...p.schedule, endHour: h || 0, endMinute: m || 0 },
                }));
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-sm outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </Section>

      {/* Comportamento */}
      <Section title="Comportamento humano" icon={Sparkles} hint="Detalhes que reforçam a sensação de conversa real.">
        <Toggle
          label="Simular erros de digitação"
          hint="Ocasionalmente envia uma palavra com erro e corrige logo depois (😅)."
          value={cfg.simulateTypos}
          onChange={(v) => update((p) => ({ ...p, simulateTypos: v }))}
        />

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Velocidade de digitação
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SPEED_OPTIONS.map((opt) => {
              const active = cfg.typingSpeed === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => update((p) => ({ ...p, typingSpeed: opt.id }))}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    active
                      ? "bg-primary/10 border-primary text-foreground"
                      : "bg-background border-border/40 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="text-[11px] mt-0.5 leading-tight">{opt.hint}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1.5">
            <Type size={12} /> Tom de linguagem
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TONE_OPTIONS.map((opt) => {
              const active = cfg.tone === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => update((p) => ({ ...p, tone: opt.id }))}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    active
                      ? "bg-primary/10 border-primary text-foreground"
                      : "bg-background border-border/40 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="text-[11px] mt-0.5 leading-tight">{opt.hint}</div>
                </button>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AssistantPanel;
