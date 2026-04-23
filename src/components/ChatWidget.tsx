import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Send, Headset } from "lucide-react";
import { chatBus, normalizeCategoryId, onCartReply, type CartReplyPayload } from "@/lib/chatBus";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useAssistantConfig,
  isWithinSchedule,
  computeTypingDelay,
  interMessageDelay,
  readingDelay,
  welcomeDelay,
  defaultAssistantConfig,
} from "@/hooks/useAssistantConfig";

const WHATSAPP_URL = "https://wa.me/5511959409051";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-chat`;

type Msg = { role: "user" | "assistant"; content: string; showWhatsApp?: boolean };
type ToolCallAcc = { id?: string; name: string; args: string };

/** Animated 3-dots — the WhatsApp "typing..." indicator. */
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

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
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

/** Default human-looking avatar (initials) when admin hasn't uploaded one. */
const InitialsAvatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  const initial = (name?.trim()?.[0] || "A").toUpperCase();
  // Pick a stable warm color from the name — feels more like a real photo placeholder.
  const palette = ["#F59E0B", "#EC4899", "#10B981", "#6366F1", "#EF4444", "#06B6D4"];
  const idx = (name?.charCodeAt(0) || 0) % palette.length;
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
      style={{ width: size, height: size, background: palette[idx], fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Split a long bot response into 2-3 shorter chat-style messages. */
const splitForChat = (text: string): string[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];
  // Respect explicit double newlines from the model.
  const explicit = trimmed
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (explicit.length > 1) return explicit;

  // For short messages, leave as-is.
  if (trimmed.length < 160) return [trimmed];

  // Otherwise split on sentence boundaries while keeping chunks reasonable.
  const sentences = trimmed.match(/[^.!?\n]+[.!?]?/g) || [trimmed];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    const candidate = (buf ? buf + " " : "") + s.trim();
    if (candidate.length > 140 && buf) {
      out.push(buf.trim());
      buf = s.trim();
    } else {
      buf = candidate;
    }
    if (out.length >= 2) break;
  }
  if (buf) out.push(buf.trim());
  return out.slice(0, 3);
};

/** Strip a bot message of formal/robotic openings — just in case the model slips. */
const dehumanizeFix = (text: string): string =>
  text
    .replace(/^Olá!?\s*Sou\s+(o|a)\s+assistente[^.]*\.?\s*/i, "")
    .replace(/^Como posso (ajudá-?lo|ajudá-?la|ajudar)[^?]*\??\s*/i, "")
    .replace(/Atenciosamente[\s\S]*$/i, "")
    .replace(/^[*•\-]\s+/gm, "") // strip bullets
    .trim();

/** A small set of common typo pairs used to simulate a human mistake-then-fix. */
const TYPO_PAIRS: Array<[string, string]> = [
  ["verificar", "verfiicar"],
  ["então", "entao"],
  ["obrigado", "obirgado"],
  ["produto", "prudoto"],
  ["agora", "agroa"],
  ["entrega", "entreaga"],
  ["quanto", "qaunto"],
  ["pedido", "peddio"],
  ["estoque", "estouqe"],
  ["enviar", "envair"],
];

/** With low probability, return a typo'd version + corrected follow-up. */
const maybeMakeTypo = (text: string): { typo: string; correction: string } | null => {
  if (Math.random() > 0.08) return null; // ~8% chance
  for (const [right, wrong] of TYPO_PAIRS) {
    const re = new RegExp(`\\b${right}\\b`, "i");
    if (re.test(text)) {
      const typo = text.replace(re, wrong);
      const correction = `${right}* 😅`;
      return { typo, correction };
    }
  }
  return null;
};

/** Detect simple intents to trigger empathy / acknowledgment. */
const detectIntent = (text: string): "frustration" | "thanks" | null => {
  const lower = text.toLowerCase();
  if (/(demora|demorou|problema|errado|n[aã]o funciona|p[ée]ssimo|ruim|chato|reclama)/.test(lower))
    return "frustration";
  if (/^(obrigad[oa]|valeu|brigad[oa]|thanks|ty)\b/.test(lower) || /(muito obrigad)/.test(lower))
    return "thanks";
  return null;
};

/** Try to extract the user's first name when they introduce themselves. */
const extractName = (text: string): string | null => {
  const m =
    text.match(/\bmeu nome (?:é|eh)\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)/i) ||
    text.match(/\bme chamo\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)/i) ||
    text.match(/\bsou (?:o|a)\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)/i);
  return m ? m[1] : null;
};

const ChatWidget = () => {
  const { data: rawAssistant } = useAssistantConfig();
  // Always-defined config so the component never crashes during the first render.
  const assistant = rawAssistant ?? defaultAssistantConfig;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const userNameRef = useRef<string | null>(null);
  const welcomeShownRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: cartOpen } = useCart();
  const isMobile = useIsMobile();
  const shiftLeft = cartOpen && !isMobile;

  const online = useMemo(() => isWithinSchedule(assistant), [assistant]);

  // Push a single bot message with humanized typing delay.
  const pushBotMessage = useCallback(
    async (content: string, opts: { showWhatsApp?: boolean } = {}) => {
      const cleaned = dehumanizeFix(content);
      if (!cleaned) return;
      setIsTyping(true);
      await sleep(computeTypingDelay(cleaned, assistant.typingSpeed));
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", content: cleaned, ...opts }]);
    },
    [assistant.typingSpeed]
  );

  // Push a multi-message reply (chat-style), with realistic gaps between bubbles.
  const pushBotReply = useCallback(
    async (rawText: string, opts: { showWhatsApp?: boolean } = {}) => {
      const parts = splitForChat(dehumanizeFix(rawText));
      if (parts.length === 0) return;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        // Optionally simulate a typo on this chunk
        if (assistant.simulateTypos) {
          const typo = maybeMakeTypo(part);
          if (typo) {
            await pushBotMessage(typo.typo);
            await sleep(700 + Math.random() * 200);
            await pushBotMessage(typo.correction);
            await sleep(interMessageDelay());
            continue;
          }
        }

        await pushBotMessage(part, isLast ? opts : {});
        if (!isLast) await sleep(interMessageDelay());
      }
    },
    [assistant.simulateTypos, pushBotMessage]
  );

  /** Tool-call execution from the model. */
  const runToolCall = useCallback(
    (name: string, rawArgs: string) => {
      let args: any = {};
      try {
        args = rawArgs ? JSON.parse(rawArgs) : {};
      } catch {
        args = {};
      }

      const goHomeThen = (cb: () => void) => {
        if (location.pathname !== "/") {
          navigate("/");
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
        case "add_to_cart": {
          const q = String(args.product_query ?? "").trim();
          const qty = Math.max(1, Math.floor(Number(args.quantity) || 1));
          if (!q) return;
          const replyId = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          goHomeThen(() => chatBus.emit("chat:addToCart", { query: q, quantity: qty, replyId }));
          break;
        }
        case "open_cart": {
          goHomeThen(() => chatBus.emit("chat:openCart", undefined as any));
          break;
        }
        case "offer_whatsapp":
        case "open_whatsapp": {
          break;
        }
      }
    },
    [navigate, location.pathname]
  );

  // Cart reply messages — also routed through the humanized pipeline.
  useEffect(() => {
    const off = onCartReply((r: CartReplyPayload) => {
      let content = "";
      if (r.ok === false) {
        const reason = r.reason;
        const query = r.query;
        content =
          reason === "not_found"
            ? `não encontrei nada parecido com "${query}" 😕\npode tentar com um nome um pouco mais específico?`
            : `não consegui adicionar "${query}" agora\ntenta de novo em instantes?`;
      } else {
        if (!r.adjusted) {
          content = `pronto! adicionei ${r.addedQty}× "${r.productName}" no orçamento 🛒`;
        } else if (r.adjustReason === "below_min") {
          content = `o "${r.productName}" tem mínimo de ${r.minQty} un.\ncomo é vendido em múltiplos de ${r.minQty}, ajustei pra ${r.addedQty}`;
        } else {
          content = `o "${r.productName}" é vendido em múltiplos de ${r.minQty}\nvocê pediu ${r.requestedQty}, ajustei pra ${r.addedQty}`;
        }
      }
      void pushBotReply(content);
    });
    return off;
  }, [pushBotReply]);

  // Welcome flow — runs the first time the user opens the chat.
  useEffect(() => {
    if (!open || welcomeShownRef.current) return;
    welcomeShownRef.current = true;

    let cancelled = false;
    (async () => {
      // initial pause as if the attendant just noticed someone arrived
      await sleep(welcomeDelay());
      if (cancelled) return;

      if (!online) {
        await pushBotReply(assistant.awayMessage);
        return;
      }
      await pushBotReply(assistant.welcomeMessage);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, online, assistant.awayMessage, assistant.welcomeMessage]);

  // Auto-scroll to the latest message / typing indicator.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
    return () => cancelAnimationFrame(id);
  }, [messages, isTyping, loading, open]);

  const detectHumanRequest = (text: string) => {
    const lower = text.toLowerCase();
    return /(falar com atendente|atendente humano|humano|urgente|reclama|n[aã]o resolveu|whats|whatsapp)/i.test(
      lower
    );
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || isTyping) return;

    // Capture user name if introduced
    const maybeName = extractName(text);
    if (maybeName && !userNameRef.current) userNameRef.current = maybeName;

    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    // Human "reading" pause before any reaction
    await sleep(readingDelay());

    // Out of office → respond with the away message and stop.
    if (!online) {
      setLoading(false);
      await pushBotReply(assistant.awayMessage);
      inputRef.current?.focus();
      return;
    }

    // Empathy / thanks — micro-acknowledgment BEFORE the actual answer.
    const intent = detectIntent(text);
    if (intent === "frustration") {
      await pushBotReply("poxa, me desculpa por isso 😕\nvamos resolver agora");
    } else if (intent === "thanks") {
      await pushBotReply("imagina! 😊\nqualquer coisa tô por aqui");
      setLoading(false);
      inputRef.current?.focus();
      return; // no need to call the model
    }

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          assistant: {
            name: assistant.attendantName,
            tone: assistant.tone,
            userName: userNameRef.current,
          },
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Falha na resposta");

      // We collect the WHOLE stream first, then reveal it through the
      // humanized typing pipeline — this way the user sees "..." dots
      // and gradual messages instead of an instant reply.
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;
      const toolAcc: Record<number, ToolCallAcc> = {};

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
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content as string | undefined;
            if (content) assistantSoFar += content;

            const tcs = delta?.tool_calls as Array<any> | undefined;
            if (Array.isArray(tcs)) {
              for (const tc of tcs) {
                const idx: number = typeof tc.index === "number" ? tc.index : 0;
                if (!toolAcc[idx]) toolAcc[idx] = { name: "", args: "" };
                if (tc.id) toolAcc[idx].id = tc.id;
                if (tc.function?.name) toolAcc[idx].name = tc.function.name;
                if (typeof tc.function?.arguments === "string") {
                  toolAcc[idx].args += tc.function.arguments;
                }
              }
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      const calls = Object.values(toolAcc).filter((c) => c.name);
      for (const c of calls) runToolCall(c.name, c.args);

      let finalText = assistantSoFar;
      if (calls.length > 0 && !finalText) finalText = "pronto ✅";

      // Personalize with user's first name if known
      if (userNameRef.current && finalText && Math.random() < 0.5) {
        finalText = finalText.replace(
          /^([a-zà-ú])/,
          (c) => `${userNameRef.current!.split(" ")[0]}, ${c}`
        );
      }

      const lastUserText = text;
      const calledWhatsapp = calls.some(
        (c) => c.name === "offer_whatsapp" || c.name === "open_whatsapp"
      );
      const shouldShowWhatsapp =
        calledWhatsapp ||
        detectHumanRequest(lastUserText) ||
        /whatsapp|atendente|nossa equipe|redirecion/i.test(finalText.toLowerCase());

      await pushBotReply(finalText, { showWhatsApp: shouldShowWhatsapp });
    } catch (err) {
      console.error("chat error:", err);
      await pushBotReply(
        "desculpa, deu um problemaa aqui 😕\ntenta de novo, ou se preferir fala comigo no WhatsApp",
        { showWhatsApp: true }
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [
    input,
    loading,
    isTyping,
    messages,
    online,
    runToolCall,
    pushBotReply,
    assistant.awayMessage,
    assistant.attendantName,
    assistant.tone,
  ]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // If the chat is disabled in admin, render nothing at all.
  if (!assistant.enabled) return null;

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0, opacity: 0, x: 0 }}
        animate={{ scale: 1, opacity: 1, x: shiftLeft ? -472 : 0 }}
        transition={{
          scale: { delay: 1.2, type: "spring", stiffness: 260, damping: 20 },
          opacity: { delay: 1.2, duration: 0.3 },
          x: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 ${cartOpen ? "z-[60]" : "z-40"} p-3.5 md:p-4 rounded-full shadow-xl text-white transition-shadow hover:shadow-2xl`}
        style={{ background: "#2563EB", boxShadow: "0 10px 30px -8px rgba(37,99,235,0.55)" }}
        aria-label="Abrir conversa"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="block">
              <X size={26} />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="block">
              <Headset size={26} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95, x: shiftLeft ? -472 : 0 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: shiftLeft ? -472 : 0 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{
              opacity: { duration: 0.25 },
              y: { type: "spring", stiffness: 280, damping: 26 },
              scale: { type: "spring", stiffness: 280, damping: 26 },
              x: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
            }}
            className={`fixed ${cartOpen ? "z-[60]" : "z-40"} bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200
                       bottom-20 right-4 left-4 max-h-[calc(100vh-7rem)]
                       md:bottom-24 md:right-6 md:left-auto md:w-[380px] md:h-[560px] md:max-h-[80vh]`}
            style={{ boxShadow: "0 25px 60px -15px rgba(0,0,0,0.3)" }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 text-white"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563EB)" }}
            >
              {assistant.avatarUrl ? (
                <img
                  src={assistant.avatarUrl}
                  alt={assistant.attendantName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/40"
                />
              ) : (
                <InitialsAvatar name={assistant.attendantName} size={40} />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] leading-tight truncate">
                  {assistant.attendantName}
                </div>
                {assistant.companyLabel && (
                  <div className="text-[10px] uppercase tracking-wider text-white/70 truncate">
                    {assistant.companyLabel}
                  </div>
                )}
                <div className="text-xs text-white/85 flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block ${online ? "bg-green-400" : "bg-red-400"}`}
                  />
                  {online ? "Online agora" : "Ausente no momento"}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                aria-label="Fechar conversa"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-white">
              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const grouped = prev && prev.role === m.role;
                return (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.18 }}
                        className={`px-3.5 py-2 text-sm rounded-2xl whitespace-pre-wrap break-words ${
                          m.role === "user"
                            ? "bg-[#2563EB] text-white rounded-br-md"
                            : "bg-slate-100 text-slate-900 rounded-bl-md border border-slate-200"
                        } ${grouped ? "mt-0.5" : "mt-1.5"}`}
                      >
                        {m.content || <span className="opacity-50">…</span>}
                      </motion.div>
                      {m.showWhatsApp && <WhatsAppButton />}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-md px-3">
                    <TypingDots />
                  </div>
                </motion.div>
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
                disabled={!input.trim() || loading || isTyping}
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
