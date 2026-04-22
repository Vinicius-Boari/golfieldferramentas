// Helper compartilhado para edge functions de IA:
// - valida que a IA está habilitada
// - checa se o orçamento mensal foi atingido
// - registra cada chamada no log de uso
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Custos aproximados em USD por chamada (valores conservadores baseados nos modelos)
export const COST_BY_FEATURE: Record<string, number> = {
  chat: 0.0005,        // Gemini Flash streaming
  prompt: 0.0008,      // Gemini Flash com system prompt
  "image-fast": 0.005, // Nano Banana
  "image-std": 0.01,   // Nano Banana 2
  "image-pro": 0.04,   // Gemini 3 Pro Image
};

export type AiCheckResult =
  | { ok: true; remainingUsd: number; budgetUsd: number; usedUsd: number }
  | { ok: false; reason: "disabled" | "budget_exceeded"; message: string; usedUsd?: number; budgetUsd?: number };

export function getAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}

/** Verifica se a IA está habilitada e dentro do orçamento mensal */
export async function checkAiBudget(estimatedCost: number): Promise<AiCheckResult> {
  const admin = getAdminClient();

  const { data: settings } = await admin
    .from("ai_settings")
    .select("enabled, monthly_budget_usd")
    .eq("id", 1)
    .maybeSingle();

  if (!settings) {
    return { ok: false, reason: "disabled", message: "IA não configurada." };
  }
  if (!settings.enabled) {
    return {
      ok: false,
      reason: "disabled",
      message: "A IA está desativada pelo administrador.",
    };
  }

  // Soma uso do mês corrente (timezone UTC)
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { data: usageRows } = await admin
    .from("ai_usage_log")
    .select("estimated_cost_usd")
    .gte("created_at", startOfMonth);

  const usedUsd = (usageRows ?? []).reduce(
    (sum, r: any) => sum + Number(r.estimated_cost_usd ?? 0),
    0,
  );
  const budgetUsd = Number(settings.monthly_budget_usd ?? 0);

  if (usedUsd + estimatedCost > budgetUsd) {
    return {
      ok: false,
      reason: "budget_exceeded",
      message: `Orçamento mensal de IA atingido ($${budgetUsd.toFixed(2)}). Aumente o limite no painel ou aguarde o próximo mês.`,
      usedUsd,
      budgetUsd,
    };
  }

  return {
    ok: true,
    remainingUsd: budgetUsd - usedUsd,
    budgetUsd,
    usedUsd,
  };
}

/** Registra uma chamada de IA no log de uso. userId pode ser null (uso anônimo). */
export async function logAiUsage(params: {
  userId: string | null;
  feature: string;
  model?: string;
  costUsd: number;
}) {
  const admin = getAdminClient();
  const { error } = await admin.from("ai_usage_log").insert({
    user_id: params.userId,
    feature: params.feature,
    model: params.model ?? null,
    estimated_cost_usd: params.costUsd,
  });
  if (error) console.error("logAiUsage error:", error);
}

/** Extrai o user_id do JWT de Authorization (sem validar). Retorna null se não houver. */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const admin = getAdminClient();
    const { data } = await admin.auth.getUser(token);
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
