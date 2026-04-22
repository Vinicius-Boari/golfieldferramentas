import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Send, Loader2, Trash2, Copy, Check, User as UserIcon, Bot,
  Image as ImageIcon, Wand2, Video, MessageSquare, Download, Upload, X, Zap,
  Power, Settings as SettingsIcon, DollarSign,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useAiSettings, useUpdateAiSettings, useAiUsageStats } from "@/hooks/useAiSettings";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };
type Tab = "chat" | "image" | "edit" | "prompt";
type ImageQuality = "fast" | "standard" | "premium";
type PromptKind = "video" | "image" | "ad" | "product";

const TABS: { id: Tab; label: string; icon: typeof MessageSquare; desc: string }[] = [
  { id: "chat",   label: "Chat",          icon: MessageSquare, desc: "Converse com a IA" },
  { id: "image",  label: "Gerar Imagem",  icon: ImageIcon,     desc: "Crie imagens por prompt" },
  { id: "edit",   label: "Editar Imagem", icon: Wand2,         desc: "Modifique imagens existentes" },
  { id: "prompt", label: "Prompts Pro",   icon: Video,         desc: "Vídeo, anúncios, descrições" },
];

const QUALITY_MODELS: Record<ImageQuality, { id: string; label: string; desc: string }> = {
  fast:     { id: "google/gemini-2.5-flash-image",        label: "Rápido",   desc: "Gera em segundos · ideal para testes" },
  standard: { id: "google/gemini-3.1-flash-image-preview", label: "Padrão",   desc: "Equilíbrio entre velocidade e qualidade" },
  premium:  { id: "google/gemini-3-pro-image-preview",    label: "Premium",  desc: "Máxima qualidade · um pouco mais lento" },
};

const PROMPT_KINDS: { id: PromptKind; label: string; placeholder: string }[] = [
  { id: "video",   label: "🎬 Prompts de Vídeo (Sora/Veo/Runway)", placeholder: "Ex: um close-up de uma bola de golfe sendo tacada em câmera lenta no nascer do sol" },
  { id: "image",   label: "🎨 Prompts de Imagem (Midjourney/DALL-E)", placeholder: "Ex: tacos de golfe profissionais expostos em um pro shop luxuoso" },
  { id: "ad",      label: "📢 Anúncios (Meta/Google Ads)", placeholder: "Ex: kit de bolas Pro V1 com 30% de desconto para Black Friday" },
  { id: "product", label: "📝 Descrições de Produto", placeholder: "Ex: Driver Titleist TSR3 grafite stiff" },
];

const CHAT_SUGGESTIONS = [
  "Sugira 3 descrições para um kit de bolas Titleist Pro V1",
  "Como crio um cupom de desconto para Black Friday?",
  "Mensagem de WhatsApp para reativar clientes inativos",
  "Quais categorias vendem mais em pro shops?",
];

const IMAGE_SUGGESTIONS = [
  "Banner promocional de Black Friday para loja de golfe, vermelho e dourado, profissional",
  "Foto produto de um driver de golfe sobre fundo branco, iluminação de estúdio, 8k",
  "Cena cinematográfica de jogador batendo no green ao pôr do sol, luz dramática",
  "Logo minimalista para marca de equipamentos de golfe premium, monocromático",
];

