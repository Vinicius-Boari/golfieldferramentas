import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Heart, MessageCircle, ExternalLink, ImageOff, Camera } from "lucide-react";
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
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const InstagramFeed = ({
  feedId,
  handle = "golfield.ferramentas",
  title = "Acompanhe a Golfield",
  badge = "Instagram",
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
      className="py-16 sm:py-20 md:py-24 relative"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="section-badge mb-6 inline-flex">{badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {title}
          </h2>
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-base sm:text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            @{handle}
          </a>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
              Ver mais no Instagram
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
                  <InstagramCard
                    key={post.id}
                    post={post}
                    index={i}
                    isVideo={isVideo}
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
