import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** ─── Types ─────────────────────────────────────────────────────────────── */

export type SplashFrequency =
  | "always"
  | "session"
  | "daily"
  | "weekly"
  | "custom";

export type SplashMediaKind = "none" | "image" | "video";
export type SplashMediaPosition = "background" | "top" | "left" | "right";
export type SplashTextAlign = "left" | "center" | "right";
export type SplashWidth = "small" | "medium" | "large" | "full" | "custom";
export type SplashSizeUnit = "px" | "%" | "vw" | "vh";
export type SplashSecondaryAction = "close" | "redirect";
export type SplashCountdownAction = "hide" | "close" | "message";

export interface SplashConfig {
  /** Master ON/OFF switch. */
  enabled: boolean;

  /** Frequency that controls when the splash is re-shown. */
  frequency: SplashFrequency;
  /** Custom frequency in hours (used when frequency === "custom"). */
  customHours: number;

  /** Media block (image, video or none). */
  media: {
    kind: SplashMediaKind;
    url: string;
    position: SplashMediaPosition;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
  };

  /** Text content. */
  texts: {
    title: string;
    titleEnabled: boolean;
    titleColor: string;
    subtitle: string;
    subtitleEnabled: boolean;
    subtitleColor: string;
    align: SplashTextAlign;
  };

  /** Primary CTA button. */
  primaryButton: {
    enabled: boolean;
    text: string;
    url: string;
    newTab: boolean;
  };

  /** Secondary action button. */
  secondaryButton: {
    enabled: boolean;
    text: string;
    action: SplashSecondaryAction;
    url: string;
  };

  /** Audio block. */
  audio: {
    enabled: boolean;
    url: string;
    volume: number; // 0..1
    loop: boolean;
    showControls: boolean;
  };

  /** Optional countdown timer. */
  countdown: {
    enabled: boolean;
    /** ISO date string (UTC) of the deadline. */
    endsAt: string;
    label: string;
    onEnd: SplashCountdownAction;
    endMessage: string;
  };

  /** Visual appearance. */
  appearance: {
    /** Background color of the inner card (HEX). */
    cardBackground: string;
    /** Overlay color (HEX) and opacity (0..1). */
    overlayColor: string;
    overlayOpacity: number;
    /** Border radius in px. */
    borderRadius: number;
    /** Card width preset. */
    width: SplashWidth;
    /** Custom width (used when width === "custom"). */
    customWidth: number;
    customWidthUnit: SplashSizeUnit;
    /** Custom height (used when width === "custom" or "full"). 0 = auto. */
    customHeight: number;
    customHeightUnit: SplashSizeUnit;
    /** Click outside the card closes it. */
    closeOnBackdrop: boolean;
    /** ESC key closes it. */
    closeOnEsc: boolean;
  };
}

/** ─── Defaults ───────────────────────────────────────────────────────────── */

export const defaultSplashConfig: SplashConfig = {
  enabled: false,
  frequency: "daily",
  customHours: 24,
  media: {
    kind: "none",
    url: "",
    position: "top",
    autoplay: true,
    loop: true,
    muted: true,
  },
  texts: {
    title: "Bem-vindo à Golfield!",
    titleEnabled: true,
    titleColor: "#FFFFFF",
    subtitle: "Confira nossas ofertas exclusivas para atacado.",
    subtitleEnabled: true,
    subtitleColor: "#AAAAAA",
    align: "center",
  },
  primaryButton: {
    enabled: true,
    text: "Ver produtos",
    url: "#produtos",
    newTab: false,
  },
  secondaryButton: {
    enabled: true,
    text: "Continuar sem ver",
    action: "close",
    url: "",
  },
  audio: {
    enabled: false,
    url: "",
    volume: 0.5,
    loop: true,
    showControls: true,
  },
  countdown: {
    enabled: false,
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    label: "Oferta termina em:",
    onEnd: "hide",
    endMessage: "Oferta expirada",
  },
  appearance: {
    cardBackground: "#1C1C1C",
    overlayColor: "#000000",
    overlayOpacity: 0.85,
    borderRadius: 16,
    width: "medium",
    customWidth: 800,
    customWidthUnit: "px",
    customHeight: 0,
    customHeightUnit: "px",
    closeOnBackdrop: true,
    closeOnEsc: true,
  },
};