const AdminAI = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [tab, setTab] = useState<Tab>("chat");

  // Chat state
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Image gen state
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgQuality, setImgQuality] = useState<ImageQuality>("standard");
  const [imgLoading, setImgLoading] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);

  // Image edit state
  const [editPrompt, setEditPrompt] = useState("");
  const [editSourceUrl, setEditSourceUrl] = useState<string | null>(null);
  const [editSourceFile, setEditSourceFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editedImg, setEditedImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prompt generator state
  const [promptKind, setPromptKind] = useState<PromptKind>("video");
  const [promptIdea, setPromptIdea] = useState("");
  const [promptResult, setPromptResult] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  // Settings + usage panel
  const { data: aiSettings } = useAiSettings();
  const { data: aiUsage, refetch: refetchUsage } = useAiUsageStats();
  const updateSettings = useUpdateAiSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState<string>("");

  const aiEnabled = aiSettings?.enabled ?? true;
  const budgetUsd = aiSettings?.monthly_budget_usd ?? 1;
  const usedUsd = aiUsage?.totalUsd ?? 0;
  const usagePct = budgetUsd > 0 ? Math.min(100, (usedUsd / budgetUsd) * 100) : 0;
  const remainingUsd = Math.max(0, budgetUsd - usedUsd);
  const budgetReached = usedUsd >= budgetUsd;

  const guardOrToast = (): boolean => {
    if (!aiEnabled) {
      toast.error("A IA está desativada. Ative no painel de configurações.");
      return false;
    }
    if (budgetReached) {
      toast.error(`Orçamento mensal atingido ($${budgetUsd.toFixed(2)}). Aumente no painel ou aguarde o próximo mês.`);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores.");
      navigate("/");
    }
  }, [adminLoading, isAdmin, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // ============= CHAT =============
  const sendChat = async (textOverride?: string) => {
    const text = (textOverride ?? chatInput).trim();
    if (!text || isStreaming) return;
    if (!guardOrToast()) return;
    const userMsg: Msg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setChatInput("");
    setIsStreaming(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Sessão expirada. Faça login novamente.");

      const controller = new AbortController();
      abortRef.current = controller;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: newHistory }),
        signal: controller.signal,
      });

      if (resp.status === 429) throw new Error("Muitas requisições. Aguarde um instante.");
      if (resp.status === 402) throw new Error("Saldo de IA esgotado este mês.");
      if (!resp.ok || !resp.body) throw new Error("Erro ao iniciar conversa.");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(err.message || "Erro na conversa");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copiado!");
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const clearChat = () => {
    if (isStreaming) abortRef.current?.abort();
    setMessages([]);
  };

  // ============= IMAGE GEN =============
  const generateImage = async (promptOverride?: string) => {
    const text = (promptOverride ?? imgPrompt).trim();
    if (!text || imgLoading) return;
    if (!guardOrToast()) return;
    setGeneratedImg(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Sessão expirada.");

      const { data, error } = await supabase.functions.invoke("admin-ai-image", {
        body: { prompt: text, model: QUALITY_MODELS[imgQuality].id },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.image) throw new Error("Nenhuma imagem foi retornada.");
      setGeneratedImg(data.image);
      toast.success("Imagem gerada!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar imagem");
    } finally {
      setImgLoading(false);
    }
  };

  const downloadImage = (dataUrl: string, name: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${name}-${Date.now()}.png`;
    a.click();
  };

  // ============= IMAGE EDIT =============
  const handleEditFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 10MB)");
      return;
    }
    setEditSourceFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setEditSourceUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    setEditedImg(null);
  };

  const editImage = async () => {
    if (!editPrompt.trim() || !editSourceUrl || editLoading) return;
    if (!guardOrToast()) return;
    setEditLoading(true);
    setEditedImg(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-ai-image", {
        body: {
          prompt: editPrompt,
          imageUrl: editSourceUrl,
          model: QUALITY_MODELS[imgQuality].id,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.image) throw new Error("Nenhuma imagem foi retornada.");
      setEditedImg(data.image);
      toast.success("Imagem editada!");
      refetchUsage();
    } catch (err: any) {
      toast.error(err.message || "Erro ao editar imagem");
    } finally {
      setEditLoading(false);
    }
  };

  // ============= PROMPT GEN =============
  const generatePrompt = async () => {
    if (!promptIdea.trim() || promptLoading) return;
    if (!guardOrToast()) return;
    setPromptResult("");
    try {
      const { data, error } = await supabase.functions.invoke("admin-ai-prompt", {
        body: { idea: promptIdea, kind: promptKind },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setPromptResult(data?.text || "");
      toast.success("Prompts gerados!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar prompts");
    } finally {
      setPromptLoading(false);
    }
  };

  const copyPromptResult = async () => {
    await navigator.clipboard.writeText(promptResult);
    setPromptCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setPromptCopied(false), 1500);
  };

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
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/produtos")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  IA Studio
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">BETA</span>
                </h1>
                <p className="text-xs text-muted-foreground">Chat · Imagens · Edição · Prompts Pro</p>
              </div>
            </div>
          </div>
          {tab === "chat" && messages.length > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clearChat}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold">
              <Trash2 size={14} /> Limpar
            </motion.button>
          )}
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                    active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}>
                  {active && (
                    <motion.div layoutId="active-tab" className="absolute inset-0 bg-primary rounded-xl"
                      transition={{ type: "spring", duration: 0.5 }} />
                  )}
                  <Icon size={15} className="relative z-10" />
                  <span className="relative z-10">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* ============ CHAT TAB ============ */}
        {tab === "chat" && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-4 py-6 max-w-3xl">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4">
                      <Sparkles size={28} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Como posso ajudar?</h2>
                    <p className="text-sm text-muted-foreground mb-8">Pergunte sobre o painel, peça ideias, descrições, estratégias.</p>
                    <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {CHAT_SUGGESTIONS.map((s, i) => (
                        <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                          onClick={() => sendChat(s)}
                          className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 text-left text-sm transition-colors">
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AnimatePresence initial={false}>
                      {messages.map((msg, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary"
                          }`}>
                            {msg.role === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
                          </div>
                          <div className={`group relative max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                          }`}>
                            {msg.role === "assistant" ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-pre:my-2 prose-pre:bg-secondary prose-code:text-primary">
                                <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            )}
                            {msg.role === "assistant" && msg.content && (
                              <button onClick={() => handleCopy(msg.content, idx)}
                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground">
                                {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isStreaming && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary">
                          <Bot size={16} />
                        </div>
                        <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Pensando…</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border">
              <div className="container mx-auto px-4 py-4 max-w-3xl">
                <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Pergunte algo ao assistente…" disabled={isStreaming}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors disabled:opacity-50" />
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={isStreaming || !chatInput.trim()}
                    className="px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </motion.button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* ============ IMAGE GEN TAB ============ */}
        {tab === "image" && (
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Descreva a imagem</label>
                  <textarea value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)} rows={3}
                    placeholder="Ex: banner promocional de Black Friday para loja de golfe, vermelho e dourado…"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Qualidade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(QUALITY_MODELS) as ImageQuality[]).map((q) => (
                      <button key={q} onClick={() => setImgQuality(q)}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          imgQuality === q ? "border-primary bg-primary/10" : "border-border bg-secondary/30 hover:border-primary/40"
                        }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap size={12} className={imgQuality === q ? "text-primary" : "text-muted-foreground"} />
                          <span className="text-xs font-bold">{QUALITY_MODELS[q].label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">{QUALITY_MODELS[q].desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => generateImage()} disabled={imgLoading || !imgPrompt.trim()}
                  className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {imgLoading ? <><Loader2 size={16} className="animate-spin" /> Gerando…</> : <><Sparkles size={16} /> Gerar Imagem</>}
                </motion.button>
              </div>

              {!generatedImg && !imgLoading && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">💡 Sugestões</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {IMAGE_SUGGESTIONS.map((s, i) => (
                      <button key={i} onClick={() => setImgPrompt(s)}
                        className="p-3 rounded-xl bg-card border border-border hover:border-primary/40 text-left text-xs transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {imgLoading && (
                <div className="rounded-2xl border border-border bg-card aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Gerando imagem… pode levar alguns segundos</p>
                  </div>
                </div>
              )}

              {generatedImg && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden">
                  <img src={generatedImg} alt="Gerada por IA" className="w-full h-auto" />
                  <div className="p-4 flex gap-2">
                    <button onClick={() => downloadImage(generatedImg, "ia-imagem")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors">
                      <Download size={14} /> Baixar
                    </button>
                    <button onClick={() => { setEditSourceUrl(generatedImg); setTab("edit"); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                      <Wand2 size={14} /> Editar esta imagem
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ============ IMAGE EDIT TAB ============ */}
        {tab === "edit" && (
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">1. Imagem original</label>
                  {editSourceUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={editSourceUrl} alt="Original" className="w-full max-h-64 object-contain bg-secondary/30" />
                      <button onClick={() => { setEditSourceUrl(null); setEditSourceFile(null); setEditedImg(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/90 border border-border text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-full p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
                      <Upload size={24} />
                      <span className="text-sm font-semibold">Clique para enviar</span>
                      <span className="text-xs">PNG, JPG, WebP (máx 10MB)</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" hidden
                    onChange={(e) => handleEditFile(e.target.files?.[0] || null)} />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">2. O que mudar?</label>
                  <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} rows={3}
                    placeholder="Ex: troque o fundo por um campo de golfe ao pôr do sol, mantenha o produto"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors resize-none" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Qualidade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(QUALITY_MODELS) as ImageQuality[]).map((q) => (
                      <button key={q} onClick={() => setImgQuality(q)}
                        className={`p-2.5 rounded-xl border text-left transition-colors ${
                          imgQuality === q ? "border-primary bg-primary/10" : "border-border bg-secondary/30"
                        }`}>
                        <span className="text-xs font-bold">{QUALITY_MODELS[q].label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={editImage} disabled={editLoading || !editPrompt.trim() || !editSourceUrl}
                  className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {editLoading ? <><Loader2 size={16} className="animate-spin" /> Editando…</> : <><Wand2 size={16} /> Aplicar edição</>}
                </motion.button>
              </div>

              {editLoading && (
                <div className="rounded-2xl border border-border bg-card aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">A IA está editando sua imagem…</p>
                  </div>
                </div>
              )}

              {editedImg && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="p-3 border-b border-border bg-secondary/30">
                    <p className="text-xs font-semibold text-muted-foreground">✨ Resultado</p>
                  </div>
                  <img src={editedImg} alt="Editada" className="w-full h-auto" />
                  <div className="p-4 flex gap-2">
                    <button onClick={() => downloadImage(editedImg, "ia-editada")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors">
                      <Download size={14} /> Baixar
                    </button>
                    <button onClick={() => { setEditSourceUrl(editedImg); setEditedImg(null); setEditPrompt(""); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                      <Wand2 size={14} /> Editar novamente
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ============ PROMPT TAB ============ */}
        {tab === "prompt" && (
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Tipo de prompt</label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {PROMPT_KINDS.map((k) => (
                      <button key={k.id} onClick={() => setPromptKind(k.id)}
                        className={`p-3 rounded-xl border text-left text-sm transition-colors ${
                          promptKind === k.id ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                        }`}>
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Sua ideia</label>
                  <textarea value={promptIdea} onChange={(e) => setPromptIdea(e.target.value)} rows={3}
                    placeholder={PROMPT_KINDS.find(k => k.id === promptKind)?.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors resize-none" />
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={generatePrompt} disabled={promptLoading || !promptIdea.trim()}
                  className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {promptLoading ? <><Loader2 size={16} className="animate-spin" /> Gerando…</> : <><Sparkles size={16} /> Gerar prompts profissionais</>}
                </motion.button>
              </div>

              {promptResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card p-5 relative">
                  <button onClick={copyPromptResult}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                    {promptCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-pre:my-2 prose-pre:bg-secondary prose-code:text-primary prose-code:text-xs">
                    <ReactMarkdown>{promptResult}</ReactMarkdown>
                  </div>
                </motion.div>
              )}

              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">💡 Como usar</p>
                <p>
                  Copie o prompt gerado e cole em ferramentas de geração de vídeo como{" "}
                  <a href="https://sora.com" target="_blank" rel="noopener" className="text-primary underline">Sora</a>,{" "}
                  <a href="https://deepmind.google/technologies/veo" target="_blank" rel="noopener" className="text-primary underline">Veo</a>,{" "}
                  <a href="https://runwayml.com" target="_blank" rel="noopener" className="text-primary underline">Runway</a> ou{" "}
                  <a href="https://kling.ai" target="_blank" rel="noopener" className="text-primary underline">Kling</a>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAI;
