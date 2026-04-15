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
      scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card border border-border hover:bg-secondary transition-colors hidden md:flex"
      >
        <ChevronLeft size={18} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-2 md:px-10 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(cat.id)}
            className={`category-chip ${activeCategory === cat.id ? "active" : ""}`}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.name}
          </motion.button>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card border border-border hover:bg-secondary transition-colors hidden md:flex"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default CategoryNav;
