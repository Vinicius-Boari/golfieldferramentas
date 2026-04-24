// Helper compartilhado: exige usuário autenticado com role admin/owner.
// Retorna `{ ok: true, userId }` ou uma `Response` 401/403 pronta para devolver.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type RequireAdminResult =
  | { ok: true; userId: string }
  | { ok: false; response: Response };

export async function requireAdmin(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<RequireAdminResult> {
  const json = (data: unknown, status: number) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return { ok: false, response: json({ error: "Unauthorized" }, 401) };
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, response: json({ error: "Unauthorized" }, 401) };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, response: json({ error: "Server misconfigured" }, 500) };
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return { ok: false, response: json({ error: "Unauthorized" }, 401) };
  }
  const userId = userData.user.id;

  const { data: roles, error: rolesErr } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (rolesErr) {
    console.error("requireAdmin role lookup error:", rolesErr);
    return { ok: false, response: json({ error: "Forbidden" }, 403) };
  }

  const allowed = (roles ?? []).some((r: { role: string }) =>
    r.role === "admin" || r.role === "owner"
  );
  if (!allowed) {
    return { ok: false, response: json({ error: "Forbidden" }, 403) };
  }

  return { ok: true, userId };
}
