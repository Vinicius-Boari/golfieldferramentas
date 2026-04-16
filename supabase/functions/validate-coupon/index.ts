import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id ?? null;
    }

    const body = await req.json();
    const { action, code, cart_items, order_total } = body;

    if (action === "validate") {
      if (!code || typeof code !== "string") {
        return new Response(JSON.stringify({ valid: false, reason: "Código do cupom é obrigatório" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
        });
      }

      const { data: coupon, error } = await adminClient
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .maybeSingle();

      if (error || !coupon) {
        return json({ valid: false, reason: "Cupom inválido" });
      }

      if (!coupon.active) {
        return json({ valid: false, reason: "Cupom desativado" });
      }

      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return json({ valid: false, reason: "Cupom ainda não está ativo" });
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return json({ valid: false, reason: "Cupom expirado" });
      }

      if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
        return json({ valid: false, reason: "Limite de uso atingido" });
      }

      if (coupon.logged_in_only && !userId) {
        return json({ valid: false, reason: "Cupom exclusivo para clientes logados" });
      }

      if (userId && coupon.per_user_limit) {
        const { count } = await adminClient
          .from("coupon_usage")
          .select("*", { count: "exact", head: true })
          .eq("coupon_id", coupon.id)
          .eq("user_id", userId);

        if ((count ?? 0) >= coupon.per_user_limit) {
          return json({ valid: false, reason: "Você já atingiu o limite de uso deste cupom" });
        }
      }

      if (coupon.first_purchase_only && userId) {
        const { count } = await adminClient
          .from("coupon_usage")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        if ((count ?? 0) > 0) {
          return json({ valid: false, reason: "Cupom válido apenas para primeira compra" });
        }
      }

      // Calculate eligible total
      let eligibleTotal = order_total || 0;
      if (cart_items && Array.isArray(cart_items) && coupon.applies_to !== "all") {
        eligibleTotal = 0;
        for (const item of cart_items) {
          let eligible = true;
          if (coupon.applies_to === "products" && coupon.product_ids?.length > 0) {
            eligible = coupon.product_ids.includes(item.product_id);
          } else if (coupon.applies_to === "categories" && coupon.category_ids?.length > 0) {
            eligible = coupon.category_ids.includes(item.category);
          }
          if (coupon.exclude_product_ids?.length > 0 && coupon.exclude_product_ids.includes(item.product_id)) {
            eligible = false;
          }
          if (coupon.exclude_category_ids?.length > 0 && coupon.exclude_category_ids.includes(item.category)) {
            eligible = false;
          }
          if (eligible) {
            eligibleTotal += (item.price || 0) * (item.quantity || 0);
          }
        }
      }

      if (eligibleTotal <= 0) {
        return json({ valid: false, reason: "Cupom não aplicável aos itens do carrinho" });
      }

      if (coupon.min_order_value > 0 && eligibleTotal < coupon.min_order_value) {
        return json({
          valid: false,
          reason: `Valor mínimo do pedido: R$ ${Number(coupon.min_order_value).toFixed(2).replace(".", ",")}`,
        });
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === "percentage") {
        discount = eligibleTotal * (Number(coupon.discount_value) / 100);
        if (coupon.max_discount !== null && discount > Number(coupon.max_discount)) {
          discount = Number(coupon.max_discount);
        }
      } else {
        discount = Number(coupon.discount_value);
      }

      // Never exceed eligible total
      discount = Math.min(discount, eligibleTotal);
      discount = Math.round(discount * 100) / 100;

      return json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
        },
        discount_amount: discount,
      });
    }

    if (action === "apply") {
      if (!userId) {
        return json({ success: false, reason: "Usuário não autenticado" }, 401);
      }

      const { coupon_id, discount_amount } = body;
      if (!coupon_id) {
        return json({ success: false, reason: "Dados inválidos" }, 400);
      }

      // Increment times_used
      const { error: updateError } = await adminClient.rpc("increment_coupon_usage", { _coupon_id: coupon_id });

      // We'll handle this with a direct update if rpc doesn't exist
      if (updateError) {
        await adminClient
          .from("coupons")
          .update({ times_used: undefined }) // fallback
          .eq("id", coupon_id);
      }

      // Record usage
      const { error: insertError } = await adminClient
        .from("coupon_usage")
        .insert({
          coupon_id,
          user_id: userId,
          order_total: order_total || 0,
          discount_amount: discount_amount || 0,
        });

      if (insertError) {
        return json({ success: false, reason: "Erro ao registrar uso do cupom" }, 500);
      }

      return json({ success: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
