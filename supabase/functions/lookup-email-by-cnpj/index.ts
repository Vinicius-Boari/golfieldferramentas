// Edge function: lookup do e-mail vinculado a um CNPJ (usado no login por CNPJ).
// Substitui a RPC pública `get_email_by_cnpj` para evitar enumeração anônima de e-mails.
// Usa service_role internamente; valida o formato do CNPJ antes de consultar.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let cnpj = "";
  try {
    const body = await req.json();
    cnpj = String(body?.cnpj ?? "").trim();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) {
    // Resposta genérica — não revela se existe ou não
    return json({ email: null });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await admin.rpc("get_email_by_cnpj", { _cnpj: digits });
  if (error) {
    console.error("lookup-email-by-cnpj error:", error);
    return json({ email: null });
  }

  return json({ email: (data as string | null) ?? null });
});
