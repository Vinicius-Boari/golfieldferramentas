import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2, Scale, Check, Minus } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";

const CompareDrawer = () => {
  const { items, isOpen, setIsOpen, remove, clear, max } = useCompare();
  const { addItem } = useCart();

  // Calcula valores min/max para destacar melhor preço/menor mínimo
  const minPrice = items.length ? Math.min(...items.map(i => i.price)) : 0;
  const minMinQty = items.length ? Math.min(...items.map(i => i.minQty)) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-2 sm:inset-x-4 top-4 bottom-4 sm:top-8 sm:bottom-8 max-w-6xl mx-auto bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/60 bg-gradient-to-br from-card to-secondary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Scale size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Comparar Produtos</h2>
                  <p className="text-xs text-muted-foreground">
                    {items.length} de {max} produtos selecionados
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clear}
                    className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 size={14} /> Limpar tudo
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Fechar comparador"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="p-6 rounded-full bg-secondary/40 mb-4">
                    <Scale size={48} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum produto para comparar</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Clique no ícone de balança nos produtos para adicioná-los à comparação (até {max}).
                  </p>
                </div>
              ) : (
                <div className={`grid gap-4 ${items.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : items.length === 2 ? "grid-cols-1 sm:grid-cols-2" : items.length <= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"}`}>
                  {items.map((p, idx) => {
                    const isBestPrice = items.length > 1 && p.price === minPrice;
                    const isLowestMinQty = items.length > 1 && p.minQty === minMinQty;
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative rounded-xl border border-border/60 bg-secondary/20 overflow-hidden flex flex-col"
                      >
                        <button
                          onClick={() => remove(p.id)}
                          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-card/90 backdrop-blur hover:bg-destructive hover:text-destructive-foreground transition-all shadow"
                          aria-label="Remover do comparador"
                        >
                          <X size={14} />
                        </button>

                        <div className="aspect-square bg-card flex items-center justify-center p-4">
                          {p.mediaType === "video" ? (
                            <video src={p.image} className="w-full h-full object-contain" muted autoPlay loop playsInline />
                          ) : (
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
                          )}
                        </div>

                        <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{p.category}</p>
                            <h3 className="text-sm font-semibold leading-tight line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                          </div>

                          <dl className="space-y-2 text-xs">
                            <div className="flex justify-between items-center pt-2 border-t border-border/40">
                              <dt className="text-muted-foreground">Preço unit.</dt>
                              <dd className={`font-bold ${isBestPrice ? "text-[hsl(142,70%,45%)]" : "text-foreground"}`}>
                                {isBestPrice && <Check size={12} className="inline mr-1" />}
                                R$ {p.price.toFixed(2).replace(".", ",")}
                              </dd>
                            </div>
                            <div className="flex justify-between items-center">
                              <dt className="text-muted-foreground">Mínimo</dt>
                              <dd className={`font-medium ${isLowestMinQty ? "text-[hsl(142,70%,45%)]" : ""}`}>
                                {p.minQty} un.
                              </dd>
                            </div>
                            <div className="flex justify-between items-center">
                              <dt className="text-muted-foreground">Total mín.</dt>
                              <dd className="font-medium">
                                R$ {(p.price * p.minQty).toFixed(2).replace(".", ",")}
                              </dd>
                            </div>
                            {p.badge && (
                              <div className="flex justify-between items-center">
                                <dt className="text-muted-foreground">Destaque</dt>
                                <dd className="font-medium text-primary">{p.badge}</dd>
                              </div>
                            )}
                          </dl>

                          <button
                            onClick={() => { addItem(p, p.minQty); }}
                            className="mt-auto flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                          >
                            <ShoppingCart size={13} /> Adicionar
                          </button>
                          <button
                            onClick={() => remove(p.id)}
                            className="sm:hidden flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Minus size={12} /> Remover
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompareDrawer;
