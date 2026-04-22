import { memo, useState, forwardRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCardImpl = forwardRef<HTMLDivElement, ProductCardProps>(({ product, index }, _ref) => {
  const [qty, setQty] = useState(product.minQty);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const isMobile = useIsMobile();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={isMobile ? undefined : { rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-[0_25px_60px_-15px_hsl(0,78%,52%,0.12)] ${product.badge === "Mais Vendido" ? "gradient-border-animated" : ""}`}
    >
      <motion.div
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: "radial-gradient(ellipse at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(0,78%,52%,0.06), transparent 70%)"
        }}
      />

      <div className="relative aspect-square bg-secondary/20 flex items-center justify-center overflow-hidden">
        {product.badge && (
          <motion.span
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-[11px] font-semibold z-10 ${
              product.badge === "Novidade"
                ? "bg-primary text-primary-foreground"
                : "bg-card/90 backdrop-blur-sm text-foreground border border-border/50"
            }`}
          >
            {product.badge === "Mais Vendido" ? "⭐ " : "🆕 "}{product.badge}
          </motion.span>
        )}

        {product.mediaType === "video" ? (
          <motion.video
            src={product.image}
            className="w-full h-full object-contain p-4 sm:p-6"
            autoPlay
            muted={!(product.videoAudio ?? false)}
            loop={product.videoLoop ?? true}
            playsInline
            preload="metadata"
            whileHover={isMobile ? undefined : { scale: 1.12, rotate: 2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ) : (
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 sm:p-6"
            loading="lazy"
            decoding="async"
            whileHover={isMobile ? undefined : { scale: 1.12, rotate: 2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}

        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "linear-gradient(105deg, transparent 40%, hsl(0,0%,100%,0.04) 50%, transparent 60%)"
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
      </div>

      <div className="relative z-10 p-4 sm:p-5">
        <motion.h3 className="text-sm font-semibold leading-tight mb-1.5 line-clamp-2 min-h-[2.5rem] text-foreground/90 group-hover:text-foreground transition-colors duration-300">
          {product.name}
        </motion.h3>
        <p className="text-xs text-muted-foreground mb-4">
          Mín. {product.minQty} un. • Atacado
        </p>

        <div className="flex items-end justify-between mb-5">
          <div>
            <motion.p
              className="text-xl sm:text-2xl font-bold text-primary tracking-tight"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              R$ {product.price.toFixed(2).replace('.', ',')}
            </motion.p>
            <p className="text-[10px] text-muted-foreground mt-0.5">por unidade</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary/60 rounded-lg overflow-hidden border border-border/40 shrink-0">
            <motion.button
              whileTap={{ scale: 0.75 }}
              whileHover={isMobile ? undefined : { backgroundColor: "hsl(220,15%,15%)" }}
              onClick={() => setQty(Math.max(product.minQty, qty - product.minQty))}
              className="p-2 hover:bg-secondary transition-colors"
            >
              <Minus size={14} />
            </motion.button>
            <input
              type="number"
              value={qty}
              onChange={e => {
                const raw = parseInt(e.target.value);
                if (!Number.isFinite(raw) || raw <= 0) {
                  setQty(product.minQty);
                  return;
                }
                const step = product.minQty;
                if (raw < step) {
                  setQty(step);
                  toast.info(`Quantidade mínima é ${step} un.`);
                  return;
                }
                if (raw % step !== 0) {
                  const adjusted = raw + (step - (raw % step));
                  setQty(adjusted);
                  toast.info(`A quantidade deve ser múltipla de ${step}. Ajustei para ${adjusted}.`);
                  return;
                }
                setQty(raw);
              }}
              className="w-12 text-center bg-transparent text-sm font-medium outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.75 }}
              whileHover={isMobile ? undefined : { backgroundColor: "hsl(220,15%,15%)" }}
              onClick={() => setQty(qty + product.minQty)}
              className="p-2 hover:bg-secondary transition-colors"
            >
              <Plus size={14} />
            </motion.button>
          </div>
          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-400 ${
              added
                ? "bg-[hsl(142,70%,45%)] text-primary-foreground shadow-lg shadow-[hsl(142,70%,45%,0.3)]"
                : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
            }`}
          >
            {added ? (
              <>
                <motion.span initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Check size={15} />
                </motion.span>
                <span className="truncate">Adicionado!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                <span className="truncate">Adicionar</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Memoized so cart updates / parent re-renders don't re-render every card in the grid.
const ProductCard = memo(ProductCardImpl, (prev, next) =>
  prev.product.id === next.product.id &&
  prev.product.price === next.product.price &&
  prev.product.minQty === next.product.minQty &&
  prev.product.image === next.product.image &&
  prev.product.name === next.product.name &&
  prev.product.mediaType === next.product.mediaType &&
  prev.product.videoLoop === next.product.videoLoop &&
  prev.product.videoAudio === next.product.videoAudio &&
  prev.index === next.index
);

export default ProductCard;
