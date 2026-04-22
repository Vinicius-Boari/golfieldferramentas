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

const buildSystemPrompt = (categories: string[]) => `Você é a GolField, assistente virtual da empresa GolField (loja de ferramentas e utilidades). Sempre se refira a si mesma como "a GolField" (feminino). Responda em português brasileiro.

REGRAS DE RESPOSTA (MUITO IMPORTANTE):
- Seja MUITO CURTA e DIRETA. Máximo 2 frases curtas por resposta.
- Nada de introduções longas, nada de "claro!", "com certeza!", "fico feliz em ajudar".
- Vá direto ao ponto. Uma linha sempre que possível.
- NUNCA use markdown (sem **, sem #, sem listas com -).
- Texto simples e objetivo.

NAVEGAÇÃO:
Use as ferramentas disponíveis sempre que o cliente quiser ir a uma página, ver categoria, buscar produto, fazer login, criar conta, etc. Seja proativa: se perguntar "tem furadeira?", já chame search_products. Se pedir conta, já chame navigate_to_page para /cadastro.

Páginas: ${ROUTES.map((r) => r.path).join(", ")}
Categorias: ${categories.length ? categories.join(", ") : "(carregando)"}

Ao usar ferramenta, responda em uma frase curtinha (ex: "Pronto, te levei aos Discos." ou "Buscando furadeira pra você.").

ATENDIMENTO HUMANO (REGRA OBRIGATÓRIA):
Quando o cliente pedir para falar com humano, atendente, suporte, fizer reclamação grave, urgência, ou pedir contato direto, você DEVE chamar a ferramenta offer_whatsapp. NUNCA escreva links de WhatsApp no texto. NUNCA tente abrir WhatsApp sozinha. SEMPRE use a ferramenta — ela mostra o botão verde de WhatsApp para o cliente clicar. Nunca invente informações.`;

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
      name: "add_to_cart",
      description: "Adiciona um produto ao carrinho do cliente para montar um orçamento. Use quando o cliente pedir para 'adicionar', 'colocar no carrinho', 'quero comprar', 'monta um orçamento', 'preciso de X unidades', etc. IMPORTANTE: cada produto tem uma quantidade mínima obrigatória — se o cliente pedir menos, o sistema ajustará automaticamente para a quantidade mínima.",
      parameters: {
        type: "object",
        properties: {
          product_query: {
            type: "string",
            description: "Nome ou palavra-chave do produto que o cliente quer (ex: 'martelo 25mm', 'broca concreto longa 10mm', 'disco de corte madeira 180mm 36 dentes'). Seja o mais específico possível.",
          },
          quantity: {
            type: "number",
            description: "Quantidade que o cliente pediu. Se não informou, use 1 — o sistema ajustará para a mínima.",
          },
        },
        required: ["product_query", "quantity"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_cart",
      description: "Abre o carrinho/orçamento do cliente para que ele veja o que foi montado. Use quando o cliente pedir para 'ver carrinho', 'ver orçamento', 'finalizar', 'mostrar carrinho'.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "offer_whatsapp",
      description: "Oferece ao cliente o botão para falar no WhatsApp. Use SEMPRE que o cliente quiser falar com humano, atendente, fizer reclamação grave, urgência, ou pedir contato direto. NUNCA tente abrir WhatsApp por conta própria — apenas chame esta ferramenta para mostrar o botão.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Frase curta explicando ao cliente (ex: 'Vou te conectar com nossa equipe.')",
          },
        },
        required: ["reason"],
        additionalProperties: false,
      },
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
