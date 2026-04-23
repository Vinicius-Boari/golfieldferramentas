import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SplashConfig } from "@/hooks/useSplashConfig";

interface Props {
  config: SplashConfig["texts"]["rotating"];
  align: SplashConfig["texts"]["align"];
  /** Text size variant: title (h2), subtitle (p), or caption (default). */
  variant?: "title" | "subtitle" | "caption";
  /** Called once after the last phrase has been fully shown
   *  (only fires when loop is OFF). */
  onAllShown?: () => void;
}

/**
 * Renders a list of phrases that cycle through with either a typewriter
 * effect (character-by-character, like an Instagram caption being typed) or
 * a smooth fade transition between phrases.
 */
const SplashRotatingText = ({ config, align, variant = "caption", onAllShown }: Props) => {
  const firedRef = useRef(false);
  const phrases = (config.phrases || []).filter((p) => p.trim().length > 0);
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");
  const timerRef = useRef<number | null>(null);

  /** Reset when config changes (admin preview). */
  useEffect(() => {
    setIndex(0);
    setDisplayed("");
    setPhase("typing");
    firedRef.current = false;
  }, [phrases.length, config.effect, config.typeSpeedMs, config.holdMs]);

  /** Fade effect: switch the whole phrase every (holdMs + 600ms transition). */
  useEffect(() => {
    if (config.effect !== "fade" || phrases.length === 0) return;
    const total = Math.max(800, config.holdMs);
    const id = window.setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next >= phrases.length) {
          if (config.loop) return 0;
          if (!firedRef.current) {
            firedRef.current = true;
            // Defer so the last phrase remains visible briefly before close.
            window.setTimeout(() => onAllShown?.(), 400);
          }
          return i;
        }
        return next;
      });
    }, total);
    return () => window.clearInterval(id);
  }, [config.effect, config.holdMs, config.loop, phrases.length, onAllShown]);

  /** Typewriter effect: type → hold → delete → next phrase. */
  useEffect(() => {
    if (config.effect !== "typewriter" || phrases.length === 0) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);

    const current = phrases[index] ?? "";
    const speed = Math.max(15, config.typeSpeedMs);

    if (phase === "typing") {
      if (displayed.length < current.length) {
        timerRef.current = window.setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, speed);
      } else {
        timerRef.current = window.setTimeout(() => setPhase("holding"), 50);
      }
    } else if (phase === "holding") {
      const isLast = index >= phrases.length - 1;
      if (isLast && !config.loop) {
        if (!firedRef.current) {
          firedRef.current = true;
          timerRef.current = window.setTimeout(() => onAllShown?.(), Math.max(600, config.holdMs));
        }
        return; // stop at the end
      }
      timerRef.current = window.setTimeout(() => setPhase("deleting"), Math.max(400, config.holdMs));
    } else if (phase === "deleting") {
      if (displayed.length > 0) {
        timerRef.current = window.setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length - 1));
        }, Math.max(10, speed / 2));
      } else {
        const next = (index + 1) % phrases.length;
        setIndex(next);
        setPhase("typing");
      }
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [config.effect, config.typeSpeedMs, config.holdMs, config.loop, displayed, index, phase, phrases, onAllShown]);

  if (phrases.length === 0) return null;

  const justify =
    align === "center" ? "justify-center text-center"
    : align === "right" ? "justify-end text-right"
    : "justify-start text-left";

  const sizeClass =
    variant === "title"
      ? "text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
      : variant === "subtitle"
      ? "text-sm sm:text-base leading-relaxed"
      : "text-sm sm:text-base font-medium leading-relaxed";

  if (config.effect === "fade") {
    const current = phrases[index] ?? "";
    return (
      <div className={`flex ${justify} min-h-[1.6em]`}>
        <AnimatePresence mode="wait">
          <motion.p
            key={`${index}-${current}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`${sizeClass} whitespace-pre-line`}
            style={{ color: config.color }}
          >
            {current}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  // Typewriter
  return (
    <div className={`flex ${justify} min-h-[1.6em]`}>
      <p
        className={`${sizeClass} whitespace-pre-line`}
        style={{ color: config.color }}
      >
        {displayed}
        <span className="inline-block w-[2px] h-[0.9em] align-[-0.1em] ml-0.5 animate-pulse"
          style={{ backgroundColor: config.color }}
        />
      </p>
    </div>
  );
};

export default SplashRotatingText;
