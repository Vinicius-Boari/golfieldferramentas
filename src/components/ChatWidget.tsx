import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Send } from "lucide-react";
import { chatBus, normalizeCategoryId } from "@/lib/chatBus";

const WHATSAPP_URL = "https://wa.me/5511959409051";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-chat`;

type Msg = { role: "user" | "assistant"; content: string; showWhatsApp?: boolean };
type ToolCallAcc = { id?: string; name: string; args: string };

const RobotIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* antena */}
    <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="2" r="1.2" fill="currentColor" />
    {/* corpo / cabeça */}
    <rect x="4" y="5" width="16" height="14" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
    {/* olhos */}
    <circle cx="9" cy="12" r="1.6" fill="currentColor" />
    <circle cx="15" cy="12" r="1.6" fill="currentColor" />
    {/* sorriso */}
    <path d="M9.5 15.5 Q12 17 14.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
  </svg>
);

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TypingDots = () => (
  <div className="flex gap-1 items-center px-1 py-2">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="block w-2 h-2 rounded-full bg-slate-400"
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const WhatsAppButton = () => (
  <motion.a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-medium text-xs shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
  >
    <motion.span
      className="absolute inset-0 rounded-lg"
      style={{ boxShadow: "0 0 0 0 rgba(37,211,102,0.7)" }}
      animate={{ boxShadow: ["0 0 0 0 rgba(37,211,102,0.7)", "0 0 0 8px rgba(37,211,102,0)"] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    />
    <WhatsAppIcon size={14} />
    <span className="relative">Falar no WhatsApp</span>
  </motion.a>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Executa uma tool call solicitada pelo modelo
  const runToolCall = useCallback((name: string, rawArgs: string) => {
    let args: any = {};
    try { args = rawArgs ? JSON.parse(rawArgs) : {}; } catch { args = {}; }

    const goHomeThen = (cb: () => void) => {
      if (location.pathname !== "/") {
        navigate("/");
        // espera a Index montar e registrar listeners do bus
        setTimeout(cb, 350);
      } else {
        cb();
      }
    };

    switch (name) {
      case "navigate_to_page": {
        const path = typeof args.path === "string" ? args.path : "/";
        navigate(path);
        break;
      }
      case "filter_by_category": {
        const cat = String(args.category ?? "").trim();
        if (!cat) return;
        const id = cat.toLowerCase() === "todos" ? "todos" : normalizeCategoryId(cat);
        goHomeThen(() => chatBus.emit("chat:setCategory", id));
        break;
      }
      case "search_products": {
        const q = String(args.query ?? "").trim();
        if (!q) return;
        goHomeThen(() => chatBus.emit("chat:setSearch", q));
        break;
      }
      case "open_whatsapp": {
        window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
        break;
      }
    }
  }, [navigate, location.pathname]);

  // Mensagem inicial ao abrir pela primeira vez
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { role: "assistant", content: "Olá! 👋 Eu sou a GolField, sua assistente virtual. Como posso te ajudar hoje?" },
      ]);
    }
  }, [open, messages.length]);

  // Auto-scroll para a última mensagem (inclusive ao abrir o chat)
  useEffect(() => {
    if (!open) return;
    // pequeno delay garante que a animação de abertura terminou de medir o conteúdo
    const id = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
    return () => cancelAnimationFrame(id);
  }, [messages, loading, open]);

  const detectHumanRequest = (text: string) => {
    const lower = text.toLowerCase();
    return /(falar com atendente|atendente humano|humano|urgente|reclama|n[aã]o resolveu|whats|whatsapp)/i.test(lower);
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Falha na resposta");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let started = false;
      let streamDone = false;

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          if (started) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          started = true;
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, nlIdx);
          textBuffer = textBuffer.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Marca para mostrar botão WhatsApp se necessário
      const lastUserText = text;
      const lastAssistantText = assistantSoFar.toLowerCase();
      const shouldShow =
        detectHumanRequest(lastUserText) ||
        /whatsapp|atendente|nossa equipe|redirecion/i.test(lastAssistantText);

      if (shouldShow) {
        setMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, showWhatsApp: true } : m)),
        );
      }
    } catch (err) {
      console.error("chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, tive um problema técnico. Tente novamente ou fale conosco pelo WhatsApp.",
          showWhatsApp: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 p-3.5 md:p-4 rounded-full shadow-xl text-white transition-shadow hover:shadow-2xl"
        style={{ background: "#2563EB", boxShadow: "0 10px 30px -8px rgba(37,99,235,0.55)" }}
        aria-label="Abrir chat com assistente virtual"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="block">
              <X size={26} />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="block">
              <RobotIcon size={26} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Janela de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed z-40 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200
                       bottom-20 right-4 left-4 max-h-[calc(100vh-7rem)]
                       md:bottom-24 md:right-6 md:left-auto md:w-[380px] md:h-[560px] md:max-h-[80vh]"
            style={{ boxShadow: "0 25px 60px -15px rgba(0,0,0,0.3)" }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 text-white"
              style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)" }}
            >
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <RobotIcon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] leading-tight">GolField</div>
                <div className="text-[10px] uppercase tracking-wider text-white/70">Assistente Virtual</div>
                <div className="text-xs text-white/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Online agora
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                aria-label="Fechar chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mensagens */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-3.5 py-2.5 text-sm rounded-2xl whitespace-pre-wrap break-words ${
                        m.role === "user"
                          ? "bg-[#1d4ed8] text-white rounded-br-md"
                          : "bg-blue-50 text-slate-800 rounded-bl-md border border-blue-100"
                      }`}
                    >
                      {m.content || <span className="opacity-50">…</span>}
                    </div>
                    {m.showWhatsApp && <WhatsAppButton />}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-bl-md px-3">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 bg-white px-3 py-2.5 flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                disabled={loading}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/40 transition-all disabled:opacity-60"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-10 h-10 flex items-center justify-center rounded-full text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{ background: "#2563EB" }}
                aria-label="Enviar mensagem"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
