import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

interface RelatedProductsProps {
  baseProducts: Product[]; // produtos de referência (ex.: itens no carrinho)
  allProducts: Product[];  // catálogo completo
  title?: string;
  subtitle?: string;
  limit?: number;
}

/**
 * Recomenda produtos cruzados:
 * 1. Mesma categoria dos produtos-base (excluindo eles próprios)
 * 2. Ordena por proximidade de preço médio do carrinho
 * 3. Fallback: mais vendidos / aleatórios da loja
 */
const RelatedProducts = ({
  baseProducts,
  allProducts,
  title = "Você também pode gostar",
  subtitle = "Selecionados especialmente com base no seu interesse",
  limit = 4,
}: RelatedProductsProps) => {
  const recommended = useMemo(() => {
    if (!allProducts.length) return [];
    const baseIds = new Set(baseProducts.map(b => String(b.id)));
    const baseCats = new Set(baseProducts.map(b => b.category));
    const avgPrice = baseProducts.length
      ? baseProducts.reduce((s, p) => s + p.price, 0) / baseProducts.length
      : 0;

    const sameCategoryPool = allProducts
      .filter(p => !baseIds.has(String(p.id)) && baseCats.has(p.category));

    const scored = sameCategoryPool
      .map(p => ({ p, score: avgPrice ? Math.abs(p.price - avgPrice) : 0 }))
      .sort((a, b) => a.score - b.score);

    const result: Product[] = scored.slice(0, limit).map(s => s.p);

    // Fallback: se faltar, completa com mais vendidos / outros
    if (result.length < limit) {
      const usedIds = new Set([...baseIds, ...result.map(r => String(r.id))]);
      const fallback = allProducts
        .filter(p => !usedIds.has(String(p.id)))
        .sort((a, b) => {
          const aBest = a.badge === "Mais Vendido" ? 1 : 0;
          const bBest = b.badge === "Mais Vendido" ? 1 : 0;
          return bBest - aBest;
        })
        .slice(0, limit - result.length);
      result.push(...fallback);
    }

    return result;
  }, [baseProducts, allProducts, limit]);

  if (!recommended.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-12 sm:py-16"
      aria-labelledby="related-products-heading"
    >
      <div className="mb-8 sm:mb-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3"
        >
          <Sparkles size={14} />
          RECOMENDADOS PARA VOCÊ
        </motion.div>
        <h2 id="related-products-heading" className="text-2xl sm:text-3xl font-bold mb-2">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {recommended.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </motion.section>
  );
};

export default RelatedProducts;
