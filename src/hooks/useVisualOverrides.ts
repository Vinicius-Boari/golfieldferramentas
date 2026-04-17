import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Visual overrides — admin-controlled CSS adjustments per element.
 * Each override targets an element marked with [data-visual-id="<id>"].
 * Styles are applied globally via a single injected <style> tag so they
 * affect the public site for every visitor. Read-only for non-admins.
 */

export type VisualStyles = {
  scale?: number;            // transform: scale(...)
  width?: string;            // any CSS width (e.g. "320px", "20rem", "100%")
  height?: string;           // any CSS height
  translateX?: string;       // px or %
  translateY?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  rotate?: number;           // deg
  opacity?: number;          // 0-1
};

export type VisualOverride = {
  id: string;
  element_id: string;
  styles: VisualStyles;
  enabled: boolean;
};

const STYLE_TAG_ID = "visual-overrides-style";

const buildCssRule = (override: VisualOverride): string => {
  if (!override.enabled) return "";
  const s = override.styles ?? {};
  const decls: string[] = [];

  // transform combines scale + translate + rotate
  const transforms: string[] = [];
  if (s.translateX || s.translateY) {
    transforms.push(`translate(${s.translateX || "0"}, ${s.translateY || "0"})`);
  }
  if (typeof s.scale === "number" && s.scale !== 1) {
    transforms.push(`scale(${s.scale})`);
  }
  if (typeof s.rotate === "number" && s.rotate !== 0) {
    transforms.push(`rotate(${s.rotate}deg)`);
  }
  if (transforms.length > 0) {
    decls.push(`transform: ${transforms.join(" ")} !important`);
    decls.push(`transform-origin: center center`);
  }

  if (s.width) decls.push(`width: ${s.width} !important`);
  if (s.height) decls.push(`height: ${s.height} !important`);
  if (s.paddingTop) decls.push(`padding-top: ${s.paddingTop} !important`);
  if (s.paddingRight) decls.push(`padding-right: ${s.paddingRight} !important`);
  if (s.paddingBottom) decls.push(`padding-bottom: ${s.paddingBottom} !important`);
  if (s.paddingLeft) decls.push(`padding-left: ${s.paddingLeft} !important`);
  if (s.marginTop) decls.push(`margin-top: ${s.marginTop} !important`);
  if (s.marginRight) decls.push(`margin-right: ${s.marginRight} !important`);
  if (s.marginBottom) decls.push(`margin-bottom: ${s.marginBottom} !important`);
  if (s.marginLeft) decls.push(`margin-left: ${s.marginLeft} !important`);
  if (typeof s.opacity === "number") decls.push(`opacity: ${s.opacity} !important`);

  if (decls.length === 0) return "";
  return `[data-visual-id="${override.element_id}"] { ${decls.join("; ")}; }`;
};

export const buildOverridesCss = (overrides: VisualOverride[]): string =>
  overrides.map(buildCssRule).filter(Boolean).join("\n");

export const useVisualOverrides = () => {
  return useQuery({
    queryKey: ["visual-overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visual_overrides")
        .select("id, element_id, styles, enabled");
      if (error) throw error;
      return (data ?? []) as VisualOverride[];
    },
    staleTime: 60_000,
  });
};

/**
 * Mounts a single global <style> tag and keeps it synced with the
 * latest overrides from the database. Subscribes to realtime so admin
 * changes propagate instantly.
 */
export const useApplyVisualOverrides = () => {
  const { data: overrides = [] } = useVisualOverrides();
  const queryClient = useQueryClient();

  useEffect(() => {
    let tag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
    if (!tag) {
      tag = document.createElement("style");
      tag.id = STYLE_TAG_ID;
      document.head.appendChild(tag);
    }
    tag.textContent = buildOverridesCss(overrides);
  }, [overrides]);

  // Realtime sync — when admin saves, all live visitors update immediately.
  useEffect(() => {
    const channel = supabase
      .channel("visual-overrides-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "visual_overrides" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["visual-overrides"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