/** Deep-merge a partial saved config onto the defaults so new fields work
 * on rows persisted before they existed. */
const mergeWithDefaults = (saved: Partial<SplashConfig> | null | undefined): SplashConfig => {
  if (!saved) return defaultSplashConfig;
  return {
    ...defaultSplashConfig,
    ...saved,
    media: { ...defaultSplashConfig.media, ...(saved.media ?? {}) },
    texts: { ...defaultSplashConfig.texts, ...(saved.texts ?? {}) },
    primaryButton: { ...defaultSplashConfig.primaryButton, ...(saved.primaryButton ?? {}) },
    secondaryButton: { ...defaultSplashConfig.secondaryButton, ...(saved.secondaryButton ?? {}) },
    audio: { ...defaultSplashConfig.audio, ...(saved.audio ?? {}) },
    countdown: { ...defaultSplashConfig.countdown, ...(saved.countdown ?? {}) },
    appearance: { ...defaultSplashConfig.appearance, ...(saved.appearance ?? {}) },
  };
};

/** ─── Read hook ──────────────────────────────────────────────────────────── */

export const useSplashConfig = () => {
  const queryClient = useQueryClient();

  // Realtime: invalidate the cache whenever the row changes so the public
  // splash and the admin preview both reflect new edits without a reload.
  useEffect(() => {
    const channel = supabase
      .channel("splash_config_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "splash_config" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["splash-config"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["splash-config"],
    queryFn: async (): Promise<SplashConfig> => {
      const { data, error } = await (supabase as any)
        .from("splash_config")
        .select("config")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return mergeWithDefaults(data?.config as Partial<SplashConfig> | null);
    },
    staleTime: 1000 * 60,
  });
};

/** ─── Save hook (admin) ──────────────────────────────────────────────────── */

export const useSaveSplashConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: SplashConfig) => {
      const { data: existing } = await (supabase as any)
        .from("splash_config")
        .select("id")
        .limit(1)
        .maybeSingle();

      const jsonConfig = JSON.parse(JSON.stringify(config));
      if (existing) {
        const { error } = await (supabase as any)
          .from("splash_config")
          .update({ config: jsonConfig })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("splash_config")
          .insert([{ config: jsonConfig }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["splash-config"] });
    },
  });
};

/** ─── Frequency helpers ──────────────────────────────────────────────────── */

const STORAGE_KEY = "golfield:splash:lastSeen";
const SESSION_KEY = "golfield:splash:seenSession";

/** Returns true if the splash should be shown now based on the frequency
 * setting and the timestamp persisted on the visitor's device. */
export const shouldShowSplash = (cfg: SplashConfig): boolean => {
  if (!cfg.enabled) return false;
  if (cfg.frequency === "always") return true;

  if (cfg.frequency === "session") {
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "1";
    } catch {
      return true;
    }
  }

  let lastSeen = 0;
  try {
    lastSeen = Number(localStorage.getItem(STORAGE_KEY) || 0);
  } catch {
    return true;
  }
  if (!lastSeen) return true;

  const hours =
    cfg.frequency === "daily" ? 24
    : cfg.frequency === "weekly" ? 24 * 7
    : Math.max(1, cfg.customHours || 24);

  return Date.now() - lastSeen >= hours * 60 * 60 * 1000;
};

/** Marks the splash as seen using the appropriate storage. */
export const markSplashSeen = (cfg: SplashConfig) => {
  try {
    if (cfg.frequency === "session") {
      sessionStorage.setItem(SESSION_KEY, "1");
    } else if (cfg.frequency !== "always") {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }
  } catch {
    /* ignore */
  }
};
