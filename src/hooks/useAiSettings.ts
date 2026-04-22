import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AiSettings = {
  enabled: boolean;
  monthly_budget_usd: number;
};

export type AiUsageStats = {
  totalUsd: number;
  byFeature: Record<string, { count: number; usd: number }>;
  count: number;
};

const startOfMonthISO = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
};

export function useAiSettings() {
  return useQuery({
    queryKey: ["ai-settings"],
    queryFn: async (): Promise<AiSettings> => {
      const { data, error } = await supabase
        .from("ai_settings")
        .select("enabled, monthly_budget_usd")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return {
        enabled: data?.enabled ?? true,
        monthly_budget_usd: Number(data?.monthly_budget_usd ?? 1),
      };
    },
    staleTime: 30_000,
  });
}

export function useUpdateAiSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<AiSettings>) => {
      const { error } = await supabase
        .from("ai_settings")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-settings"] });
      toast.success("Configuração salva");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar"),
  });
}

export function useAiUsageStats() {
  return useQuery({
    queryKey: ["ai-usage-stats"],
    queryFn: async (): Promise<AiUsageStats> => {
      const { data, error } = await supabase
        .from("ai_usage_log")
        .select("feature, estimated_cost_usd")
        .gte("created_at", startOfMonthISO());
      if (error) throw error;
      const stats: AiUsageStats = { totalUsd: 0, byFeature: {}, count: 0 };
      for (const row of data ?? []) {
        const usd = Number((row as any).estimated_cost_usd ?? 0);
        const feature = String((row as any).feature ?? "other");
        stats.totalUsd += usd;
        stats.count += 1;
        if (!stats.byFeature[feature]) stats.byFeature[feature] = { count: 0, usd: 0 };
        stats.byFeature[feature].count += 1;
        stats.byFeature[feature].usd += usd;
      }
      return stats;
    },
    staleTime: 15_000,
  });
}
