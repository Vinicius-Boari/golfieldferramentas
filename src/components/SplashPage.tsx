import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX } from "lucide-react";
import {
  defaultSplashConfig,
  markSplashSeen,
  shouldShowSplash,
  useSplashConfig,
  type SplashConfig,
} from "@/hooks/useSplashConfig";

/** Width preset → max width in px (or full screen). */
const WIDTH_PX: Record<SplashConfig["appearance"]["width"], string> = {
  small: "400px",
  medium: "600px",
  large: "800px",
  full: "100vw",
};

interface Props {
  /** When provided, renders the splash with this config in "preview" mode
   * (ignores frequency, doesn't persist seen state, doesn't autoplay audio). */
  previewConfig?: SplashConfig | null;
  /** Called when the preview is closed by the visitor / admin. */
  onPreviewClose?: () => void;
}

const SplashPage = ({ previewConfig, onPreviewClose }: Props) => {
  const { data: liveConfig } = useSplashConfig();
  const cfg = previewConfig ?? liveConfig ?? defaultSplashConfig;

  const isPreview = !!previewConfig;
  const [open, setOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ── Decide initial visibility ─────────────────────────────────────────── */
  useEffect(() => {
    if (isPreview) {
      setOpen(true);
      return;
    }
    if (!liveConfig) return;
    if (shouldShowSplash(liveConfig)) setOpen(true);
  }, [isPreview, liveConfig]);

  /* ── Body scroll lock while open ───────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* ── ESC closes ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!open || !cfg.appearance.closeOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cfg.appearance.closeOnEsc]);

  /* ── Countdown ticker ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!open || !cfg.countdown.enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open, cfg.countdown.enabled]);

  /* ── Audio autoplay (after first user gesture / open) ──────────────────── */
  useEffect(() => {
    if (!open || isPreview || !cfg.audio.enabled || !cfg.audio.url) return;
    const el = audioRef.current;
    if (!el) return;
    el.volume = Math.max(0, Math.min(1, cfg.audio.volume));
    el.loop = cfg.audio.loop;
    // Most browsers block autoplay with sound; we try once and ignore failure.
    el.play().then(() => setAudioOn(true)).catch(() => setAudioOn(false));
  }, [open, isPreview, cfg.audio.enabled, cfg.audio.url, cfg.audio.volume, cfg.audio.loop]);

  /* ── Countdown auto-action ─────────────────────────────────────────────── */
  const remaining = useMemo(() => {
    if (!cfg.countdown.enabled) return 0;
    const end = new Date(cfg.countdown.endsAt).getTime();
    return Math.max(0, end - now);
  }, [cfg.countdown.enabled, cfg.countdown.endsAt, now]);

  useEffect(() => {
    if (!open || !cfg.countdown.enabled) return;
    if (remaining > 0) return;
    if (cfg.countdown.onEnd === "close") close();
    // For "hide" we just stop rendering the timer; for "message" we replace it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cfg.countdown.enabled, remaining, cfg.countdown.onEnd]);

  const close = () => {
    setOpen(false);
    if (isPreview) {
      onPreviewClose?.();
    } else if (liveConfig) {
      markSplashSeen(liveConfig);
    }
  };

  const onBackdropClick = () => {
    if (cfg.appearance.closeOnBackdrop) close();
  };

  const handlePrimary = () => {
    if (!cfg.primaryButton.url) return close();
    if (cfg.primaryButton.newTab) {
      window.open(cfg.primaryButton.url, "_blank", "noopener,noreferrer");
      close();
    } else {
      close();
      // Same-tab: if it's a hash link on the same page, just scroll/jump.
      window.location.href = cfg.primaryButton.url;
    }
  };

  const handleSecondary = () => {
    if (cfg.secondaryButton.action === "redirect" && cfg.secondaryButton.url) {
      window.location.href = cfg.secondaryButton.url;
      return;
    }
    close();
  };

  if (!open) return null;

  /* ── Render helpers ────────────────────────────────────────────────────── */

  const overlayStyle = {
    backgroundColor: hexToRgba(cfg.appearance.overlayColor, cfg.appearance.overlayOpacity),
  };

  const cardStyle = {
    backgroundColor: cfg.appearance.cardBackground,
    borderRadius: `${cfg.appearance.borderRadius}px`,
    maxWidth: WIDTH_PX[cfg.appearance.width],
    width: cfg.appearance.width === "full" ? "100vw" : "100%",
    maxHeight: cfg.appearance.width === "full" ? "100vh" : "90vh",
  };

  const formatTime = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (d > 0) return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const showMediaBg = cfg.media.kind !== "none" && cfg.media.position === "background";
  const showMediaTop = cfg.media.kind !== "none" && cfg.media.position === "top";
  const showMediaLeft = cfg.media.kind !== "none" && cfg.media.position === "left";
  const showMediaRight = cfg.media.kind !== "none" && cfg.media.position === "right";

  const MediaEl = () => renderMedia(cfg.media);

  return (
    <AnimatePresence>
      <motion.div
        key="splash-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 9999, ...overlayStyle }}
        onMouseDown={(e) => {
          // Only treat clicks on the backdrop itself, not bubbled clicks.
          if (e.target === e.currentTarget) onBackdropClick();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Anúncio promocional"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden border shadow-2xl"
          style={{ ...cardStyle, borderColor: "#2A2A2A" }}
        >
          {/* Background media */}
          {showMediaBg && (
            <div className="absolute inset-0 z-0">
              <MediaEl />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            aria-label="Fechar"
            onClick={close}
            className="absolute top-3 right-3 z-30 p-2 rounded-full transition-colors"
            style={{ color: "#AAAAAA" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#AAAAAA")}
          >
            <X size={20} />
          </button>

          {/* Audio toggle (when controls visible) */}
          {!isPreview && cfg.audio.enabled && cfg.audio.url && cfg.audio.showControls && (
            <button
              type="button"
              aria-label={audioOn ? "Silenciar" : "Ativar som"}
              onClick={() => {
                const el = audioRef.current;
                if (!el) return;
                if (audioOn) {
                  el.pause();
                  setAudioOn(false);
                } else {
                  el.play().then(() => setAudioOn(true)).catch(() => setAudioOn(false));
                }
              }}
              className="absolute top-3 left-3 z-30 p-2 rounded-full transition-colors"
              style={{ color: "#AAAAAA" }}
            >
              {audioOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          )}

          <div
            className={`relative z-10 flex ${
              showMediaLeft ? "flex-col sm:flex-row" : showMediaRight ? "flex-col sm:flex-row-reverse" : "flex-col"
            }`}
          >
            {(showMediaLeft || showMediaRight) && (
              <div className="sm:w-1/2 w-full aspect-video sm:aspect-auto bg-black/30 overflow-hidden">
                <MediaEl />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {showMediaTop && (
                <div className="w-full aspect-video bg-black/30 overflow-hidden">
                  <MediaEl />
                </div>
              )}

              <div
                className="px-6 sm:px-8 py-8 sm:py-10 space-y-4"
                style={{ textAlign: cfg.texts.align }}
              >
                {cfg.texts.titleEnabled && cfg.texts.title && (
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
                    style={{ color: cfg.texts.titleColor }}
                  >
                    {cfg.texts.title}
                  </h2>
                )}

                {cfg.texts.subtitleEnabled && cfg.texts.subtitle && (
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: cfg.texts.subtitleColor }}>
                    {cfg.texts.subtitle}
                  </p>
                )}

                {cfg.countdown.enabled && (
                  <div
                    className={`pt-2 ${
                      cfg.texts.align === "center" ? "flex flex-col items-center" :
                      cfg.texts.align === "right" ? "flex flex-col items-end" : "flex flex-col items-start"
                    }`}
                  >
                    {remaining > 0 ? (
                      <>
                        {cfg.countdown.label && (
                          <span className="text-xs uppercase tracking-wider mb-2" style={{ color: "#AAAAAA" }}>
                            {cfg.countdown.label}
                          </span>
                        )}
                        <span
                          className="font-mono font-bold text-2xl sm:text-3xl tabular-nums"
                          style={{ color: "#E84A25" }}
                        >
                          {formatTime(remaining)}
                        </span>
                      </>
                    ) : cfg.countdown.onEnd === "message" && cfg.countdown.endMessage ? (
                      <span className="font-semibold text-base" style={{ color: "#E84A25" }}>
                        {cfg.countdown.endMessage}
                      </span>
                    ) : null}
                  </div>
                )}

                {(cfg.primaryButton.enabled || cfg.secondaryButton.enabled) && (
                  <div
                    className={`pt-4 flex flex-col sm:flex-row gap-3 ${
                      cfg.texts.align === "center" ? "sm:justify-center" :
                      cfg.texts.align === "right" ? "sm:justify-end" : "sm:justify-start"
                    }`}
                  >
                    {cfg.primaryButton.enabled && (
                      <button
                        type="button"
                        onClick={handlePrimary}
                        className="px-6 py-3 rounded-xl font-semibold text-sm transition-transform hover:scale-105 shadow-lg"
                        style={{ backgroundColor: "#E84A25", color: "#FFFFFF" }}
                      >
                        {cfg.primaryButton.text || "Saiba mais"}
                      </button>
                    )}
                    {cfg.secondaryButton.enabled && (
                      <button
                        type="button"
                        onClick={handleSecondary}
                        className="px-6 py-3 rounded-xl font-medium text-sm transition-colors border"
                        style={{ borderColor: "#2A2A2A", color: "#AAAAAA", backgroundColor: "transparent" }}
                      >
                        {cfg.secondaryButton.text || "Fechar"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden audio element */}
          {!isPreview && cfg.audio.enabled && cfg.audio.url && (
            <audio ref={audioRef} src={cfg.audio.url} preload="auto" />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/** Render the configured media (image or video). */
const renderMedia = (media: SplashConfig["media"]) => {
  if (media.kind === "image" && media.url) {
    return <img src={media.url} alt="" className="w-full h-full object-cover" />;
  }
  if (media.kind === "video" && media.url) {
    // Detect YouTube/Vimeo for iframe embedding; otherwise use <video>.
    const yt = parseYouTubeId(media.url);
    if (yt) {
      const params = new URLSearchParams({
        autoplay: media.autoplay ? "1" : "0",
        mute: media.muted ? "1" : "0",
        loop: media.loop ? "1" : "0",
        playlist: yt,
        controls: "0",
        modestbranding: "1",
        playsinline: "1",
      });
      return (
        <iframe
          src={`https://www.youtube.com/embed/${yt}?${params}`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Splash video"
        />
      );
    }
    const vimeo = parseVimeoId(media.url);
    if (vimeo) {
      const params = new URLSearchParams({
        autoplay: media.autoplay ? "1" : "0",
        muted: media.muted ? "1" : "0",
        loop: media.loop ? "1" : "0",
        controls: "0",
      });
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeo}?${params}`}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          title="Splash video"
        />
      );
    }
    return (
      <video
        src={media.url}
        autoPlay={media.autoplay}
        loop={media.loop}
        muted={media.muted}
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }
  return null;
};

const parseYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m) return m[1];
    }
  } catch { /* not a URL */ }
  return null;
};

const parseVimeoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) {
      const m = u.pathname.match(/(\d+)/);
      if (m) return m[1];
    }
  } catch { /* not a URL */ }
  return null;
};

const pad = (n: number) => String(n).padStart(2, "0");

const hexToRgba = (hex: string, alpha: number): string => {
  const m = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i.exec(hex || "");
  if (!m) return `rgba(0,0,0,${alpha})`;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
};

export default SplashPage;
