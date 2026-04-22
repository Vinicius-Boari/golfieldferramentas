import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingCart, MessageCircle, Minus, Plus, LogIn, Tag, Loader2, Check, AlertCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { useValidateCoupon } from "@/hooks/useCoupons";
import { useHomeConfig } from "@/hooks/useHomeConfig";
import { renderWhatsAppTemplate } from "@/components/admin/SystemSettingsPanel";
import { supabase } from "@/integrations/supabase/client";
import { formatCNPJ } from "@/lib/cnpj";
import type { Product } from "@/data/products";

interface CartDrawerProps {
  relatedProducts?: Product[];
}

const CartDrawer = ({ relatedProducts = [] }: CartDrawerProps) => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice, clearCart, appliedCoupon, setAppliedCoupon, finalPrice, addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { data: homeConfig } = useHomeConfig();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const validateCoupon = useValidateCoupon();
  const [profile, setProfile] = useState<{ nome_responsavel?: string; telefone?: string; email?: string; cnpj?: string; razao_social?: string } | null>(null);

  // Load profile data for template variables when authenticated
  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) { setProfile(null); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("nome_responsavel,telefone,email,cnpj,razao_social")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setProfile(data ?? { email: user.email ?? "" });
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const generateWhatsAppMessage = () => {
    const productsText = items
      .map(item => `• ${item.product.name} — ${item.quantity}un x R$${item.product.price.toFixed(2).replace('.', ',')} = R$${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}`)
      .join("\n");

    const customCfg = homeConfig?.systemSettings?.whatsappMessage;
    if (customCfg?.enabled && customCfg.template?.trim()) {
      const data: Record<string, string> = {
        name: profile?.nome_responsavel || "",
        razao_social: profile?.razao_social || "",
        phone: profile?.telefone || "",
        email: profile?.email || "",
        cnpj: profile?.cnpj ? formatCNPJ(profile.cnpj) : "",
        products: productsText,
        subtotal: `R$ ${totalPrice.toFixed(2).replace('.', ',')}`,
        total: `R$ ${finalPrice.toFixed(2).replace('.', ',')}`,
        coupon: appliedCoupon ? `${appliedCoupon.code} (-R$ ${appliedCoupon.discount_amount.toFixed(2).replace('.', ',')})` : "",
        date: new Date().toLocaleDateString("pt-BR"),
      };
      return encodeURIComponent(renderWhatsAppTemplate(customCfg.template, data));
    }

    let msg = t("cart.waGreeting") + "\n\n" + productsText;
    msg += `\n\n*Subtotal: R$ ${totalPrice.toFixed(2).replace('.', ',')}*`;
    if (appliedCoupon) {
      msg += `\n*Cupom: ${appliedCoupon.code} (-R$ ${appliedCoupon.discount_amount.toFixed(2).replace('.', ',')})*`;
      msg += `\n*Total: R$ ${finalPrice.toFixed(2).replace('.', ',')}*`;
    }
    return encodeURIComponent(msg);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");

    const cartItems = items.map(i => ({
      product_id: String(i.product.id),
      category: (i.product as any).category || "",
      price: i.product.price,
      quantity: i.quantity,
    }));

    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        cart_items: cartItems,
        order_total: totalPrice,
      });

      if (result.valid && result.coupon && result.discount_amount !== undefined) {
        setAppliedCoupon({
          id: result.coupon.id,
          code: result.coupon.code,
          name: result.coupon.name,
          discount_type: result.coupon.discount_type,
          discount_value: result.coupon.discount_value,
          discount_amount: result.discount_amount,
        });
        setCouponCode("");
        setCouponError("");
        toast.success(t("cart.couponApplied"));
      } else {
        setCouponError(result.reason || t("cart.couponInvalid"));
      }
    } catch {
      setCouponError(t("cart.couponError"));
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    toast.info(t("cart.couponRemoved"));
  };

  const progressPercent = Math.min((totalPrice / 2000) * 100, 100);

  // Cross-sell: produtos da mesma categoria dos itens no carrinho, próximos do preço médio
  const recommendations = useMemo(() => {
    if (!relatedProducts.length || items.length === 0) return [];
    const cartIds = new Set(items.map(i => String(i.product.id)));
    const cartCats = new Set(items.map(i => i.product.category));
    const avgPrice = items.reduce((s, i) => s + i.product.price, 0) / items.length;
    const sameCategory = relatedProducts
      .filter(p => !cartIds.has(String(p.id)) && cartCats.has(p.category))
      .map(p => ({ p, score: Math.abs(p.price - avgPrice) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(s => s.p);
    if (sameCategory.length < 3) {
      const used = new Set([...cartIds, ...sameCategory.map(s => String(s.id))]);
      const fallback = relatedProducts.filter(p => !used.has(String(p.id))).slice(0, 3 - sameCategory.length);
      return [...sameCategory, ...fallback];
    }
    return sameCategory;
  }, [items, relatedProducts]);

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
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <ShoppingCart size={18} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold tracking-tight">{t("cart.title")}</h2>
                  <p className="text-xs text-muted-foreground">{totalItems} {totalItems === 1 ? t("cart.item") : t("cart.items")}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="p-6 rounded-2xl bg-secondary/30 mb-4">
                    <ShoppingCart size={40} className="opacity-20" />
                  </div>
                  <p className="font-semibold text-base text-center">{t("cart.empty")}</p>
                  <p className="text-sm mt-1 text-muted-foreground/70 text-center">{t("cart.emptyHint")}</p>
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
                      <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-secondary/50 p-1.5 flex items-center justify-center overflow-hidden">
                        {item.product.mediaType === "video" ? (
                          <video
                            src={item.product.image}
                            className="w-full h-full object-contain"
                            muted={!(item.product.videoAudio ?? false)}
                            loop={item.product.videoLoop ?? true}
                            playsInline
                            autoPlay
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                        <p className="text-primary font-bold text-sm mt-0.5">
                          R$ {item.product.price.toFixed(2).replace('.', ',')} / un
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <div className="flex items-center bg-card rounded-lg overflow-hidden border border-border/50 shrink-0">
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
                      <button onClick={() => removeItem(item.product.id)} className="self-start p-1.5 rounded-lg opacity-100 sm:opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Cross-sell recommendations */}
              {recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="pt-4 mt-2 border-t border-border/50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("cart.recommendations")}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {recommendations.map(p => (
                      <motion.button
                        key={p.id}
                        whileHover={{ x: 2 }}
                        onClick={() => { addItem(p, p.minQty); toast.success(t("cart.addedToast", { name: p.name })); }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-border/30 hover:border-primary/30 transition-all text-left group/rec"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-lg bg-card p-1 flex items-center justify-center overflow-hidden">
                          {p.mediaType === "video" ? (
                            <video src={p.image} className="w-full h-full object-contain" muted autoPlay loop playsInline />
                          ) : (
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-2 leading-tight group-hover/rec:text-foreground">{p.name}</p>
                          <p className="text-xs text-primary font-bold mt-0.5">
                            R$ {p.price.toFixed(2).replace(".", ",")} <span className="text-muted-foreground font-normal">/ un</span>
                          </p>
                        </div>
                        <Plus size={14} className="text-muted-foreground shrink-0 group-hover/rec:text-primary transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-border space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {/* Coupon Section */}
                <div className="space-y-2">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <Check size={16} className="text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary truncate">{t("cart.title")} {appliedCoupon.code}</p>
                          <p className="text-xs text-muted-foreground">-R$ {appliedCoupon.discount_amount.toFixed(2).replace(".", ",")}</p>
                        </div>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2">
                        {t("cart.remove")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder={t("cart.couponPlaceholder")}
                          value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors font-mono uppercase"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApplyCoupon}
                        disabled={validateCoupon.isPending || !couponCode.trim()}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 shrink-0"
                      >
                        {validateCoupon.isPending ? <Loader2 size={14} className="animate-spin" /> : t("cart.apply")}
                      </motion.button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle size={12} /> {couponError}
                    </p>
                  )}
                </div>

                {totalPrice < 2000 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs gap-3">
                      <span className="text-muted-foreground">{t("cart.minProgress")}</span>
                      <span className="text-primary font-medium shrink-0">{progressPercent.toFixed(0)}%</span>
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
                      {t("cart.minMissing", { value: `R$ ${(2000 - totalPrice).toFixed(2).replace('.', ',')}` })}
                    </p>
                  </div>
                )}

                <div className="space-y-1 py-2">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs text-muted-foreground">{t("cart.subtotal")}</span>
                    <span className="text-sm font-medium">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs text-primary">{t("cart.discount")}</span>
                      <span className="text-sm font-medium text-primary">-R$ {Math.min(appliedCoupon.discount_amount, totalPrice).toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center gap-4 pt-1 border-t border-border/40">
                    <span className="text-sm text-muted-foreground">{t("cart.total")}</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary tracking-tight text-right">
                      R$ {finalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {totalPrice >= 2000 ? (
                  (() => {
                    const requireLogin = homeConfig?.systemSettings?.quoteAccess?.requireLoginForWhatsApp ?? true;
                    const canSend = !requireLogin || isAuthenticated;
                    if (canSend) {
                      return (
                        <motion.a
                          href={`https://wa.me/5511959409051?text=${generateWhatsAppMessage()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="gradient-border-animated btn-golfield w-full text-center justify-center"
                        >
                          <MessageCircle size={18} />
                          {t("cart.sendWhatsApp")}
                        </motion.a>
                      );
                    }
                    return (
                      <div className="space-y-2">
                        <div className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-xs text-foreground/80 flex items-start gap-2">
                          <LogIn size={14} className="text-primary shrink-0 mt-0.5" />
                          <span>{t("cart.loginRequiredHint")}</span>
                        </div>
                        <motion.button
                          onClick={() => {
                            toast.error(t("cart.loginToast"));
                            setIsOpen(false);
                            navigate("/login");
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                        >
                          <LogIn size={18} />
                          {t("cart.loginButton")}
                        </motion.button>
                      </div>
                    );
                  })()
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-secondary text-muted-foreground cursor-not-allowed text-sm font-semibold"
                  >
                    <MessageCircle size={18} />
                    {t("cart.minOrderValue")}
                  </button>
                )}

                <button onClick={clearCart} className="w-full py-2 text-xs text-muted-foreground hover:text-destructive transition-colors">
                  {t("cart.clear")}
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
