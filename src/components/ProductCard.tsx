import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const [qty, setQty] = useState(product.minQty);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product, qty);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index % 4 * 0.1 }}
      className="group gradient-card rounded-2xl border border-border overflow-hidden product-card-hover"
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary/30 p-6 flex items-center justify-center overflow-hidden">
        {product.badge && (
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold z-10 ${
            product.badge === "Novidade" 
              ? "bg-primary text-primary-foreground" 
              : "text-gradient-gold bg-secondary border border-border"
          }`}>
            {product.badge === "Mais Vendido" ? "⭐ " : "🆕 "}{product.badge}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-display text-sm font-semibold leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Mín. {product.minQty} un. • Atacado
        </p>

        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-primary font-display">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[10px] text-muted-foreground">por unidade</p>
          </div>
        </div>

        {/* Qty + Add */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg overflow-hidden">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-2 hover:bg-muted transition-colors"
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center bg-transparent text-sm font-medium outline-none"
            />
            <button
              onClick={() => setQty(qty + 1)}
              className="p-2 hover:bg-muted transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 gradient-primary rounded-lg text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all duration-300 active:scale-95"
          >
            <ShoppingCart size={15} />
            Adicionar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
