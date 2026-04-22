import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ProfileData {
  id: string;
  user_id: string;
  nome_responsavel: string;
  razao_social: string;
  nome_fantasia: string | null;
  email: string;
  cnpj: string;
  telefone: string;
  cargo: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as ProfileData) ?? null;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  // Refetch after auth change
  useEffect(() => {
    if (!userId) {
      queryClient.removeQueries({ queryKey: ["profile"] });
    }
  }, [userId, queryClient]);

  return query;
};

export const getInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
