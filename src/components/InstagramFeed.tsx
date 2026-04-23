import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Heart, MessageCircle, ExternalLink, ImageOff, Camera, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export type InstagramCardSize = "small" | "medium" | "large";

export interface InstagramFeedProps {
  /** Behold.so feed ID. Get one free at https://behold.so */
  feedId?: string;
  /** Instagram handle without @. Used for the title/CTA. */
  handle?: string;
  /** Section title. */
  title?: string;
  /** Section badge text. */
  badge?: string;
  /** CTA link (defaults to https://www.instagram.com/{handle}) */
  profileUrl?: string;
  /** Max posts to show (Behold returns up to 12 on free plan). */
  maxPosts?: number;
  /** Visual size of each card — controls how many columns the grid uses. */
  cardSize?: InstagramCardSize;
  /** IDs of pinned posts. Always rendered first, in this order. */
  favoritePostIds?: string[];
  /** CTA button text shown below the grid. */
  ctaText?: string;
  /** Optional subtitle shown next to the @handle. */
  subtitle?: string;
  /** When true, the live "pulse" indicator is shown next to the badge. */
  showLiveIndicator?: boolean;
}

interface BeholdPost {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  prunedCaption?: string;
  caption?: string;
  timestamp?: string;
  likes?: number;
  comments?: number;
  sizes?: {
    medium?: { mediaUrl: string };
    small?: { mediaUrl: string };
  };
  children?: { mediaUrl: string; mediaType: string }[];
}

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

interface InstagramCardProps {
  post: BeholdPost;
  index: number;
  isVideo: boolean;
  isFavorite?: boolean;
  thumb?: string;
  handle: string;
  onOpen: () => void;
}

/**
 * Single Instagram post card.
 *
 * Behavior:
 *  - Image posts: clicking the card opens the lightbox.
 *  - Video posts: hovering plays the video inline (muted, no zoom). The play
 *    button in the corner is the only element that opens the lightbox; the
 *    rest of the card is non-interactive while the preview is playing so the
 *    user can simply watch it.
 */
