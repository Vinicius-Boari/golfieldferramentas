import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Play, Heart, MessageCircle, ExternalLink, ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const InstagramFeed = ({
  feedId,
  handle = "golfield.ferramentas",
  title = "Siga a gente no Instagram",
  badge = "Nossa Galeria",
  profileUrl,
  maxPosts = 9,
}: InstagramFeedProps) => {
  const [posts, setPosts] = useState<BeholdPost[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openPost, setOpenPost] = useState<BeholdPost | null>(null);

  const igUrl = profileUrl || `https://www.instagram.com/${handle}`;

  useEffect(() => {
    let cancelled = false;
    if (!feedId) {
      setLoading(false);
      setError("not-configured");
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`https://feeds.behold.so/${feedId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list: BeholdPost[] = Array.isArray(data?.posts) ? data.posts : [];
        setPosts(list.slice(0, maxPosts));
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[InstagramFeed] fetch error:", e);
        setError("fetch-failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [feedId, maxPosts]);

  return (
    <section
      id="instagram"
      data-edit-id="instagram.section"
      className="py-16 sm:py-20 md:py-24 relative border-t border-border/30"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="section-badge mb-6 inline-flex items-center gap-2">
            <Instagram size={14} />
            {badge}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {title}
          </h2>
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors text-base sm:text-lg story-link inline-block"
          >
            @{handle}
          </a>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: maxPosts }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        )}

        {/* Error / not configured */}
        {!loading && (error || !posts || posts.length === 0) && (
          <div className="max-w-xl mx-auto text-center py-10 px-6 rounded-2xl border border-border/40 bg-card/40">
            <Instagram size={36} className="mx-auto mb-4 text-primary/70" />
            <p className="text-foreground font-semibold mb-2">
              {error === "not-configured"
                ? "Feed do Instagram em configuração"
                : "Não foi possível carregar o feed agora"}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              Enquanto isso, visite nosso perfil para ver as novidades.
            </p>
            <a href={igUrl} target="_blank" rel="noopener noreferrer" className="btn-golfield">
              <Instagram size={18} />
              Abrir @{handle}
            </a>
          </div>
        )}

        {/* Grid */}
        {!loading && posts && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {posts.map((post, i) => {
                const isVideo = post.mediaType === "VIDEO";
                const thumb =
                  post.thumbnailUrl ||
                  post.sizes?.medium?.mediaUrl ||
                  post.sizes?.small?.mediaUrl ||
                  post.mediaUrl;

                return (
                  <motion.button
                    key={post.id}
                    type="button"
                    onClick={() => setOpenPost(post)}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    variants={cardVariant}
                    whileHover={{ y: -6 }}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card text-left product-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Ver postagem ${i + 1} de @${handle}`}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={post.prunedCaption || `Post de @${handle}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted-foreground">
                        <ImageOff size={28} />
                      </div>
                    )}

                    {/* Video play badge */}
                    {isVideo && (
                      <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/70 backdrop-blur-md border border-border/60 grid place-items-center shadow-lg">
                        <Play size={14} className="text-primary fill-primary ml-0.5" />
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <div className="flex items-center gap-4 text-foreground text-sm font-semibold">
                        {typeof post.likes === "number" && (
                          <span className="flex items-center gap-1.5">
                            <Heart size={16} className="text-primary fill-primary" />
                            {formatCount(post.likes)}
                          </span>
                        )}
                        {typeof post.comments === "number" && (
                          <span className="flex items-center gap-1.5">
                            <MessageCircle size={16} className="text-primary" />
                            {formatCount(post.comments)}
                          </span>
                        )}
                        {typeof post.likes !== "number" && typeof post.comments !== "number" && post.prunedCaption && (
                          <span className="line-clamp-2 text-foreground/90 font-normal">
                            {post.prunedCaption}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
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
                <Instagram size={18} />
                Ver mais no Instagram
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
