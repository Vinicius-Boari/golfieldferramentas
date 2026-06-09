import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Camera, ExternalLink } from "lucide-react";

interface BeholdPost {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  prunedCaption?: string;
  sizes?: {
    medium?: { mediaUrl: string };
    small?: { mediaUrl: string };
  };
}

interface Props {
  feedId?: string;
  handle?: string;
  /** Pinned post IDs — rendered first when present. */
  favoritePostIds?: string[];
  /** Number of thumbs to display (defaults to 6). */
  maxPosts?: number;
  /** CTA button text (defaults to "Ver mais no Instagram"). */
  ctaText?: string;
}

/**
 * Compact, splash-friendly Instagram strip.
 *
 * Renders a small horizontal grid of recent posts from the same Behold feed
 * used on the homepage, plus a button that opens the Instagram profile in a
 * new tab. Designed to live INSIDE the splash card — no section title, no
 * lightbox, no heavy chrome — just a teaser that invites the visitor to
 * follow the brand on Instagram while the splash content is playing.
 */
const SplashInstagramStrip = ({
  feedId,
  handle = "golfield.ferramentas",
  favoritePostIds = [],
  maxPosts = 6,
  ctaText = "Ver mais no Instagram",
}: Props) => {
  const [posts, setPosts] = useState<BeholdPost[] | null>(null);
  const [error, setError] = useState(false);
  const igUrl = `https://www.instagram.com/${handle}`;

  useEffect(() => {
    if (!feedId) {
      setError(true);
      return;
    }
    let cancelled = false;
    fetch(`https://feeds.behold.so/${feedId}?_=${Date.now()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list: BeholdPost[] = Array.isArray(data?.posts) ? data.posts : [];
        const favSet = new Set(favoritePostIds);
        const byId = new Map(list.map((p) => [p.id, p]));
        const pinned = favoritePostIds
          .map((id) => byId.get(id))
          .filter((p): p is BeholdPost => Boolean(p));
        const rest = list.filter((p) => !favSet.has(p.id));
        setPosts([...pinned, ...rest].slice(0, maxPosts));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [feedId, maxPosts, favoritePostIds]);

  // Hide the strip entirely if we have nothing to show — keeps the splash clean.
  if (error || (posts && posts.length === 0)) {
    return (
      <div className="pt-2 flex justify-center">
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 hover:brightness-110 shadow-[0_15px_40px_-5px_rgba(239,68,68,0.4)] border border-white/20"

          style={{
            background: "linear-gradient(135deg, #FF4D4D 0%, #E63946 100%)",

            color: "#FFFFFF",
          }}
        >
          <Camera size={14} />
          {ctaText}
          <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-3">
      {/* Tiny header */}
      <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "#AAAAAA" }}>
        <Camera size={12} />
        <span>@{handle}</span>
      </div>

      {/* Compact strip — 6 thumbs, responsive */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
        {(posts ?? Array.from({ length: maxPosts })).map((post, i) => (
          <Thumb key={(post as BeholdPost)?.id ?? i} post={post as BeholdPost | undefined} index={i} igUrl={igUrl} />
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-1">
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 hover:brightness-110 shadow-[0_15px_40px_-5px_rgba(239,68,68,0.4)] border border-white/20"
          style={{
            background: "linear-gradient(135deg, #FF4D4D 0%, #E63946 100%)",
            color: "#FFFFFF",
          }}
        >
          <Camera size={14} />
          {ctaText}
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

const Thumb = ({ post, index, igUrl }: { post?: BeholdPost; index: number; igUrl: string }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) {
      v.play().catch(() => {});
    } else {
      v.pause();
      try { v.currentTime = 0; } catch { /* noop */ }
    }
  }, [hovered]);

  if (!post) {
    // Skeleton while loading
    return <div className="aspect-square rounded-lg bg-white/5 animate-pulse" />;
  }

  const isVideo = post.mediaType === "VIDEO";
  const thumb =
    post.thumbnailUrl ||
    post.sizes?.small?.mediaUrl ||
    post.sizes?.medium?.mediaUrl ||
    post.mediaUrl;

  return (
    <motion.a
      href={post.permalink || igUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-black/40"
    >
      {thumb && (
        <img
          src={thumb}
          alt={post.prunedCaption || "Post do Instagram"}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
            isVideo && hovered && videoReady ? "opacity-0" : "opacity-100"
          } group-hover:scale-[1.05]`}
        />
      )}
      {isVideo && (
        <>
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
              hovered && videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm grid place-items-center pointer-events-none">
            <Play size={9} className="text-white fill-white ml-0.5" />
          </div>
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.a>
  );
};

export default SplashInstagramStrip;