const InstagramCard = ({ post, index, isVideo, isFavorite, thumb, handle, onOpen }: InstagramCardProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Pause + reset on hover-out so the next hover starts from the beginning.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) {
      v.play().catch(() => {
        // Autoplay can fail on some browsers; the static thumb stays visible.
      });
    } else {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* noop */
      }
    }
  }, [hovered]);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen();
  };

  // For images: whole card opens lightbox.
  // For videos: card itself does NOT open lightbox — only the play button does.
  const cardClickProps = isVideo
    ? {}
    : { onClick: onOpen, role: "button" as const, tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); }
      } };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={cardVariant}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
      className={`group relative aspect-square overflow-hidden rounded-xl border bg-card text-left transition-all duration-300 ${
        isFavorite
          ? "border-primary/60 shadow-[0_0_0_1px_hsl(var(--primary)/0.3),0_15px_40px_-10px_hsl(var(--primary)/0.45)]"
          : "border-border shadow-md shadow-black/30 hover:border-primary hover:shadow-lg hover:shadow-primary/20"
      } ${isVideo ? "" : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"}`}
      aria-label={`Postagem ${index + 1} de @${handle}`}
      {...cardClickProps}
    >
      {/* Static thumbnail (always rendered; for videos it stays as poster fallback) */}
      {thumb ? (
        <img
          src={thumb}
          alt={post.prunedCaption || `Post de @${handle}`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            isVideo && hovered && videoReady ? "opacity-0" : "opacity-100"
          } ${isVideo ? "" : "group-hover:scale-[1.04] group-hover:brightness-95"}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-muted-foreground">
          <ImageOff size={28} />
        </div>
      )}

      {/* Inline video preview — only mounted for video posts, plays on hover */}
      {isVideo && (
        <video
          ref={videoRef}
          src={post.mediaUrl}
          poster={thumb}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            hovered && videoReady ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      )}

      {/* Favorite ribbon — top-left */}
      {isFavorite && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/30">
          <Star size={10} className="fill-primary-foreground" />
          Destaque
        </div>
      )}

      {/* REEL badge — for videos. Always visible, looks like Instagram's badge
          but in the site's primary palette so the section stays cohesive. */}
      {isVideo && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-lg pointer-events-none">
          <Play size={10} className="fill-primary text-primary" />
          Reel
        </div>
      )}

      {/* Play button — only for videos, opens the lightbox (zoom).
          Pulsing ring while idle to signal "click to expand". */}
      {isVideo && (
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label="Abrir vídeo em tela maior"
          className="absolute top-3 right-3 z-20 w-11 h-11 rounded-full bg-background/75 backdrop-blur-md grid place-items-center shadow-xl transition-all duration-200 hover:scale-110 hover:bg-primary/90 hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group/play"
        >
          <span className="absolute inset-0 rounded-full ring-2 ring-primary/40 animate-ping opacity-60" aria-hidden="true" />
          <Play size={16} className="text-primary fill-primary ml-0.5 transition-colors group-hover/play:text-primary-foreground group-hover/play:fill-primary-foreground relative z-10" />
        </button>
      )}

      {/* Hover overlay with likes/comments — hidden while video preview is playing
          so it doesn't cover the action */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none ${
          hovered && !(isVideo && videoReady) ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-4 text-white text-sm font-semibold">
          {typeof post.likes === "number" && (
            <span className="flex items-center gap-1.5">
              <Heart size={16} className="fill-white" />
              {formatCount(post.likes)}
            </span>
          )}
          {typeof post.comments === "number" && (
            <span className="flex items-center gap-1.5">
              <MessageCircle size={16} />
              {formatCount(post.comments)}
            </span>
          )}
          {typeof post.likes !== "number" && typeof post.comments !== "number" && post.prunedCaption && (
            <span className="line-clamp-2 text-white/90 font-normal">
              {post.prunedCaption}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};


const InstagramFeed = ({
  feedId,
  handle = "golfield.ferramentas",
  title = "Acompanhe a Golfield",
  badge = "Instagram",
  profileUrl,
  maxPosts = 9,
  cardSize = "medium",
  favoritePostIds = [],
  ctaText = "Ver mais no Instagram",
  subtitle = "Atualizado em tempo real",
  showLiveIndicator = true,
}: InstagramFeedProps) => {
  const [posts, setPosts] = useState<BeholdPost[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openPost, setOpenPost] = useState<BeholdPost | null>(null);

  const igUrl = profileUrl || `https://www.instagram.com/${handle}`;

  // Polling interval to fetch new posts in (near) real-time.
  // Behold caches its CDN aggressively but we still re-fetch every 60s and
  // also when the user returns to the tab so the feed never feels stale.
  const REFRESH_INTERVAL_MS = 60_000;

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    if (!feedId) {
      setLoading(false);
      setError("not-configured");
      return;
    }

    const load = (showSpinner: boolean) => {
      if (showSpinner) setLoading(true);
      setError(null);

      // Cache-bust query string forces a fresh response from Behold's CDN.
      fetch(`https://feeds.behold.so/${feedId}?_=${Date.now()}`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data) => {
          if (cancelled) return;
          const list: BeholdPost[] = Array.isArray(data?.posts) ? data.posts : [];

          // Re-order: favorites first (in admin-defined order), then the rest
          // (which Behold already returns newest-first).
          const favIds = favoritePostIds ?? [];
          const favSet = new Set(favIds);
          const byId = new Map(list.map((p) => [p.id, p]));
          const pinned = favIds
            .map((id) => byId.get(id))
            .filter((p): p is BeholdPost => Boolean(p));
          const rest = list.filter((p) => !favSet.has(p.id));
          const ordered = [...pinned, ...rest];

          setPosts(ordered.slice(0, maxPosts));
        })
        .catch((e) => {
          if (cancelled) return;
          console.error("[InstagramFeed] fetch error:", e);
          if (showSpinner) setError("fetch-failed");
        })
        .finally(() => {
          if (!cancelled && showSpinner) setLoading(false);
        });
    };

    // Initial load with spinner
    load(true);

    // Background refresh — silent (no skeleton flash)
    intervalId = setInterval(() => load(false), REFRESH_INTERVAL_MS);

    // Refresh when the tab regains focus
    const onVisible = () => {
      if (document.visibilityState === "visible") load(false);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [feedId, maxPosts, favoritePostIds]);

  // Map card size → tailwind grid columns. Smaller cards = more columns.
  const gridColsClass =
    cardSize === "small"
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      : cardSize === "large"
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  const gapClass = cardSize === "small" ? "gap-3 sm:gap-4" : "gap-4 sm:gap-5";

  return (
    <section
      id="instagram"
      data-edit-id="instagram.section"
      className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
    >
      {/* Ambient glow — gives the section a vibrant "alive" feel without
          breaking the dark sober palette of the rest of the site. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[420px] bg-primary/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="section-badge mb-6 inline-flex items-center gap-2">
            {showLiveIndicator && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
            {badge}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {title}
          </h2>
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base sm:text-lg font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            <span className="story-link">@{handle}</span>
            {subtitle && (
              <span className="text-xs text-muted-foreground/70 hidden sm:inline">
                · {subtitle}
              </span>
            )}
          </a>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className={`grid ${gridColsClass} ${gapClass}`}>
            {Array.from({ length: maxPosts }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl bg-muted/60" />
            ))}
          </div>
        )}

        {/* Error / not configured */}
        {!loading && (error || !posts || posts.length === 0) && (
          <div className="max-w-xl mx-auto text-center py-10 px-6 rounded-xl border border-border/40 bg-card">
            <Camera size={36} className="mx-auto mb-4 text-primary/70" />
            <p className="text-foreground font-semibold mb-2">
              {error === "not-configured"
                ? "Feed do Instagram em configuração"
                : "Não foi possível carregar o feed agora"}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              Enquanto isso, visite nosso perfil para ver as novidades.
            </p>
            <a href={igUrl} target="_blank" rel="noopener noreferrer" className="btn-golfield">
              {ctaText}
            </a>
          </div>
        )}

        {/* Grid */}
        {!loading && posts && posts.length > 0 && (
          <>
            <div className={`grid ${gridColsClass} ${gapClass}`}>
              {posts.map((post, i) => {
                const isVideo = post.mediaType === "VIDEO";
                const thumb =
                  post.thumbnailUrl ||
                  post.sizes?.medium?.mediaUrl ||
                  post.sizes?.small?.mediaUrl ||
                  post.mediaUrl;

                return (
                  <InstagramCard
                    key={post.id}
                    post={post}
                    index={i}
                    isVideo={isVideo}
                    isFavorite={(favoritePostIds ?? []).includes(post.id)}
                    thumb={thumb}
                    handle={handle}
                    onOpen={() => setOpenPost(post)}
                  />
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mt-12 sm:mt-14"
            >
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-golfield"
              >
                {ctaText}
              </a>
            </motion.div>
          </>
        )}
      </div>

      {/* Lightbox modal */}
      <Dialog open={!!openPost} onOpenChange={(o) => !o && setOpenPost(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border">
          {openPost && (
            <div className="flex flex-col">
              <div className="relative bg-black aspect-square sm:aspect-video w-full">
                {openPost.mediaType === "VIDEO" ? (
                  <video
                    src={openPost.mediaUrl}
                    poster={openPost.thumbnailUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={openPost.mediaUrl}
                    alt={openPost.prunedCaption || "Instagram post"}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                {openPost.prunedCaption && (
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed line-clamp-4">
                    {openPost.prunedCaption}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {typeof openPost.likes === "number" && (
                      <span className="flex items-center gap-1.5">
                        <Heart size={15} className="text-primary fill-primary" />
                        {formatCount(openPost.likes)}
                      </span>
                    )}
                    {typeof openPost.comments === "number" && (
                      <span className="flex items-center gap-1.5">
                        <MessageCircle size={15} className="text-primary" />
                        {formatCount(openPost.comments)}
                      </span>
                    )}
                  </div>
                  <a
                    href={openPost.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Abrir no Instagram
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default InstagramFeed;
