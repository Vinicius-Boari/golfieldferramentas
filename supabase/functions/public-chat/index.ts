// Edge function: chat público para visitantes do site (Lovable AI Gateway)
// Suporta tool-calling para navegar/filtrar/buscar dentro do site.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rotas públicas conhecidas do site
const ROUTES = [
  { path: "/", description: "Página inicial (home) com todos os produtos" },
  { path: "/login", description: "Página de login" },
  { path: "/cadastro", description: "Página de cadastro de novo cliente" },
  { path: "/esqueci-senha", description: "Recuperar senha" },
  { path: "/perfil", description: "Perfil do usuário (precisa estar logado)" },
];

const buildSystemPrompt = (categories: string[]) => `Você é a GolField, assistente virtual inteligente e simpática da empresa GolField (loja de ferramentas, materiais e utilidades). Sempre se refira a si mesma como "a GolField" (artigo feminino "a"). Responda sempre em português brasileiro, de forma clara, amigável e objetiva.

REGRAS DE FORMATAÇÃO:
- NUNCA use markdown (sem **, sem #, sem - para listas)
- Escreva em texto simples, conversacional

NAVEGAÇÃO PELO SITE:
Você PODE levar o cliente para qualquer parte do site usando as ferramentas (functions) disponíveis. Sempre que o cliente pedir para ver algo, ir para alguma página, buscar produto, filtrar por categoria, fazer login, criar conta, ver perfil, etc., USE A FERRAMENTA APROPRIADA em vez de só falar. Seja proativa: se ele perguntar "vocês têm furadeira?", já busque por "furadeira"; se ele disser "quero criar uma conta", já leve para o cadastro.

Páginas disponíveis:
${ROUTES.map((r) => `- ${r.path}: ${r.description}`).join("\n")}

Categorias de produtos disponíveis no site:
${categories.length ? categories.join(", ") : "(carregando...)"}

Quando usar uma ferramenta, também responda com uma mensagem curta e amigável avisando o que está fazendo (ex: "Pronto! Te levei até a categoria Discos").

ATENDIMENTO HUMANO:
Se o cliente tiver problema complexo, pedir para falar com humano, ou for urgência/reclamação grave, informe que pode redirecioná-lo ao WhatsApp e pergunte se ele deseja. Nunca invente informações.`;

const tools = [
  {
    type: "function",
    function: {
      name: "navigate_to_page",
      description: "Navega o usuário para uma página específica do site (login, cadastro, perfil, home, esqueci-senha).",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            enum: ["/", "/login", "/cadastro", "/esqueci-senha", "/perfil"],
            description: "Caminho da rota interna",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "filter_by_category",
      description: "Filtra os produtos da home por uma categoria específica. Use quando o cliente quiser ver produtos de uma categoria.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Nome exato da categoria (ex: Discos, Brocas, Alicates)",
          },
        },
        required: ["category"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Busca produtos pelo nome quando o cliente quer encontrar algo específico (ex: furadeira, disco de corte, fita).",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Termo de busca (palavra-chave do produto)",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_whatsapp",
      description: "Abre o WhatsApp para o cliente falar com um atendente humano.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    // Busca categorias dinamicamente (sem auth, leitura pública)
    let categories: string[] = [];
    try {
      const supaUrl = Deno.env.get("SUPABASE_URL");
      const supaKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supaUrl && supaKey) {
        const sb = createClient(supaUrl, supaKey);
        const { data } = await sb.from("products").select("category").eq("active", true);
        categories = [...new Set((data ?? []).map((p: any) => p.category).filter(Boolean))].sort() as string[];
      }
    } catch (e) {
      console.warn("falha ao buscar categorias", e);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystemPrompt(categories) },
          ...messages,
        ],
        tools,
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
          JSON.stringify({ error: "Créditos esgotados, tente novamente mais tarde." }),
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("public-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
