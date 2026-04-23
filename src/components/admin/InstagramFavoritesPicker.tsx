import { useEffect, useState } from "react";
import { Star, Loader2, ChevronUp, ChevronDown, X, Play } from "lucide-react";

interface BeholdPost {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnailUrl?: string;
  mediaUrl: string;
  prunedCaption?: string;
  sizes?: { small?: { mediaUrl: string }; medium?: { mediaUrl: string } };
}

interface Props {
  feedId: string;
  favoriteIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Admin-only widget: lists posts pulled from Behold.so so the admin can pin
 * favorites. Pinned posts always render first on the public feed in the order
 * they were added.
 */
const InstagramFavoritesPicker = ({ feedId, favoriteIds, onChange }: Props) => {
  const [posts, setPosts] = useState<BeholdPost[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!feedId) {
      setPosts(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`https://feeds.behold.so/${feedId}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        setPosts(Array.isArray(data?.posts) ? data.posts : []);
      })
      .catch(e => {
        if (cancelled) return;
        console.error("[FavoritesPicker] fetch failed:", e);
        setError("fetch-failed");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [feedId]);

  const toggleFavorite = (id: string) => {
    if (favoriteIds.includes(id)) {
      onChange(favoriteIds.filter(x => x !== id));
    } else {
      onChange([...favoriteIds, id]);
    }
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = favoriteIds.indexOf(id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= favoriteIds.length) return;
    const next = [...favoriteIds];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
  };

  const thumbOf = (p: BeholdPost) =>
    p.thumbnailUrl || p.sizes?.small?.mediaUrl || p.sizes?.medium?.mediaUrl || p.mediaUrl;

  return (
    <div className="border-t border-border/40 pt-5 mt-2">
      <div className="flex items-center gap-2 mb-1">
        <Star size={14} className="text-primary" />
        <h3 className="text-sm font-bold">Postagens favoritadas</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Posts marcados aqui aparecem <strong className="text-foreground">primeiro</strong> na ordem definida.
        Os demais seguem em ordem cronológica (mais recentes primeiro).
      </p>

      {!feedId && (
        <div className="text-xs text-muted-foreground italic px-3 py-4 rounded-xl border border-dashed border-border/40">
          Cole o Feed ID acima para carregar suas postagens.
        </div>
      )}

      {feedId && loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Loader2 size={14} className="animate-spin" /> Carregando postagens...
        </div>
      )}

      {feedId && error && (
        <div className="text-xs text-destructive px-3 py-3 rounded-xl bg-destructive/5 border border-destructive/20">
          Não foi possível carregar o feed. Verifique o Feed ID.
        </div>
      )}

      {feedId && !loading && posts && posts.length > 0 && (
        <>
          {/* Current favorites order */}
          {favoriteIds.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Ordem dos favoritos ({favoriteIds.length})
              </p>
              <div className="space-y-2">
                {favoriteIds.map((id, i) => {
                  const p = posts.find(x => x.id === id);
                  const thumb = p ? thumbOf(p) : undefined;
                  return (
                    <div key={id} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/40 border border-border/40">
                      <span className="text-xs font-bold text-primary w-5 text-center">{i + 1}</span>
                      {thumb ? (
                        <img src={thumb} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted grid place-items-center text-[10px] text-muted-foreground">?</div>
                      )}
                      <span className="flex-1 text-xs text-muted-foreground line-clamp-1">
                        {p?.prunedCaption || (p ? "Sem legenda" : "Post não está mais no feed")}
                      </span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => move(id, -1)} disabled={i === 0}
                          className="p-1.5 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                          <ChevronUp size={14} />
                        </button>
                        <button type="button" onClick={() => move(id, 1)} disabled={i === favoriteIds.length - 1}
                          className="p-1.5 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                          <ChevronDown size={14} />
                        </button>
                        <button type="button" onClick={() => toggleFavorite(id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selectable thumbnails grid */}
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Postagens disponíveis ({posts.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {posts.map(p => {
              const isFav = favoriteIds.includes(p.id);
              const thumb = thumbOf(p);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleFavorite(p.id)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    isFav ? "border-primary ring-2 ring-primary/30" : "border-border/40 hover:border-primary/50"
                  }`}
                  title={p.prunedCaption || "Postagem"}
                >
                  {thumb && (
                    <img src={thumb} alt="" loading="lazy" className="w-full h-full object-cover" />
                  )}
                  {p.mediaType === "VIDEO" && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/70 backdrop-blur-md grid place-items-center">
                      <Play size={9} className="text-primary fill-primary ml-px" />
                    </div>
                  )}
                  <div className={`absolute inset-0 transition-opacity ${
                    isFav ? "bg-primary/40 opacity-100" : "bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/20"
                  }`} />
                  {isFav && (
                    <div className="absolute bottom-1 left-1 w-6 h-6 rounded-full bg-primary grid place-items-center shadow-lg">
                      <Star size={11} className="text-primary-foreground fill-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default InstagramFavoritesPicker;
