import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingCart, MessageCircle, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  const generateWhatsAppMessage = () => {
    let msg = "Olá! Gostaria de fazer um orçamento:\n\n";
    items.forEach(item => {
      msg += `• ${item.product.name} — ${item.quantity}un x R$${item.product.price.toFixed(2).replace('.', ',')} = R$${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });
    msg += `\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*`;
    return encodeURIComponent(msg);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingCart size={22} className="text-primary" />
                <h2 className="font-display text-xl font-bold">Orçamento</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {totalItems}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart size={48} className="mb-4 opacity-30" />
                  <p className="font-display text-lg">Seu orçamento está vazio</p>
                  <p className="text-sm mt-1">Adicione produtos para começar</p>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-4 rounded-xl bg-secondary/50 border border-border"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-contain rounded-lg bg-secondary p-2"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                        <p className="text-primary font-bold text-sm mt-1">
                          R$ {item.product.price.toFixed(2).replace('.', ',')} / un
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center bg-card rounded-lg overflow-hidden border border-border">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-muted transition-colors">
                              <Minus size={12} />
                            </button>
                            <span className="w-10 text-center text-xs font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-muted transition-colors">
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            = R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="self-start p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total estimado:</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <a
                  href={`https://wa.me/5511959409051?text=${generateWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-golfield w-full text-center"
                >
                  <MessageCircle size={18} />
                  Enviar Orçamento via WhatsApp
                </a>
                <button onClick={clearCart} className="w-full py-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
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
