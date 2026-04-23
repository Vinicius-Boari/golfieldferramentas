import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** ─── Types ─────────────────────────────────────────────────────────────── */

export type AssistantTone = "informal" | "semi-formal";
export type AssistantSpeed = "slow" | "normal" | "fast";

export interface AssistantSchedule {
  enabled: boolean;
  /** Days of week the assistant is "online" (0 = Sun, 6 = Sat). */
  days: number[];
  startHour: number; // 0..23
  startMinute: number; // 0..59
  endHour: number;
  endMinute: number;
}

export interface AssistantConfig {
  /** Master toggle — turns the entire chat widget on or off. */
  enabled: boolean;

  /** Human identity */
  attendantName: string;
  avatarUrl: string;
  companyLabel: string;

  /** Conversation behavior */
  welcomeMessage: string;
  awayMessage: string;
  schedule: AssistantSchedule;

  /** Humanized typing behavior */
  simulateTypos: boolean;
  typingSpeed: AssistantSpeed;
  tone: AssistantTone;
}

/** ─── Defaults ──────────────────────────────────────────────────────────── */

export const defaultAssistantConfig: AssistantConfig = {
  enabled: true,
  attendantName: "Ana",
  avatarUrl: "",
  companyLabel: "GolField",
  welcomeMessage: "oi! tudo bem? 😊\nem que posso te ajudar?",
  awayMessage:
    "oi! 😊 no momento estou fora do horário de atendimento, mas assim que possível te respondo. você também pode deixar seu contato que eu retorno em breve!",
  schedule: {
    enabled: true,
    days: [1, 2, 3, 4, 5], // seg-sex
    startHour: 8,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
  },
  simulateTypos: true,
  typingSpeed: "normal",
  tone: "informal",
};

/** Deep-merge a partial saved config onto the defaults so old DB rows
 *  keep working as new fields are added. */
const mergeWithDefaults = (
  saved: Partial<AssistantConfig> | null | undefined
): AssistantConfig => {
  if (!saved) return defaultAssistantConfig;
  return {
    ...defaultAssistantConfig,
    ...saved,
    schedule: { ...defaultAssistantConfig.schedule, ...(saved.schedule ?? {}) },
  };
};

/** ─── Read hook ─────────────────────────────────────────────────────────── */

export const useAssistantConfig = () => {
  const queryClient = useQueryClient();

  // Realtime: invalidate cache when the row changes so admin tweaks
  // appear instantly on the public chat.
  useEffect(() => {
    const channel = supabase
      .channel(`assistant_config_changes_${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assistant_config" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["assistant-config"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["assistant-config"],
    queryFn: async (): Promise<AssistantConfig> => {
      const { data, error } = await (supabase as any)
        .from("assistant_config")
        .select("config")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return mergeWithDefaults(data?.config as Partial<AssistantConfig> | null);
    },
    staleTime: 1000 * 60,
  });
};

/** ─── Save hook (admin) ─────────────────────────────────────────────────── */

export const useSaveAssistantConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: AssistantConfig) => {
      const { data: existing } = await (supabase as any)
        .from("assistant_config")
        .select("id")
        .limit(1)
        .maybeSingle();

      const jsonConfig = JSON.parse(JSON.stringify(config));
      if (existing) {
        const { error } = await (supabase as any)
          .from("assistant_config")
          .update({ config: jsonConfig })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("assistant_config")
          .insert([{ config: jsonConfig }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistant-config"] });
    },
  });
};

/** ─── Helpers ───────────────────────────────────────────────────────────── */

/** Returns true if the current local time is inside the configured window. */
export const isWithinSchedule = (cfg: AssistantConfig): boolean => {
  if (!cfg.schedule.enabled) return true;
  const now = new Date();
  const day = now.getDay();
  if (!cfg.schedule.days.includes(day)) return false;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const start = cfg.schedule.startHour * 60 + cfg.schedule.startMinute;
  const end = cfg.schedule.endHour * 60 + cfg.schedule.endMinute;

  // Same-day window
  if (start <= end) return minutesNow >= start && minutesNow < end;
  // Overnight window (e.g. 22:00 → 06:00)
  return minutesNow >= start || minutesNow < end;
};

/** Speed multipliers for the typing-delay calculator. Lower = faster. */
const SPEED_FACTOR: Record<AssistantSpeed, number> = {
  slow: 1.4,
  normal: 1,
  fast: 0.65,
};

/** Compute a humanized "typing" delay (in ms) for a given message length.
 *  Includes a ±300ms random jitter so two identical messages never feel the same. */
export const computeTypingDelay = (
  text: string,
  speed: AssistantSpeed = "normal"
): number => {
  const len = text.trim().length;
  let base: number;
  if (len <= 50) {
    base = 800 + Math.random() * 400; // 800–1200ms
  } else if (len <= 150) {
    base = 1500 + Math.random() * 1000; // 1.5–2.5s
  } else {
    base = 2500 + Math.random() * 1500; // 2.5–4s
  }
  const jitter = (Math.random() - 0.5) * 600; // ±300ms
  return Math.max(400, Math.round((base + jitter) * SPEED_FACTOR[speed]));
};

/** Random pause between two consecutive bot messages: 600–1200ms. */
export const interMessageDelay = (): number =>
  600 + Math.round(Math.random() * 600);

/** "Reading" pause after the user sends a message: 400–800ms. */
export const readingDelay = (): number =>
  400 + Math.round(Math.random() * 400);

/** Initial pause before sending the welcome: 1.2–2s. */
export const welcomeDelay = (): number =>
  1200 + Math.round(Math.random() * 800);
