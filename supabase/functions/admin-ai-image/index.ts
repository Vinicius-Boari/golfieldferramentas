// Edge function: gera ou edita imagens via Lovable AI (Nano Banana / Gemini Image)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkAiBudget, logAiUsage, getUserIdFromRequest, COST_BY_FEATURE } from "../_shared/ai-budget.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL_TO_COST_KEY: Record<string, string> = {
  "google/gemini-2.5-flash-image": "image-fast",
  "google/gemini-3.1-flash-image-preview": "image-std",
  "google/gemini-3-pro-image-preview": "image-pro",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, imageUrl, model } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const allowedModels = new Set(Object.keys(MODEL_TO_COST_KEY));
    const chosenModel = allowedModels.has(model) ? model : "google/gemini-2.5-flash-image";
    const costKey = MODEL_TO_COST_KEY[chosenModel];
    const cost = COST_BY_FEATURE[costKey];

    // Checa orçamento e habilitação
    const budget = await checkAiBudget(cost);
    if (!budget.ok) {
      return new Response(JSON.stringify({ error: budget.message }), {
        status: budget.reason === "disabled" ? 423 : 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = await getUserIdFromRequest(req);

    const userContent: any = imageUrl
      ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ]
      : prompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [{ role: "user", content: userContent }],
        modalities: ["image", "text"],
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
        return new Response(JSON.stringify({ error: "Saldo de IA esgotado neste mês. Aguarde o próximo ciclo ou adicione créditos." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Image gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar imagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generated = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const text = data.choices?.[0]?.message?.content || "";

    if (!generated) {
      console.error("Sem imagem retornada:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "A IA não retornou nenhuma imagem. Tente refinar o prompt." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Loga uso só após sucesso
    if (userId) {
      logAiUsage({
        userId,
        feature: imageUrl ? "edit" : "image",
        model: chosenModel,
        costUsd: cost,
      }).catch((e) => console.error(e));
    }

    return new Response(JSON.stringify({ image: generated, text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-ai-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
