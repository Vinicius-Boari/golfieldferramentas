import { useMemo, useState, type ComponentType } from "react";
import { Loader2, MessageCircle, Power, Mail, Send, Eye, RotateCcw, Upload, Link2, Lock, type LucideProps } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_WHATSAPP_TEMPLATE,
  type SystemSettingsConfig,
} from "@/hooks/useHomeConfig";

interface Props {
  value: SystemSettingsConfig;
  onChange: (next: SystemSettingsConfig) => void;
  userId?: string;
}

const VARIABLES: { key: string; label: string; sample: string }[] = [
  { key: "{name}", label: "Nome do cliente", sample: "João Silva" },
  { key: "{phone}", label: "Telefone do cliente", sample: "(11) 99999-9999" },
  { key: "{email}", label: "Email do cliente", sample: "joao@empresa.com" },
  { key: "{products}", label: "Lista de produtos", sample: "• Martelo — 10un x R$25,00 = R$250,00\n• Trena 5m — 5un x R$30,00 = R$150,00" },
  { key: "{subtotal}", label: "Subtotal", sample: "R$ 400,00" },
  { key: "{total}", label: "Total final", sample: "R$ 400,00" },
  { key: "{coupon}", label: "Cupom (se houver)", sample: "BLACK10 (-R$ 40,00)" },
  { key: "{date}", label: "Data atual", sample: new Date().toLocaleDateString("pt-BR") },
];

export const renderWhatsAppTemplate = (
  template: string,
  data: Record<string, string>
): string => {
  let out = template;
  Object.entries(data).forEach(([key, val]) => {
    const safe = (val ?? "").toString();
    out = out.split(`{${key}}`).join(safe);
  });
  return out;
};

