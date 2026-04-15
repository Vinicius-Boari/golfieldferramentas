import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const [qty, setQty] = useState(product.minQty);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10 }}
      className="group gradient-card rounded-2xl border border-border overflow-hidden transition-shadow duration-500 hover:shadow-[0_25px_50px_-15px_hsl(0,85%,50%,0.15)] hover:border-primary/30"
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary/30 p-6 flex items-center justify-center overflow-hidden">
        {product.badge && (
          <motion.span
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold z-10 ${
              product.badge === "Novidade"
                ? "bg-primary text-primary-foreground"
                : "text-gradient-gold bg-secondary border border-border"
            }`}
          >
            {product.badge === "Mais Vendido" ? "⭐ " : "🆕 "}{product.badge}
          </motion.span>
        )}

        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-gold/5 transition-all duration-700" />

        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain"
          loading="lazy"
          whileHover={{ scale: 1.15, rotate: 2 }}
          transition={{ duration: 0.5 }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-display text-sm font-semibold leading-tight mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Mín. {product.minQty} un. • Atacado
        </p>

        <div className="flex items-end justify-between mb-4">
          <div>
            <motion.p
              className="text-2xl font-bold text-primary font-display"
              whileHover={{ scale: 1.05 }}
            >
              R$ {product.price.toFixed(2).replace('.', ',')}
            </motion.p>
            <p className="text-[10px] text-muted-foreground">por unidade</p>
          </div>
        </div>

        {/* Qty + Add */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg overflow-hidden border border-border/50">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => setQty(Math.max(product.minQty, qty - product.minQty))}
              className="p-2 hover:bg-muted transition-colors"
            >
              <Minus size={14} />
            </motion.button>
            <input
              type="number"
              value={qty}
              onChange={e => { const v = parseInt(e.target.value) || product.minQty; setQty(Math.max(product.minQty, Math.round(v / product.minQty) * product.minQty)); }}
              className="w-12 text-center bg-transparent text-sm font-medium outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => setQty(qty + product.minQty)}
              className="p-2 hover:bg-muted transition-colors"
            >
              <Plus size={14} />
            </motion.button>
          </div>
          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-500 ${
              added
                ? "bg-[hsl(142,70%,45%)] text-primary-foreground"
                : "gradient-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
            }`}
          >
            {added ? (
              <>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <Check size={15} />
                </motion.span>
                Adicionado!
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Adicionar
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
