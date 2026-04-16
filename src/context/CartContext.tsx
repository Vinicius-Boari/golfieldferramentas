import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Product } from "@/data/products";

interface CartItem {
  product: Product;
  quantity: number;
}

interface AppliedCoupon {
  id: string;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, qty: number) => void;
  removeItem: (productId: number | string) => void;
  updateQuantity: (productId: number | string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  finalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const addItem = useCallback((product: Product, qty: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { product, quantity: qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: number | string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number | string, qty: number) => {
    setItems(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (!item || qty < item.product.minQty) {
        return prev.filter(i => i.product.id !== productId);
      }
      return prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  // Invalidate coupon when cart changes significantly
  useEffect(() => {
    if (appliedCoupon && items.length === 0) {
      setAppliedCoupon(null);
    }
  }, [items, appliedCoupon]);

  const discountAmount = appliedCoupon ? Math.min(appliedCoupon.discount_amount, totalPrice) : 0;
  const finalPrice = Math.max(0, Math.round((totalPrice - discountAmount) * 100) / 100);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen, appliedCoupon, setAppliedCoupon, finalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