const SectionCard = ({ title, icon: Icon, children, action }: {
  title: string;
  icon: ComponentType<LucideProps>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-primary/10"><Icon size={16} className="text-primary" /></div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex items-center gap-3 group"
  >
    <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-secondary border border-border"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const SystemSettingsPanel = ({ value, onChange, userId }: Props) => {
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imgMode, setImgMode] = useState<"upload" | "url">(value.maintenance.imageUrl ? "url" : "upload");

  const wa = value.whatsappMessage;
  const mt = value.maintenance;
  const qa = value.quoteAccess;

  const previewMessage = useMemo(() => {
    const sampleData: Record<string, string> = {};
    VARIABLES.forEach(v => { sampleData[v.key.replace(/[{}]/g, "")] = v.sample; });
    return renderWhatsAppTemplate(wa.template || "", sampleData);
  }, [wa.template]);

  const insertVariable = (variable: string) => {
    const ta = document.getElementById("wa-template-textarea") as HTMLTextAreaElement | null;
    if (!ta) {
      onChange({ ...value, whatsappMessage: { ...wa, template: (wa.template || "") + variable } });
      return;
    }
    const start = ta.selectionStart ?? wa.template.length;
    const end = ta.selectionEnd ?? wa.template.length;
    const next = wa.template.slice(0, start) + variable + wa.template.slice(end);
    onChange({ ...value, whatsappMessage: { ...wa, template: next } });
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + variable.length, start + variable.length);
    });
  };

  const handleResetTemplate = () => {
    if (!confirm("Restaurar a mensagem padrão? Suas alterações serão perdidas.")) return;
    onChange({ ...value, whatsappMessage: { ...wa, template: DEFAULT_WHATSAPP_TEMPLATE } });
  };

  const handleSendReset = async () => {
    const email = resetEmail.trim().toLowerCase();
    if (!email) { setResetStatus({ type: "error", message: "Informe um email." }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setResetStatus({ type: "error", message: "Email inválido." }); return; }
    setResetLoading(true);
    setResetStatus(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/esqueci-senha`,
      });
      if (error) throw error;
      setResetStatus({ type: "success", message: `Email de reset enviado para ${email} (se cadastrado).` });
      toast.success("Email de teste enviado");
    } catch (err: any) {
      setResetStatus({ type: "error", message: err.message || "Erro ao enviar email" });
      toast.error(err.message || "Erro ao enviar email");
    } finally {
      setResetLoading(false);
    }
  };

  const handleUploadImage = async (file: File | null) => {
    if (!file || !userId) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const safeName = file.name.replace(/\.[^.]+$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
      const filePath = `${userId}/${Date.now()}-${safeName}.${ext.toLowerCase()}`;
      const { error } = await supabase.storage.from("maintenance-images").upload(filePath, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("maintenance-images").getPublicUrl(filePath);
      onChange({ ...value, maintenance: { ...mt, imageUrl: data.publicUrl } });
      toast.success("Imagem enviada!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1">Configurações do Sistema</h2>
        <p className="text-sm text-muted-foreground">Mensagem do WhatsApp, modo de manutenção e teste de email de reset de senha.</p>
      </div>

      {/* WhatsApp Message Customization */}
      <SectionCard
        title="Mensagem WhatsApp (orçamento)"
        icon={MessageCircle}
        action={
          <Toggle
            checked={wa.enabled}
            onChange={v => onChange({ ...value, whatsappMessage: { ...wa, enabled: v } })}
            label={wa.enabled ? "Ativa" : "Padrão"}
          />
        }
      >
        <p className="text-xs text-muted-foreground -mt-1">
          Quando ativa, esta mensagem substitui a padrão do botão "Enviar Orçamento via WhatsApp".
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Template da mensagem</label>
              <button
                type="button"
                onClick={handleResetTemplate}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw size={11} /> Restaurar padrão
              </button>
            </div>
            <textarea
              id="wa-template-textarea"
              value={wa.template}
              onChange={e => onChange({ ...value, whatsappMessage: { ...wa, template: e.target.value } })}
              rows={14}
              className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/60 text-sm font-mono outline-none focus:border-primary/50 resize-y leading-relaxed"
              placeholder="Digite o template..."
            />
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Inserir variável</p>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES.map(v => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    title={v.label}
                    className="px-2 py-1 rounded-md bg-card border border-border/60 text-[11px] font-mono hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye size={12} className="text-muted-foreground" />
              <label className="text-xs font-medium text-muted-foreground">Pré-visualização (com dados de exemplo)</label>
            </div>
            <div className="rounded-xl bg-card border border-border/60 p-3.5 min-h-[300px] max-h-[440px] overflow-auto">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-foreground/90">
                {previewMessage || <span className="text-muted-foreground italic">Mensagem vazia</span>}
              </pre>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Maintenance Mode */}
      <SectionCard
        title="Modo de Manutenção"
        icon={Power}
        action={
          <Toggle
            checked={mt.enabled}
            onChange={v => onChange({ ...value, maintenance: { ...mt, enabled: v } })}
            label={mt.enabled ? "ATIVO" : "Desativado"}
          />
        }
      >
        {mt.enabled && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300">
            ⚠️ Modo manutenção <strong>ativo</strong>. Visitantes não conseguirão acessar o site público até desativar.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Título</label>
            <input
              value={mt.title}
              onChange={e => onChange({ ...value, maintenance: { ...mt, title: e.target.value } })}
              className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/60 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-end">
            <Toggle
              checked={mt.allowAdminAccess}
              onChange={v => onChange({ ...value, maintenance: { ...mt, allowAdminAccess: v } })}
              label="Permitir acesso de administradores"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descrição</label>
          <textarea
            value={mt.description}
            onChange={e => onChange({ ...value, maintenance: { ...mt, description: e.target.value } })}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/60 text-sm outline-none focus:border-primary/50 resize-none"
          />
        </div>

        {/* Image / banner */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Banner (opcional)</label>
            <div className="flex items-center gap-1 rounded-lg bg-card p-0.5 border border-border/60">
              <button type="button" onClick={() => setImgMode("upload")}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${imgMode === "upload" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                <Upload size={10} /> Upload
              </button>
              <button type="button" onClick={() => setImgMode("url")}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${imgMode === "url" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                <Link2 size={10} /> URL
              </button>
            </div>
          </div>
          {imgMode === "upload" ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-3">
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={e => void handleUploadImage(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
              />
              {uploading && <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground"><Loader2 size={12} className="animate-spin" /> Enviando...</div>}
            </div>
          ) : (
            <input
              type="text"
              value={mt.imageUrl}
              onChange={e => onChange({ ...value, maintenance: { ...mt, imageUrl: e.target.value } })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-card border border-border/60 text-sm outline-none focus:border-primary/50"
            />
          )}
          {mt.imageUrl && (
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-lg bg-card border border-border/60 overflow-hidden flex items-center justify-center">
                <img src={mt.imageUrl} alt="Banner manutenção" className="w-full h-full object-contain" />
              </div>
              <button type="button" onClick={() => onChange({ ...value, maintenance: { ...mt, imageUrl: "" } })}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors">Remover</button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Password Reset Test */}
      <SectionCard title="Teste de Email de Reset de Senha" icon={Mail}>
        <p className="text-xs text-muted-foreground -mt-1">
          Dispara um email real de redefinição de senha para o endereço informado, usando o mesmo sistema do fluxo "Esqueci minha senha".
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={resetEmail}
            onChange={e => { setResetEmail(e.target.value); setResetStatus(null); }}
            placeholder="email@exemplo.com"
            className="flex-1 px-3 py-2.5 rounded-xl bg-card border border-border/60 text-sm outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={handleSendReset}
            disabled={resetLoading || !resetEmail.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {resetLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {resetLoading ? "Enviando..." : "Enviar email de teste"}
          </button>
        </div>
        {resetStatus && (
          <div className={`rounded-xl px-3 py-2.5 text-xs ${resetStatus.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-destructive/10 border border-destructive/30 text-destructive"}`}>
            {resetStatus.message}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          Por segurança, o sistema sempre responde com sucesso mesmo que o email não exista, evitando enumeração de usuários.
        </p>
      </SectionCard>
    </div>
  );
};

export default SystemSettingsPanel;
