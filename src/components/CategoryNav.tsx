import { useRef, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

const isUsableImage = (url: unknown): url is string =>
  typeof url === "string" && url.trim() !== "" && !url.includes("placeholder");

// Componente de imagem com fallback automático para ícone
const CategoryImage = ({ src, alt }: { src: string | null; alt: string }) => {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/40">
        <Layers size={28} className="text-muted-foreground" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
  );
};
import { useProducts } from "@/hooks/useProducts";

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: products = [] } = useProducts();

  const normalizeCategory = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

  const categories = useMemo(() => {
    // Mapeia cada categoria para a primeira imagem utilizável (qualquer media_type, desde que tenha thumbnail)
    const map = new Map<string, { label: string; image: string | null }>();
    for (const p of products) {
      const cat = (p.category ?? "").toString().trim();
      if (!cat) continue;
      const candidate = isUsableImage(p.image) ? p.image : null;
      const cur = map.get(cat);
      if (!cur) {
        map.set(cat, { label: cat, image: candidate });
      } else if (!cur.image && candidate) {
        map.set(cat, { ...cur, image: candidate });
      }
    }

    const list = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
      .map(([cat, info]) => ({
        id: normalizeCategory(cat),
        label: info.label,
        image: info.image,
      }));

    // Imagem para "Todos": primeira imagem utilizável encontrada
    const firstImage = products.find(p => isUsableImage(p.image))?.image ?? null;

    return [
      { id: "todos", label: "Todos", image: firstImage ?? null },
      ...list,
    ];
  }, [products]);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
    }
  };

  return (
    <div className="relative md:px-12">
      <button
        onClick={() => scroll("left")}
        aria-label="Rolar categorias para a esquerda"
        className="absolute left-0 top-[44px] sm:top-[52px] -translate-y-1/2 z-10 p-2 rounded-full glass-card hover:bg-secondary transition-colors hidden md:flex items-center justify-center"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto px-1 sm:px-2 py-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              onClick={() => onCategoryChange(String(cat.id))}
              className="shrink-0 snap-start flex flex-col items-center gap-2 group focus:outline-none"
              aria-pressed={isActive}
            >
              <div
                className={`relative rounded-full overflow-hidden transition-all duration-300 w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] flex items-center justify-center bg-secondary/50 ${
                  isActive
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_8px_24px_-6px_hsl(0,78%,52%,0.55)]"
                    : "ring-1 ring-border/60 group-hover:ring-primary/50"
                }`}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <Layers size={28} className="text-muted-foreground" />
                )}
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none" />
                )}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium text-center max-w-[88px] sm:max-w-[104px] leading-tight line-clamp-2 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {cat.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={() => scroll("right")}
        aria-label="Rolar categorias para a direita"
        className="absolute right-0 top-[44px] sm:top-[52px] -translate-y-1/2 z-10 p-2 rounded-full glass-card hover:bg-secondary transition-colors hidden md:flex items-center justify-center"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default CategoryNav;
