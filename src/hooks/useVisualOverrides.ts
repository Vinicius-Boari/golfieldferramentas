import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Breakpoint = "desktop" | "tablet" | "mobile";

/**
 * A bag of CSS properties (kebab-case keys -> string values) that we apply to
 * an editable element via an injected stylesheet. Kept loose on purpose:
 * different element types support different properties and we don't want to
 * gatekeep at the type level.
 */
export type StyleBag = Record<string, string>;

export interface ElementStyles {
  desktop?: StyleBag;
  tablet?: StyleBag;
  mobile?: StyleBag;
}

export interface VisualOverride {
  id: string;
  element_id: string;
  enabled: boolean;
  styles: ElementStyles;
}

export interface OverrideMap {
  [elementId: string]: ElementStyles;
}

/** Fetch all visual overrides as a map keyed by element_id. Public-readable. */
export const useVisualOverrides = () => {
  return useQuery({
    queryKey: ["visual-overrides"],
    queryFn: async (): Promise<OverrideMap> => {
      const { data, error } = await supabase
        .from("visual_overrides")
        .select("element_id, enabled, styles");
      if (error) throw error;
      const map: OverrideMap = {};
      for (const row of data ?? []) {
        if (!row.enabled) continue;
        map[row.element_id] = (row.styles as ElementStyles) ?? {};
      }
      return map;
    },
    staleTime: 60_000,
  });
};

/** Bulk-save overrides. Upserts each entry by element_id. */
export const useSaveVisualOverrides = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (map: OverrideMap) => {
      const entries = Object.entries(map);
      // Upsert one by one — number of edited elements is small (<100 typical).
      // Using upsert with onConflict on element_id requires a unique index;
      // we instead delete+insert per id to be safe and keep "enabled" sane.
      for (const [element_id, styles] of entries) {
        // Try update first
        const { data: existing, error: selErr } = await supabase
          .from("visual_overrides")
          .select("id")
          .eq("element_id", element_id)
          .maybeSingle();
        if (selErr) throw selErr;
        const stylesJson = JSON.parse(JSON.stringify(styles));
        if (existing) {
          const { error } = await supabase
            .from("visual_overrides")
            .update({ styles: stylesJson, enabled: true })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("visual_overrides")
            .insert([{ element_id, styles: stylesJson, enabled: true }]);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visual-overrides"] });
    },
  });
};

/** Convert kebab-case CSS bag into a serialized rule body, sanitized. */
export const styleBagToCss = (bag: StyleBag | undefined): string => {
  if (!bag) return "";
  const out: string[] = [];
  for (const [k, v] of Object.entries(bag)) {
    if (v === undefined || v === null || String(v).trim() === "") continue;
    // Defensive: forbid CSS that closes the rule or starts another.
    if (/[{};]/.test(String(v))) continue;
    out.push(`${k}: ${v} !important;`);
  }
  return out.join(" ");
};
