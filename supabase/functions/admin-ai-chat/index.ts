// Edge function: chat assistant para o painel admin (Lovable AI Gateway)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkAiBudget, logAiUsage, getUserIdFromRequest, COST_BY_FEATURE } from "../_shared/ai-budget.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o assistente de IA do painel administrativo da Golfield (vendasgolfield.com.br), um e-commerce B2B de produtos para golfe.

Sua função é ajudar o administrador a:
- Tirar dúvidas sobre como gerenciar produtos, categorias, cupons, clientes e usuários do painel
- Sugerir descrições de produtos atraentes e profissionais (em português)
- Sugerir nomes de categorias, textos de marketing, mensagens de WhatsApp
- Analisar e dar conselhos sobre estratégias de vendas B2B
- Ajudar a redigir comunicados, e-mails e respostas a clientes
- Explicar funcionalidades do sistema (login por CNPJ, recuperação de senha, etc.)

Diretrizes:
- Responda sempre em português do Brasil
- Seja direto, prático e objetivo
- Use markdown para formatar respostas (listas, negrito, títulos quando útil)
- Quando sugerir textos, ofereça 2-3 variações
- Foque em vendas B2B e no nicho de golfe quando relevante`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    // Checa orçamento e habilitação
    const cost = COST_BY_FEATURE.chat;
    const budget = await checkAiBudget(cost);
    if (!budget.ok) {
      return new Response(JSON.stringify({ error: budget.message }), {
        status: budget.reason === "disabled" ? 423 : 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = await getUserIdFromRequest(req);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados na Lovable. Adicione saldo no workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Loga uso (não bloqueia stream se falhar)
    if (userId) {
      logAiUsage({ userId, feature: "chat", model: "google/gemini-3-flash-preview", costUsd: cost })
        .catch((e) => console.error(e));
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("admin-ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
