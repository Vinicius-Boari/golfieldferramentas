import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingCart, MessageCircle, Minus, Plus, LogIn } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const generateWhatsAppMessage = () => {
    let msg = "Olá! Gostaria de fazer um orçamento:\n\n";
    items.forEach(item => {
      msg += `• ${item.product.name} — ${item.quantity}un x R$${item.product.price.toFixed(2).replace('.', ',')} = R$${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });
    msg += `\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*`;
    return encodeURIComponent(msg);
  };

  const progressPercent = Math.min((totalPrice / 2000) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/70 backdrop-blur-md z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShoppingCart size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Orçamento</h2>
                  <p className="text-xs text-muted-foreground">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="p-6 rounded-2xl bg-secondary/30 mb-4">
                    <ShoppingCart size={40} className="opacity-20" />
                  </div>
                  <p className="font-semibold text-base">Seu orçamento está vazio</p>
                  <p className="text-sm mt-1 text-muted-foreground/70">Adicione produtos para começar</p>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/40 group/item hover:border-border transition-colors"
                    >
                      <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-secondary/50 p-1.5 flex items-center justify-center">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                        <p className="text-primary font-bold text-sm mt-0.5">
                          R$ {item.product.price.toFixed(2).replace('.', ',')} / un
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center bg-card rounded-lg overflow-hidden border border-border/50">
                            <button onClick={() => updateQuantity(item.product.id, Math.max(item.product.minQty, item.quantity - item.product.minQty))} className="p-1.5 hover:bg-secondary transition-colors">
                              <Minus size={11} />
                            </button>
                            <span className="w-9 text-center text-xs font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + item.product.minQty)} className="p-1.5 hover:bg-secondary transition-colors">
                              <Plus size={11} />
                            </button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            = R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="self-start p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-border space-y-4">
                {/* Progress bar */}
                {totalPrice < 2000 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progresso do pedido mínimo</span>
                      <span className="text-primary font-medium">{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Faltam <span className="text-primary font-medium">R$ {(2000 - totalPrice).toFixed(2).replace('.', ',')}</span> para enviar o orçamento
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Total estimado</span>
                  <span className="text-2xl font-bold text-primary tracking-tight">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {totalPrice >= 2000 ? (
                  isAuthenticated ? (
                    <motion.a
                      href={`https://wa.me/5511959409051?text=${generateWhatsAppMessage()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-golfield w-full text-center"
                    >
                      <MessageCircle size={18} />
                      Enviar Orçamento via WhatsApp
                    </motion.a>
                  ) : (
                    <motion.button
                      onClick={() => {
                        toast.error("Você precisa estar logado para enviar um orçamento.");
                        setIsOpen(false);
                        navigate("/login");
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                    >
                      <LogIn size={18} />
                      Faça login para enviar orçamento
                    </motion.button>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-secondary text-muted-foreground cursor-not-allowed text-sm font-semibold"
                  >
                    <MessageCircle size={18} />
                    Pedido mínimo R$ 2.000,00
                  </button>
                )}

                <button onClick={clearCart} className="w-full py-2 text-xs text-muted-foreground hover:text-destructive transition-colors">
                  Limpar orçamento
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
