// Edge function: gera prompts otimizados (vídeo, imagem cinematográfica, anúncios, etc)
// usando GPT-5 / Gemini Pro via Lovable AI Gateway
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkAiBudget, logAiUsage, getUserIdFromRequest, COST_BY_FEATURE } from "../_shared/ai-budget.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_BY_KIND: Record<string, string> = {
  video: `Você é um diretor de cinema especialista em prompts para modelos de vídeo IA (Sora, Veo 3, Runway, Kling, Pika).

Receba a ideia do usuário e devolva 3 prompts profissionais em INGLÊS (modelos de vídeo entendem melhor inglês), cada um otimizado para um modelo diferente:
1. **Sora / Veo 3** (cinematográfico, longa narrativa)
2. **Runway / Kling** (movimento dinâmico, ação)
3. **Pika / Luma** (estético, suave)

Cada prompt deve incluir: cena principal, movimento de câmera (dolly, pan, tracking), iluminação, paleta de cores, estilo (cinematic, hyperrealistic, anime, etc), duração sugerida e aspect ratio.

Formate a resposta em markdown com cabeçalhos claros, blocos de código \`\`\` para os prompts, e uma breve dica em PT-BR no final sobre como usar.`,

  image: `Você é um especialista em prompt engineering para geração de imagens (Midjourney, DALL-E, Nano Banana, Stable Diffusion).

Receba a ideia e devolva 3 prompts profissionais em INGLÊS, com variações de estilo:
1. **Fotorrealista** (lighting, lens, camera, depth of field)
2. **Artístico/Editorial** (estilo de arte, paleta, composição)
3. **Comercial/Marketing** (produto, fundo, mood)

Inclua sempre: subject, composição, estilo, iluminação, qualidade ("8k, highly detailed, professional photography"), e quando aplicável: aspect ratio.

Formate em markdown com blocos de código para cada prompt e uma dica curta em PT-BR.`,

  ad: `Você é um copywriter sênior especializado em anúncios de e-commerce B2B (Meta Ads, Google Ads, WhatsApp).

Receba o produto/oferta e devolva:
- 3 títulos curtos (máx 40 caracteres)
- 3 descrições (máx 125 caracteres)
- 1 CTA principal e 2 alternativos
- 1 texto longo para post de Instagram/Facebook
- 3 hashtags estratégicas

Tudo em PT-BR, tom persuasivo mas profissional, focado em pro shops e clubes de golfe.`,

  product: `Você é um copywriter de e-commerce especializado em produtos de golfe.

Receba o nome de um produto e devolva:
- 3 versões de descrição curta (até 200 caracteres) — para listagens
- 1 descrição longa profissional (3 parágrafos) — para página do produto
- 5 bullet points de benefícios
- Sugestão de categoria

Tudo em PT-BR, linguagem técnica mas acessível, destacando qualidade B2B.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { idea, kind } = await req.json();
    if (!idea || typeof idea !== "string") {
      return new Response(JSON.stringify({ error: "Ideia obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = SYSTEM_BY_KIND[kind] || SYSTEM_BY_KIND.video;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const cost = COST_BY_FEATURE.prompt;
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
          { role: "system", content: system },
          { role: "user", content: idea },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições. Aguarde alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Saldo de IA esgotado neste mês." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Prompt gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar prompt" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    logAiUsage({ userId, feature: "prompt", model: "google/gemini-3-flash-preview", costUsd: cost })
      .catch((e) => console.error(e));

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-ai-prompt error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
