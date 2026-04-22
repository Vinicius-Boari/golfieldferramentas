import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autorizado" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Não autorizado" }, 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Caller must be owner
    const { data: ownerCheck } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "owner")
      .maybeSingle();

    if (!ownerCheck) {
      return json({ error: "Apenas o dono pode gerenciar clientes" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const { action, userId, email, password, profile } = body as {
      action?: string;
      userId?: string;
      email?: string;
      password?: string;
      profile?: Record<string, string>;
    };

    if (action === "list") {
      // 1) Get all auth users
      const { data: authResp, error: listErr } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (listErr) return json({ error: listErr.message }, 400);
      const authUsers = authResp?.users ?? [];

      // 2) Get all roles to exclude admins/owners
      const { data: roles } = await adminClient
        .from("user_roles")
        .select("user_id, role");
      const staffIds = new Set((roles ?? []).map((r: any) => r.user_id));

      // 3) Get all profiles
      const { data: profiles } = await adminClient
        .from("profiles")
        .select("user_id, cnpj, razao_social, nome_fantasia, nome_responsavel, telefone, email, segmento, cargo, inscricao_estadual");

      const profileMap = new Map(
        (profiles ?? []).map((p: any) => [p.user_id, p])
      );

      const customers = authUsers
        .filter((u: any) => !staffIds.has(u.id))
        .map((u: any) => {
          const p = profileMap.get(u.id) ?? {};
          return {
            id: u.id,
            email: u.email ?? p.email ?? "",
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            email_confirmed_at: u.email_confirmed_at,
            banned_until: u.banned_until,
            providers: u.app_metadata?.providers ?? [u.app_metadata?.provider ?? "email"],
            profile: {
              cnpj: p.cnpj ?? "",
              razao_social: p.razao_social ?? "",
              nome_fantasia: p.nome_fantasia ?? "",
              nome_responsavel: p.nome_responsavel ?? "",
              telefone: p.telefone ?? "",
              segmento: p.segmento ?? "",
              cargo: p.cargo ?? "",
              inscricao_estadual: p.inscricao_estadual ?? "",
            },
          };
        });

      return json({ customers });
    }

    if (!userId) return json({ error: "ID do cliente é obrigatório" }, 400);

    // Make sure target is NOT staff (owner/admin) — protect them
    const { data: targetRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    if (targetRole) {
      return json({ error: "Este usuário pertence ao painel administrativo" }, 403);
    }

    if (action === "update") {
      // Update auth (email/password) + profile fields
      const authPayload: Record<string, string> = {};
      if (email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) return json({ error: "E-mail inválido" }, 400);
        authPayload.email = email;
      }
      if (password) {
        if (password.length < 6) return json({ error: "A senha deve ter pelo menos 6 caracteres" }, 400);
        authPayload.password = password;
      }
      if (Object.keys(authPayload).length > 0) {
        const { error: upErr } = await adminClient.auth.admin.updateUserById(userId, authPayload);
        if (upErr) return json({ error: upErr.message }, 400);
      }

      if (profile && typeof profile === "object") {
        const allowed = [
          "razao_social",
          "nome_fantasia",
          "nome_responsavel",
          "telefone",
          "cnpj",
          "segmento",
          "cargo",
          "inscricao_estadual",
        ];
        const update: Record<string, string> = {};
        for (const k of allowed) {
          if (typeof profile[k] === "string") update[k] = profile[k];
        }
        if (email) update.email = email;
        if (Object.keys(update).length > 0) {
          const { error: pErr } = await adminClient
            .from("profiles")
            .update(update)
            .eq("user_id", userId);
          if (pErr) return json({ error: pErr.message }, 400);
        }
      }

      return json({ success: true });
    }

    if (action === "delete") {
      // Delete profile first (no cascade on user_id), then auth user
      await adminClient.from("profiles").delete().eq("user_id", userId);
      const { error: delErr } = await adminClient.auth.admin.deleteUser(userId);
      if (delErr) return json({ error: delErr.message }, 400);
      return json({ success: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (err: any) {
    return json({ error: err?.message ?? "Erro interno" }, 500);
  }
});
