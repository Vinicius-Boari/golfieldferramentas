import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount: number | null;
  min_order_value: number;
  usage_limit: number | null;
  per_user_limit: number;
  times_used: number;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
  applies_to: "all" | "products" | "categories";
  product_ids: string[];
  category_ids: string[];
  exclude_product_ids: string[];
  exclude_category_ids: string[];
  logged_in_only: boolean;
  first_purchase_only: boolean;
  cumulative: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_total: number;
  discount_amount: number;
  created_at: string;
}

export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Coupon[];
    },
  });
};

export const useCouponUsage = (couponId?: string) => {
  return useQuery({
    queryKey: ["coupon-usage", couponId],
    enabled: !!couponId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupon_usage")
        .select("*")
        .eq("coupon_id", couponId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as CouponUsage[];
    },
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async (params: {
      code: string;
      cart_items: { product_id: string; category: string; price: number; quantity: number }[];
      order_total: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: { action: "validate", ...params },
      });
      if (error) throw error;
      return data as {
        valid: boolean;
        reason?: string;
        coupon?: { id: string; code: string; name: string; discount_type: string; discount_value: number };
        discount_amount?: number;
      };
    },
  });
};
