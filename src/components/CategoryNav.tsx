import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories } from "@/data/products";

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full glass-card hover:bg-secondary transition-colors hidden md:flex items-center justify-center"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-2 md:px-12 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onCategoryChange(String(cat.id))}
            className={`category-chip ${activeCategory === cat.id ? "active" : ""}`}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full glass-card hover:bg-secondary transition-colors hidden md:flex items-center justify-center"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default CategoryNav;
