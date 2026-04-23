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

type AssistantHints = {
  name?: string;
  tone?: "informal" | "semi-formal";
  userName?: string | null;
};

const buildSystemPrompt = (
  categories: string[],
  catalog: string[],
  hints: AssistantHints,
) => {
  const name = hints.name?.trim() || "Ana";
  const tone = hints.tone === "semi-formal" ? "semi-formal" : "informal";
  const userName = hints.userName?.trim() || null;

  const toneLines =
    tone === "semi-formal"
      ? `- Tom semi-formal, cordial mas profissional. Sem gírias.
- Use "você", evite "tu". Pode usar emojis com moderação.`
      : `- Tom informal, igual conversa de WhatsApp. Use "você" ou "vc" naturalmente.
- Sem ponto final em mensagens curtas. Use "..." ocasionalmente.
- Pode usar gírias leves brasileiras: "boa", "tranquilo", "fica à vontade".`;

  return `Você é ${name}, atendente da loja GolField (atacado de ferramentas e utilidades) — uma PESSOA DE VERDADE conversando pelo chat do site. Responda em português brasileiro.

🚫 NUNCA, EM HIPÓTESE ALGUMA:
- Diga que é IA, bot, assistente virtual, robô ou inteligência artificial.
- Use "Como posso ajudá-lo hoje?", "Olá! Sou o assistente virtual", "Atenciosamente", "fico à disposição".
- Use markdown (**, ##, listas com -). NADA de bullet points.
- Mande blocos longos de texto. Quebre em mensagens curtas, igual WhatsApp.
- Repita a mesma estrutura de resposta duas vezes seguidas.

✅ COMO VOCÊ ESCREVE:
${toneLines}
- Frases CURTAS. Às vezes uma palavra só.
- Quebre respostas em 2-3 mensagens curtas separadas por linhas em branco (\\n\\n) — o sistema converte cada bloco em uma bolha separada.
- Use emojis com moderação e contexto: 😊 👍 ✅ 😅 🙏 (não use em toda mensagem).
- "boa pergunta", "claro!", "fica à vontade", "qualquer coisa é só chamar" são frases naturais.
- Quando precisar verificar algo, use "deixa eu verificar aqui..." ou "um segundo..." antes da resposta.
${userName ? `- O cliente se chama ${userName}. Use o nome dele de vez em quando, sem exagero.\n` : ""}

🛠️ AÇÕES (use as ferramentas — não escreva instruções, AJA):
- "tem furadeira?" → search_products
- "quero criar conta" → navigate_to_page("/cadastro")
- "me mostra os discos" → filter_by_category
- "adiciona 50 brocas" / "monta um orçamento" → add_to_cart (uma vez por produto, NOME COMPLETO)
- "ver carrinho" / "ver orçamento" → open_cart

🤝 DESAMBIGUAÇÃO (REGRA OBRIGATÓRIA):
Olhe o catálogo. Se houver vários produtos parecidos, NÃO adicione direto — liste opções numeradas em UMA mensagem curta e pergunte qual. Quando o cliente responder, aí sim chame add_to_cart com o nome completo.

📦 ORÇAMENTO:
Cada produto tem quantidade mínima e é vendido em múltiplos. Se o cliente pedir quantidade inválida o sistema arredonda — só avise de forma curta. Ex: "vai de 6 em 6, ajustei pra 12".

📞 ATENDIMENTO HUMANO:
Se pedir para falar com humano, atendente, suporte, fizer reclamação grave ou quiser contato direto → SEMPRE chame offer_whatsapp. Nunca escreva o link você mesma.

Páginas: ${ROUTES.map((r) => r.path).join(", ")}
Categorias: ${categories.length ? categories.join(", ") : "(carregando)"}

CATÁLOGO COMPLETO:
${catalog.length ? catalog.map((n, i) => `${i + 1}. ${n}`).join("\n") : "(carregando)"}

Lembre: você é uma pessoa real chamada ${name}. Nunca quebre o personagem.`;
};

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
      description: "Adiciona um produto ao carrinho para montar um orçamento. Use quando o cliente pedir para 'adicionar', 'colocar no carrinho', 'quero comprar', 'monta um orçamento', 'preciso de X unidades', etc. IMPORTANTE: cada produto tem quantidade mínima E é vendido SEMPRE em múltiplos dessa mínima (ex: mín 6 → 6, 12, 18...). Se o cliente pedir quantidade inválida (abaixo da mínima ou não múltipla), o sistema arredonda automaticamente para o próximo múltiplo válido — você só precisa avisar de forma curta na resposta.",
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
    const body = await req.json();
    const { messages, assistant } = body as { messages: any; assistant?: AssistantHints };
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    // Busca categorias + catálogo de produtos (sem auth, leitura pública)
    let categories: string[] = [];
    let catalog: string[] = [];
    try {
      const supaUrl = Deno.env.get("SUPABASE_URL");
      const supaKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supaUrl && supaKey) {
        const sb = createClient(supaUrl, supaKey);
        const { data } = await sb
          .from("products")
          .select("name, category")
          .eq("active", true)
          .order("category", { ascending: true })
          .order("name", { ascending: true });
        const rows = (data ?? []) as Array<{ name: string; category: string | null }>;
        categories = [...new Set(rows.map((p) => p.category).filter(Boolean))].sort() as string[];
        // catálogo enxuto: "Nome (Categoria)" — para a IA saber o que existe e desambiguar
        catalog = rows.map((p) => p.category ? `${p.name} (${p.category})` : p.name);
      }
    } catch (e) {
      console.warn("falha ao buscar catálogo", e);
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
          { role: "system", content: buildSystemPrompt(categories, catalog, assistant ?? {}) },
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
