import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductMediaType = "image" | "video";

export interface DbProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  min_qty: number;
  active: boolean;
  sort_order: number;
  media_type: ProductMediaType;
  video_loop: boolean;
  video_audio: boolean;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as DbProduct[];
    },
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ["products-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as DbProduct[];
    },
  });
};
